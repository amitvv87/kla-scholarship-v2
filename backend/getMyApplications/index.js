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
    if (!decoded || decoded.role !== 'student') {
      context.res = { status: 403, body: { error: 'Forbidden' } };
      return;
    }

    const applications = await query(
      'SELECT * FROM Applications WHERE student_id = @studentId ORDER BY submitted_at DESC',
      { studentId: decoded.userId }
    );

    context.res = { status: 200, body: applications };
  } catch (error) {
    context.log.error('Get my applications error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};
