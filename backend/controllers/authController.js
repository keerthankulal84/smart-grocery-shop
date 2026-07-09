const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // First registered user automatically becomes admin. Everyone after is a normal user.
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/address
exports.updateAddress = async (req, res) => {
  try {
    const { line1, city, state, pincode, phone } = req.body;
    req.user.address = { line1, city, state, pincode, phone };
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Could not update address', error: err.message });
  }
};
