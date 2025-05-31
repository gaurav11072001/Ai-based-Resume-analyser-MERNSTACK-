const Resume = require('../models/Resume');
const Job = require('../models/Job');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const geminiService = require('../services/geminiService');

// @desc    Get job recommendations based on resume
// @route   GET /api/resumes/:id/jobs
// @access  Private
exports.getRecommendedJobs = async (req, res) => {
  try {
    console.log('Starting getRecommendedJobs...');
    console.log('Getting job recommendations...');
    const { id } = req.params;
    
    // Get the resume from the database
    const resume = await Resume.findById(id).select('+content +analysis');
    console.log('Found resume:', resume ? 'yes' : 'no');
    console.log('Full resume object:', JSON.stringify(resume, null, 2));
    console.log('Resume content:', resume?.content ? 'exists' : 'missing');
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check if the resume belongs to the requesting user
    if (resume.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this resume' });
    }

    // Check if resume has content
    if (!resume.content) {
      console.error('Resume content is missing');
      return res.status(400).json({ message: 'Resume content is missing. Please re-upload the resume.' });
    }

    // Get job recommendations based on the resume text
    console.log('Getting job recommendations for resume content:', resume.content.substring(0, 100) + '...');
    const jobs = await geminiService.getJobRecommendations(resume.content);
    console.log('Got jobs:', jobs.length);
    res.json(jobs);
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error getting job recommendations', error: error.message });
  }
};

// Initialize Gemini AI
// Make sure to use the API key directly if process.env is not loading correctly
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyC1JCb-gYPMF5tftgs7fFHUsK4VZHvAIcI';
const genAI = new GoogleGenerativeAI(apiKey);
console.log('Initializing Gemini AI with API key:', apiKey.substring(0, 8) + '...');

// Helper function to extract text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Helper function to retry API calls with exponential backoff
const retryWithBackoff = async (apiCallFn, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCallFn();
    } catch (error) {
      console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);
      lastError = error;
      // Exponential backoff with jitter
      const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 100, 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// Helper function to analyze resume with Gemini AI
const analyzeResumeWithGemini = async (resumeText) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,  // Lower temperature for more consistent results
        maxOutputTokens: 8192,
      }
    });

    // Construct the prompt for ATS compatibility analysis
    const atsPrompt = `
      You are an expert resume analyzer. Analyze the following resume for ATS (Applicant Tracking System) compatibility.
      
      Instructions:
      1. Evaluate the resume's compatibility with ATS systems
      2. Provide a score from 0-100 (where 100 is perfect)
      3. Give specific, actionable suggestions for improvement
      4. Focus on format, content, keywords, and overall structure
      
      Resume text:
      ${resumeText}
      
      IMPORTANT: You MUST return ONLY valid JSON in the following format with no additional text, markdown, or explanations:
      {
        "atsScore": number,
        "suggestions": [
          {
            "category": "format|content|keywords|grammar|other",
            "text": "suggestion text",
            "priority": "high|medium|low"
          }
        ]
      }
    `;

    // Generate ATS analysis with retry mechanism
    const atsResult = await retryWithBackoff(async () => {
      const result = await model.generateContent(atsPrompt);
      if (!result || !result.response) {
        throw new Error('Empty response from Gemini API');
      }
      return result;
    });
    const atsResponse = atsResult.response;
    let atsAnalysis;
    
    try {
      // Clean the response text to ensure it's valid JSON
      let responseText = atsResponse.text().trim();
      
      // Remove any markdown code block markers if present
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\n|```$/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\n|```$/g, '');
      }
      
      // Parse the JSON
      atsAnalysis = JSON.parse(responseText);
      
      // Validate the structure
      if (typeof atsAnalysis.atsScore !== 'number' || !Array.isArray(atsAnalysis.suggestions)) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure score is within range
      if (atsAnalysis.atsScore < 0 || atsAnalysis.atsScore > 100) {
        atsAnalysis.atsScore = Math.max(0, Math.min(100, atsAnalysis.atsScore || 50));
      }
      
      // Ensure suggestions have required fields
      atsAnalysis.suggestions = atsAnalysis.suggestions.map(suggestion => ({
        category: suggestion.category || 'other',
        text: suggestion.text || 'Improve this section of your resume.',
        priority: suggestion.priority || 'medium'
      }));
      
    } catch (parseError) {
      console.error('Error parsing ATS analysis JSON:', parseError);
      console.log('Raw response:', atsResponse.text());
      // Provide default values if parsing fails
      atsAnalysis = {
        atsScore: 50,
        suggestions: [{
          category: "content",
          text: "Unable to analyze resume properly. Please try again with a different format or content.",
          priority: "medium"
        }]
      };
    }

    // Construct the prompt for skills and experience extraction
    const extractionPrompt = `
      You are an expert resume parser. Extract the following information from this resume accurately:
      
      Instructions:
      1. Extract all technical and soft skills (programming languages, tools, soft skills)
      2. Extract work experience details (company, position, duration, responsibilities)
      3. Extract education details (degree, institution, graduation year)
      4. Be concise but comprehensive
      
      Resume text:
      ${resumeText}
      
      IMPORTANT: You MUST return ONLY valid JSON in the following format with no additional text, markdown, or explanations:
      {
        "skills": ["skill1", "skill2", ...],
        "experience": ["experience1", "experience2", ...],
        "education": [
          "Degree - Institution (Year)",
          "Degree - Institution (Year)",
          ...
        ]
      }
      
      CRITICAL: For education, each item MUST be a simple string in the format "Degree - Institution (Year)" and NOT an object or complex structure.
    `;

    // Generate extraction analysis with retry mechanism
    const extractionResult = await retryWithBackoff(async () => {
      const result = await model.generateContent(extractionPrompt);
      if (!result || !result.response) {
        throw new Error('Empty response from Gemini API');
      }
      return result;
    });
    const extractionResponse = extractionResult.response;
    let extractionData;
    
    try {
      // Clean the response text to ensure it's valid JSON
      let responseText = extractionResponse.text().trim();
      
      // Remove any markdown code block markers if present
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\n|```$/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\n|```$/g, '');
      }
      
      // Parse the JSON
      extractionData = JSON.parse(responseText);
      
      // Validate the structure and ensure all required properties exist
      if (!extractionData.skills || !extractionData.experience || !extractionData.education) {
        console.warn('Missing required properties in extraction data');
        // Add missing properties
        extractionData.skills = extractionData.skills || [];
        extractionData.experience = extractionData.experience || [];
        extractionData.education = extractionData.education || [];
      }
      
      // Ensure properties are arrays
      if (!Array.isArray(extractionData.skills)) extractionData.skills = [];
      if (!Array.isArray(extractionData.experience)) extractionData.experience = [];
      if (!Array.isArray(extractionData.education)) extractionData.education = [];
      
    } catch (parseError) {
      console.error('Error parsing extraction data JSON:', parseError);
      console.log('Raw response:', extractionResponse.text());
      // Provide default values if parsing fails
      extractionData = {
        skills: [],
        experience: [],
        education: []
      };
    }

    // Ensure all required properties exist
    const skills = extractionData.skills || [];
    const experience = extractionData.experience || [];
    
    // Process education data to ensure it's an array of strings
    let education = [];
    if (extractionData.education) {
      // Check if education is already an array of strings
      if (Array.isArray(extractionData.education) && 
          extractionData.education.every(item => typeof item === 'string')) {
        education = extractionData.education;
      } 
      // Check if it's an array of objects
      else if (Array.isArray(extractionData.education) && 
               extractionData.education.every(item => typeof item === 'object')) {
        // Convert each education object to a string
        education = extractionData.education.map(edu => {
          if (typeof edu === 'string') return edu;
          try {
            return `${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})`;
          } catch (e) {
            return String(edu);
          }
        });
      }
      // If it's a string that looks like JSON, try to parse it
      else if (typeof extractionData.education === 'string') {
        try {
          // Try to safely parse the string if it looks like JSON
          if (extractionData.education.trim().startsWith('[')) {
            const parsedEdu = JSON.parse(extractionData.education.replace(/'/g, '"'));
            if (Array.isArray(parsedEdu)) {
              education = parsedEdu.map(edu => {
                if (typeof edu === 'string') return edu;
                return `${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})`;
              });
            } else {
              education = [extractionData.education];
            }
          } else {
            education = [extractionData.education];
          }
        } catch (e) {
          console.error('Error parsing education data:', e);
          education = [String(extractionData.education)];
        }
      }
    }
    const atsScore = typeof atsAnalysis.atsScore === 'number' ? atsAnalysis.atsScore : 50;
    const suggestions = Array.isArray(atsAnalysis.suggestions) ? atsAnalysis.suggestions : [];

    // Combine the results
    return {
      atsScore,
      suggestions,
      skills,
      experience,
      education,
      matchedJobs: [] // Will be populated separately
    };
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    // Return a default analysis instead of throwing an error
    return {
      atsScore: 50,
      suggestions: [{
        category: "other",
        text: "An error occurred during analysis. Please try again later.",
        priority: "high"
      }],
      skills: [],
      experience: [],
      education: [],
      matchedJobs: []
    };
  }
};

// Helper function to match resume with jobs
const matchResumeWithJobs = async (resumeId, skills) => {
  try {
    // Get all jobs
    const jobs = await Job.find();
    
    // If no jobs found, return empty array
    if (!jobs || jobs.length === 0) {
      return [];
    }
    
    // If no skills provided, return empty array
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return [];
    }
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.2,  // Lower temperature for more consistent results
        maxOutputTokens: 2048,
      }
    });

    // Prepare matched jobs array
    const matchedJobs = [];

    // For each job, use Gemini to calculate match score
    for (const job of jobs) {
      try {
        // Skip if job doesn't have required fields
        if (!job.title || !job.requirements || !job.skills) {
          continue;
        }
        
        const jobRequirements = Array.isArray(job.requirements) ? job.requirements.join(', ') : '';
        const jobSkills = Array.isArray(job.skills) ? job.skills.join(', ') : '';
        
        const matchPrompt = `
          Calculate how well this candidate's skills match with the job requirements.
          
          Candidate skills: ${skills.join(', ')}
          
          Job title: ${job.title}
          Job requirements: ${jobRequirements}
          Required skills: ${jobSkills}
          
          You MUST return the response in the following JSON format and nothing else:
          {
            "matchScore": number (0-100),
            "matchReason": "brief explanation of the match score"
          }
        `;

        const matchResult = await retryWithBackoff(async () => {
          const result = await model.generateContent(matchPrompt);
          if (!result || !result.response) {
            throw new Error('Empty response from Gemini API');
          }
          return result;
        });
        const matchResponse = matchResult.response;
        let matchData;
        
        try {
          // Clean the response text to ensure it's valid JSON
          let responseText = matchResponse.text().trim();
          
          // Remove any markdown code block markers if present
          if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\n|```$/g, '');
          } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\n|```$/g, '');
          }
          
          // Parse the JSON
          matchData = JSON.parse(responseText);
          
          // Validate the structure
          if (typeof matchData.matchScore !== 'number' || typeof matchData.matchReason !== 'string') {
            throw new Error('Invalid match data structure');
          }
          
          // Ensure score is within range
          if (matchData.matchScore < 0 || matchData.matchScore > 100) {
            matchData.matchScore = Math.max(0, Math.min(100, matchData.matchScore || 50));
          }
          
        } catch (parseError) {
          console.error('Error parsing job match JSON:', parseError);
          console.log('Raw response:', matchResponse.text());
          // Skip this job if parsing fails
          continue;
        }

        // Validate match data
        if (typeof matchData.matchScore !== 'number' || typeof matchData.matchReason !== 'string') {
          continue;
        }

        // Add to matched jobs if score is above 50
        if (matchData.matchScore >= 50) {
          matchedJobs.push({
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            education: job.education,
            skills: job.skills,
            matchScore: matchData.matchScore,
            matchReason: matchData.matchReason
          });
        }
      } catch (jobError) {
        console.error(`Error processing job ${job.title}:`, jobError);
        // Continue with next job
        continue;
      }
    }

    // Sort by match score (highest first)
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Update the resume with matched jobs
    try {
      await Resume.findByIdAndUpdate(resumeId, {
        'analysis.matchedJobs': matchedJobs
      });
    } catch (updateError) {
      console.error('Error updating resume with job matches:', updateError);
      // Continue anyway to return matches to the user
    }

    return matchedJobs;
  } catch (error) {
    console.error('Error matching resume with jobs:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

// @desc    Upload and process a resume
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { filename, path: filePath, mimetype, size } = req.file;
    
    // Extract text from PDF
    let resumeText = '';
    if (mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(filePath);
    } else {
      // For DOCX files, we would need a DOCX parser
      // This is a placeholder for future implementation
      return res.status(400).json({ msg: 'DOCX parsing not implemented yet' });
    }

    // Create new resume record
    const resume = new Resume({
      user: req.user.id,
      fileName: filename,
      filePath: filePath,
      fileType: mimetype,
      fileSize: size,
      content: resumeText,
    });

    // Save resume to database
    await resume.save();

    res.json({
      msg: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        uploadDate: resume.createdAt
      }
    });
  } catch (err) {
    console.error('Error uploading resume:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get all resumes for the current user
// @route   GET /api/resumes
// @access  Private
exports.getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('fileName fileType createdAt analysis')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get a specific resume by ID
// @route   GET /api/resumes/:id
// @access  Private
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user ownership
    if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user ownership
    if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete file from storage
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (fileErr) {
        console.error('Error deleting file:', fileErr);
        // Continue with deletion even if file removal fails
      }
    }

    // Delete from database using deleteOne() instead of deprecated remove()
    await Resume.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Resume deleted' });
  } catch (err) {
    console.error('Error deleting resume:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).json({ msg: 'Server error during resume deletion' });
  }
};

// @desc    Analyze a resume with Gemini AI
// @route   POST /api/resumes/:id/analyze
// @access  Private
exports.analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user ownership
    if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Analyze resume with Gemini AI
    const analysis = await analyzeResumeWithGemini(resume.content);

    // Update resume with analysis
    resume.analysis = analysis;
    resume.updatedAt = Date.now();
    await resume.save();

    // Match with jobs
    const matchedJobs = await matchResumeWithJobs(resume._id, analysis.skills);

    res.json({
      msg: 'Resume analyzed successfully',
      analysis: resume.analysis
    });
  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ msg: 'Server error during analysis' });
  }
};

// @desc    Get job matches for a resume
// @route   GET /api/resumes/:id/job-matches
// @access  Private
exports.getJobMatches = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user ownership
    if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // If no analysis yet, return empty array
    if (!resume.analysis || !resume.analysis.skills) {
      return res.json([]);
    }

    // Match with jobs
    const matchedJobs = await matchResumeWithJobs(resume._id, resume.analysis.skills);

    res.json(matchedJobs);
  } catch (err) {
    console.error('Error getting job matches:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
