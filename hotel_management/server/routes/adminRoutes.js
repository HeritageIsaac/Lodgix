const express = require('express');
const { check } = require('express-validator');
const {
  registerAdmin,
  loginAdmin,
  getMe,
  getDashboardStats
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/admin/register
// @desc    Register a new admin
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  registerAdmin
);

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginAdmin
);

// @route   GET api/admin/me
// @desc    Get logged in admin
// @access  Private
router.get('/me', auth, getMe);

// @route   GET api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard-stats', auth, getDashboardStats);

module.exports = router;
