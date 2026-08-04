import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'uni_football_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        playerProfile: true,
        managedTeam: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password match using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication',
      error: error.message
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        playerProfile: true,
        managedTeam: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
      error: error.message
    });
  }
};
