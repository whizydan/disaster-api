const User = require('../models/user');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

// Register new user
const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  
  try {
    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);
    
    // Create the user
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword, 
      role 
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user and generate JWT
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Compare passwords using argon2
    const match = await argon2.verify(user.password, password);
    
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Generate JWT token
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    
    // Set JWT as an HttpOnly cookie
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 3600000 // 1 hour
    });
    
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// The rest of the functions (getAllUsers, getUserById, createUser, updateUser, deleteUser) remain unchanged.
