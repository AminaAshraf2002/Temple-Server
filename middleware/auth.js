const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'temple_secret_key_change_in_production';

// Generate JWT token
const generateToken = (adminId, username) => {
  return jwt.sign(
    { 
      adminId, 
      username,
      type: 'admin' 
    },
    JWT_SECRET,
    { 
      expiresIn: '24h' // Token expires in 24 hours
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Middleware to authenticate admin requests
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Extract token from "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid token format.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Admin account not found or inactive.'
      });
    }
    
    // Add admin info to request object
    req.admin = {
      id: admin._id,
      username: admin.username,
      role: admin.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Token has expired.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid token.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware to check if admin has specific role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    if (req.admin.role !== requiredRole && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Simple session-based auth for basic setup (alternative to JWT)
const createSession = (adminData) => {
  return {
    sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    admin: adminData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
};

// Store sessions in memory (use Redis in production)
const activeSessions = new Map();

const authenticateSession = (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        status: 'error',
        message: 'No session provided'
      });
    }
    
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid session'
      });
    }
    
    if (new Date() > session.expiresAt) {
      activeSessions.delete(sessionId);
      return res.status(401).json({
        status: 'error',
        message: 'Session expired'
      });
    }
    
    req.admin = session.admin;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Session authentication error',
      error: error.message
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateAdmin,
  requireRole,
  createSession,
  authenticateSession,
  activeSessions
};