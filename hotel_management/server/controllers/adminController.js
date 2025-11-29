const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { validationResult } = require('express-validator');

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public
exports.registerAdmin = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    admin = new Admin({
      username,
      email,
      password,
      role: 'admin' // Explicitly set role to admin
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin to database
    await admin.save();

    // Create JWT
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if admin exists
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify admin role
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get logged in admin
// @route   GET /api/admin/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // In a real application, you would fetch these from your database
    // For now, we'll return mock data
    const stats = {
      totalHotels: 0,
      totalBookings: 0,
      totalRevenue: 0,
      totalUsers: 0
    };

    // Example of how you might fetch real data:
    // stats.totalHotels = await Hotel.countDocuments();
    // stats.totalBookings = await Booking.countDocuments();
    // stats.totalRevenue = await Booking.aggregate([
    //   { $match: { status: 'completed' } },
    //   { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    // ]);
    // stats.totalUsers = await User.countDocuments();

    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
