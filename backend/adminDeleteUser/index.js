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

    const userId = req.params.id;

    if (parseInt(userId) === decoded.userId) {
      context.res = {
        status: 400,
        body: { error: 'Cannot delete your own account' }
      };
      return;
    }

    await query('DELETE FROM Users WHERE user_id = @userId', { userId: parseInt(userId) });

    context.res = {
      status: 200,
      body: { message: 'User deleted successfully' }
    };
  } catch (error) {
    context.log.error('Delete user error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};