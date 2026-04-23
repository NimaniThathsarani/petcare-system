const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const emailLower = email ? email.toLowerCase() : '';
    // Email must end with @gmail.com
    if (!emailLower || !emailLower.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email must be a @gmail.com address' });
    }

    // Password: min 8 chars, 1 uppercase, 1 symbol
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with one uppercase letter and one symbol' });
    }

    const userExists = await User.findOne({ email: emailLower });
    if (userExists)
      return res.status(400).json({ message: 'An account with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: role || 'owner'
    });

    console.log(`[AUTH] User created: ${user.email} with role: ${user.role} on database: ${mongoose.connection.name}`);

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password, isStaff } = req.body;
  try {
    const emailLower = email ? email.toLowerCase() : '';
    const user = await User.findOne({ email: emailLower });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      // Prevent owners from accessing staff portal
      if (isStaff && user.role === 'owner') {
        return res.status(401).json({ message: 'Access Denied: This is an Owner account. Please use the main Pet Care login.' });
      }

      // Prevent staff from accessing owner portal
      if (!isStaff && user.role !== 'owner') {
        const roleLabel = user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.replace('_', ' ').slice(1);
        return res.status(401).json({ message: `Access Denied: This is a ${roleLabel} account. Please use the Staff Portal login.` });
      }

      res.json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid Login: Please check your email and password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };