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

    const totalUsers = await query('SELECT COUNT(*) as count FROM Users');
    const totalApplications = await query('SELECT COUNT(*) as count FROM Applications');
    const pendingApps = await query("SELECT COUNT(*) as count FROM Applications WHERE status = 'pending'");
    const approvedApps = await query("SELECT COUNT(*) as count FROM Applications WHERE status = 'approved'");
    const rejectedApps = await query("SELECT COUNT(*) as count FROM Applications WHERE status = 'rejected'");

    context.res = {
      status: 200,
      body: {
        totalUsers: totalUsers[0].count,
        totalApplications: totalApplications[0].count,
        pendingApplications: pendingApps[0].count,
        approvedApplications: approvedApps[0].count,
        rejectedApplications: rejectedApps[0].count
      }
    };
  } catch (error) {
    context.log.error('Get stats error:', error);
    context.res = { status: 500, body: { error: 'Internal server error' } };
  }
};