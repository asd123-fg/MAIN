const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        data: null
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        data: null
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          name,
          email,
          password: hashedPassword,
          role: role.toLowerCase(),
          created_at: new Date()
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating user',
        data: error
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        data: null
      });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      data: error.message
    });
  }
};

module.exports = {
  register,
  login
};
