const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  userController.registerUser
);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  userController.loginUser
);

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authMiddleware, userController.getCurrentUser);

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', authMiddleware, userController.updateUserProfile);

module.exports = router;
