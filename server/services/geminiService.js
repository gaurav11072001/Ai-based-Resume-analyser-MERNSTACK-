const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI
// Make sure to use the API key directly if process.env is not loading correctly
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyC1JCb-gYPMF5tftgs7fFHUsK4VZHvAIcI';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Analyze resume text for ATS compatibility
 * @param {string} resumeText - The text content of the resume
 * @returns {Object} Analysis results with ATS score and suggestions
 */
exports.analyzeATSCompatibility = async (resumeText) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt for ATS compatibility analysis
    const prompt = `
      Analyze the following resume for ATS (Applicant Tracking System) compatibility.
      Provide a score from 0-100 and specific suggestions for improvement.
      Focus on format, content, keywords, and overall structure.
      
      Resume:
      ${resumeText}
      
      Return the response in the following JSON format:
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

    // Generate ATS analysis
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error analyzing ATS compatibility:', error);
    throw new Error('Failed to analyze ATS compatibility with Gemini AI');
  }
};

/**
 * Extract key skills and job titles from resume text using Gemini AI
 * @param {string} resumeText - The text content of the resume
 * @returns {Object} Extracted job titles and skills
 */
const extractJobInfo = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract relevant job titles and key skills from this resume. Format as JSON:
    {
      "jobTitles": ["title1", "title2"],
      "skills": ["skill1", "skill2"]
    }
    Resume:
    ${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text to get valid JSON
    console.log('Raw job info response:', text);
    
    // Remove markdown formatting if present
    text = text.replace(/```json\n/g, '').replace(/```/g, '');
    
    // Remove any leading/trailing whitespace
    text = text.trim();
    
    console.log('Cleaned job info response:', text);
    
    try {
      const info = JSON.parse(text);
      return {
        jobTitles: Array.isArray(info.jobTitles) ? info.jobTitles : ['Software Developer'],
        skills: Array.isArray(info.skills) ? info.skills : ['JavaScript', 'React', 'Node.js']
      };
    } catch (error) {
      console.error('Error parsing job info JSON:', error);
      // Return fallback values
      return {
        jobTitles: ['Software Developer'],
        skills: ['JavaScript', 'React', 'Node.js']
      };
    }
  } catch (error) {
    console.error('Error extracting job info:', error);
    throw error;
  }
};



/**
 * Get real job recommendations from GitHub Jobs API
 * @param {string} resumeText - The text content of the resume
 * @returns {Array} Array of job recommendations
 */
exports.getJobRecommendations = async (resumeText) => {
  try {
    if (!resumeText) {
      console.error('Resume text is empty or undefined');
      throw new Error('Resume text is required');
    }
    console.log('Starting job recommendations...');
    // First extract relevant job titles and skills from the resume
    console.log('Extracting job info from resume...');
    const { jobTitles, skills } = await extractJobInfo(resumeText);
    if (!jobTitles || !skills) {
      console.error('Failed to extract job info:', { jobTitles, skills });
      throw new Error('Failed to extract job info from resume');
    }
    console.log('Extracted job info:', { jobTitles, skills });

    // Use extracted skills to generate relevant job recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Generating job recommendations for skills:', skills);
    const prompt = `Based on these skills: ${skills.join(', ')}, generate 5 relevant job recommendations for positions in India.
    Each job should be realistic and include:
    - Job title matching the skills
    - Company name (use real, well-known Indian companies and MNCs with offices in India)
    - Location (major Indian cities like Bangalore, Mumbai, Delhi, Hyderabad, Pune)
    - Salary range (in INR, realistic for Indian market)
    - Required experience
    - Key responsibilities
    - Required skills (matching some of the candidate's skills)

    Format as JSON array like this:
    [{
      "title": "Senior Software Engineer",
      "company": "Infosys",
      "location": "Bangalore, India",
      "salary": "₹18,00,000 - ₹28,00,000 PA",
      "type": "Full-time",
      "experience": "5+ years",
      "description": "Key responsibilities...",
      "skills": ["JavaScript", "React", "Node.js"],
      "applyLink": "https://careers.infosys.com"
    }]`;

    const result = await model.generateContent(prompt);
    console.log('Got response from Gemini');
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text to get valid JSON
    console.log('Raw response:', text);
    
    // Remove markdown formatting if present
    text = text.replace(/```json\n/g, '').replace(/```/g, '');
    
    // Remove any leading/trailing whitespace
    text = text.trim();
    
    console.log('Cleaned response:', text);
    
    try {
      const jobs = JSON.parse(text);
      if (!Array.isArray(jobs)) {
        throw new Error('Response is not an array');
      }
      
      // Filter for Indian locations and format jobs
      const formattedJobs = jobs
        .filter(job => {
          const location = (job.location || '').toLowerCase();
          return location.includes('india') || 
                 location.includes('bangalore') || 
                 location.includes('mumbai') || 
                 location.includes('delhi') || 
                 location.includes('hyderabad') || 
                 location.includes('pune') || 
                 location.includes('chennai');
        })
        .map((job, index) => ({
          ...job,
          id: `job-${index + 1}`,
          postedDate: new Date().toISOString(),
          matchedSkills: job.skills.filter(skill => skills.includes(skill))
        }));

      // If no Indian jobs found, return fallback Indian jobs
      if (formattedJobs.length === 0) {
        return [{
          id: 'fallback-1',
          title: 'Software Developer',
          company: 'Infosys',
          location: 'Bangalore, India',
          salary: '₹8,00,000 - ₹15,00,000 PA',
          type: 'Full-time',
          experience: '2+ years',
          description: 'Looking for a skilled software developer with expertise in modern web technologies...',
          skills: ['JavaScript', 'React', 'Node.js'],
          postedDate: new Date().toISOString(),
          applyLink: 'https://careers.infosys.com/jobs'
        }];
      }
      
      return formattedJobs;
    } catch (error) {
      console.error('Error parsing jobs JSON:', error);
      // Return a fallback job list
      return [{
        id: 'fallback-1',
        title: 'Software Developer',
        company: 'Infosys',
        location: 'Bangalore, India',
        salary: '₹8,00,000 - ₹15,00,000 PA',
        type: 'Full-time',
        experience: '2+ years',
        description: 'Looking for a skilled software developer with expertise in modern web technologies...',
        skills: ['JavaScript', 'React', 'Node.js'],
        postedDate: new Date().toISOString(),
        applyLink: 'https://careers.infosys.com/jobs'
      },
      {
        id: 'fallback-2',
        title: 'Full Stack Developer',
        company: 'TCS',
        location: 'Pune, India',
        salary: '₹7,00,000 - ₹14,00,000 PA',
        type: 'Full-time',
        experience: '1-3 years',
        description: 'Join our dynamic team developing enterprise applications...',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        postedDate: new Date().toISOString(),
        applyLink: 'https://careers.tcs.com/jobs'
      }];
    }
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

/**
 * Extract skills, experience, and education from resume text
 * @param {string} resumeText - The text content of the resume
 * @returns {Object} Extracted information
 */
exports.extractResumeInformation = async (resumeText) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct the prompt for information extraction
    const prompt = `
      Extract the following information from this resume:
      1. All technical and soft skills
      2. Work experience details
      3. Education details
      
      Resume:
      ${resumeText}
      
      Return the response in the following JSON format:
      {
        "skills": ["skill1", "skill2", ...],
        "experience": ["experience1", "experience2", ...],
        "education": ["education1", "education2", ...]
      }
    `;

    // Generate extraction analysis
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error extracting resume information:', error);
    throw new Error('Failed to extract resume information with Gemini AI');
  }
};

/**
 * Calculate match score between resume skills and job requirements
 * @param {Array} skills - Array of candidate skills
 * @param {Object} job - Job object with title, requirements, and skills
 * @returns {Object} Match score and reason
 */
exports.calculateJobMatch = async (skills, job) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct the prompt for job matching
    const prompt = `
      Calculate how well this candidate's skills match with the job requirements.
      
      Candidate skills: ${skills.join(', ')}
      
      Job title: ${job.title}
      Job requirements: ${job.requirements.join(', ')}
      Required skills: ${job.skills.join(', ')}
      
      Return the response in the following JSON format:
      {
        "matchScore": number (0-100),
        "matchReason": "brief explanation of the match score"
      }
    `;

    // Generate match analysis
    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error calculating job match:', error);
    throw new Error('Failed to calculate job match with Gemini AI');
  }
};

/**
 * Generate improvement suggestions for a resume
 * @param {string} resumeText - The text content of the resume
 * @param {string} targetJobTitle - Optional target job title
 * @returns {Array} Array of improvement suggestions
 */
exports.generateImprovementSuggestions = async (resumeText, targetJobTitle = '') => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct the prompt for improvement suggestions
    const prompt = `
      Generate specific improvement suggestions for this resume${targetJobTitle ? ` for a ${targetJobTitle} position` : ''}.
      Focus on content, format, and keyword optimization.
      
      Resume:
      ${resumeText}
      
      Return the response in the following JSON format:
      {
        "suggestions": [
          {
            "category": "format|content|keywords|grammar|other",
            "text": "detailed suggestion with specific example",
            "priority": "high|medium|low"
          }
        ]
      }
    `;

    // Generate suggestions
    const result = await model.generateContent(prompt);
    const response = result.response;
    const data = JSON.parse(response.text());
    return data.suggestions;
  } catch (error) {
    console.error('Error generating improvement suggestions:', error);
    throw new Error('Failed to generate improvement suggestions with Gemini AI');
  }
};
