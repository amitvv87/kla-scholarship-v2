const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extract token from request - handles different Azure Functions formats
const getTokenFromRequest = (req) => {
  // Try different ways to access headers in Azure Functions
  const headers = req.headers || req.Headers || {};
  const authHeader = headers.authorization || headers.Authorization || '';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

// Verify a token string
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  verifyToken,
  generateToken,
  getTokenFromRequest,
  JWT_SECRET
};
