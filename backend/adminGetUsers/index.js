const { verifyToken, getTokenFromRequest } = require('../middleware/auth');
const { query } = require('../utils/database');

module.exports = async function (context, req) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      context.res = { status: 401, body: { error: 'Unauthorized' } };
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      context.res = { status: 403, body: { error: 'Forbidden' } };
      return;
    }

    const users = await query(
      'SELECT user_id, email, full_name, role, created_at FROM Users ORDER BY created_at DESC'
    );

    context.res = { status: 200, body: users };
  } catch (error) {
    context.log.error('Get users error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};