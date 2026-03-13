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
    if (!decoded || !['reviewer', 'admin'].includes(decoded.role)) {
      context.res = { status: 403, body: { error: 'Forbidden' } };
      return;
    }

    const applications = await query(
      `SELECT * FROM Applications ORDER BY submitted_at DESC`
    );

    context.res = { status: 200, body: applications };
  } catch (error) {
    context.log.error('Get all applications error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};
