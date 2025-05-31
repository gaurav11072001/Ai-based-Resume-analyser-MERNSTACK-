const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all resumes
// @route   GET /api/admin/resumes
// @access  Private/Admin
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate('user', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new job
// @route   POST /api/admin/jobs
// @access  Private/Admin
exports.createJob = async (req, res) => {
  const {
    title,
    company,
    description,
    requirements,
    skills,
    experience,
    education,
    location,
    salary
  } = req.body;

  try {
    const newJob = new Job({
      title,
      company,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      skills: Array.isArray(skills) ? skills : [skills],
      experience,
      education,
      location,
      salary,
      createdBy: req.user.id
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update a job
// @route   PUT /api/admin/jobs/:id
// @access  Private/Admin
exports.updateJob = async (req, res) => {
  const {
    title,
    company,
    description,
    requirements,
    skills,
    experience,
    education,
    location,
    salary
  } = req.body;

  // Build job object
  const jobFields = {};
  if (title) jobFields.title = title;
  if (company) jobFields.company = company;
  if (description) jobFields.description = description;
  if (requirements) {
    jobFields.requirements = Array.isArray(requirements) ? requirements : [requirements];
  }
  if (skills) {
    jobFields.skills = Array.isArray(skills) ? skills : [skills];
  }
  if (experience) jobFields.experience = experience;
  if (education) jobFields.education = education;
  if (location) jobFields.location = location;
  if (salary) jobFields.salary = salary;
  jobFields.updatedAt = Date.now();

  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Update job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Delete a job
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Add training data for the AI model
// @route   POST /api/admin/training-data
// @access  Private/Admin
exports.addTrainingData = async (req, res) => {
  // This would typically involve storing examples of good resumes and their scores
  // For Gemini, we don't need to explicitly train the model, but we can store examples
  // that can be used to improve prompts or for future fine-tuning
  
  const { resumeId, jobId, matchScore, feedback } = req.body;
  
  try {
    // Create a training data schema if needed
    // For now, just return success
    res.json({ 
      msg: 'Training data added successfully',
      data: {
        resumeId,
        jobId,
        matchScore,
        feedback,
        addedBy: req.user.id,
        addedAt: new Date()
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all training data
// @route   GET /api/admin/training-data
// @access  Private/Admin
exports.getTrainingData = async (req, res) => {
  // This would typically involve retrieving stored training examples
  // For now, just return an empty array
  try {
    res.json([]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardData = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const resumeCount = await Resume.countDocuments();
    const jobCount = await Job.countDocuments();
    
    // Get recent activity
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentResumes = await Resume.find()
      .populate('user', ['name', 'email'])
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get analytics data
    // Average ATS scores
    const averageATSScore = await Resume.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$analysis.atsScore' }
        }
      }
    ]);
    
    // Most common skills
    const skillsFrequency = await Resume.aggregate([
      { $unwind: '$analysis.skills' },
      {
        $group: {
          _id: '$analysis.skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      counts: {
        users: userCount,
        resumes: resumeCount,
        jobs: jobCount
      },
      recent: {
        users: recentUsers,
        resumes: recentResumes,
        jobs: recentJobs
      },
      analytics: {
        averageATSScore: averageATSScore.length > 0 ? averageATSScore[0].averageScore : 0,
        topSkills: skillsFrequency.map(item => ({
          skill: item._id,
          count: item.count
        }))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
