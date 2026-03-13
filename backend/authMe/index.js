const { verifyToken, getTokenFromRequest } = require('../middleware/auth');
const { query } = require('../utils/database');

module.exports = async function (context, req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      context.res = { status: 401, body: { error: 'Invalid token' } };
      return;
    }

    const users = await query(
      'SELECT user_id, email, full_name, role FROM Users WHERE user_id = @userId',
      { userId: decoded.userId }
    );

    if (users.length === 0) {
      context.res = { status: 404, body: { error: 'User not found' } };
      return;
    }

    context.res = {
      status: 200,
      body: {
        userId: users[0].user_id,
        email: users[0].email,
        fullName: users[0].full_name,
        role: users[0].role
      }
    };
  } catch (error) {
    context.log.error('Auth error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};