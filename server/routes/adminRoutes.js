const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply both auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', adminController.getAllUsers);

// @route   GET api/admin/resumes
// @desc    Get all resumes
// @access  Private/Admin
router.get('/resumes', adminController.getAllResumes);

// @route   POST api/admin/jobs
// @desc    Create a new job
// @access  Private/Admin
router.post('/jobs', adminController.createJob);

// @route   GET api/admin/jobs
// @desc    Get all jobs
// @access  Private/Admin
router.get('/jobs', adminController.getAllJobs);

// @route   PUT api/admin/jobs/:id
// @desc    Update a job
// @access  Private/Admin
router.put('/jobs/:id', adminController.updateJob);

// @route   DELETE api/admin/jobs/:id
// @desc    Delete a job
// @access  Private/Admin
router.delete('/jobs/:id', adminController.deleteJob);

// @route   POST api/admin/training-data
// @desc    Add training data for the AI model
// @access  Private/Admin
router.post('/training-data', adminController.addTrainingData);

// @route   GET api/admin/training-data
// @desc    Get all training data
// @access  Private/Admin
router.get('/training-data', adminController.getTrainingData);

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboardData);

module.exports = router;
