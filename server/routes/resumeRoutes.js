const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// File filter for PDF and DOCX files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST api/resumes/upload
// @desc    Upload a resume for analysis
// @access  Private
router.post('/upload', authMiddleware, upload.single('resume'), resumeController.uploadResume);

// @route   GET api/resumes
// @desc    Get all resumes for the current user
// @access  Private
router.get('/', authMiddleware, resumeController.getUserResumes);

// @route   GET api/resumes/:id/jobs
// @desc    Get job recommendations based on resume
// @access  Private
router.get('/:id/jobs', authMiddleware, resumeController.getRecommendedJobs);

// @route   GET api/resumes/:id
// @desc    Get a specific resume by ID
// @access  Private
router.get('/:id', authMiddleware, resumeController.getResumeById);

// @route   DELETE api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', authMiddleware, resumeController.deleteResume);

// @route   POST api/resumes/:id/analyze
// @desc    Analyze a resume with Gemini AI
// @access  Private
router.post('/:id/analyze', authMiddleware, resumeController.analyzeResume);

// @route   GET api/resumes/:id/job-matches
// @desc    Get job matches for a resume
// @access  Private
router.get('/:id/job-matches', authMiddleware, resumeController.getJobMatches);

module.exports = router;
