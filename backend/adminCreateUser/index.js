const bcrypt = require('bcryptjs');
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

    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      context.res = {
        status: 400,
        body: { error: 'Missing required fields' }
      };
      return;
    }

    if (!['student', 'reviewer'].includes(role)) {
      context.res = {
        status: 400,
        body: { error: 'Invalid role' }
      };
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO Users (email, password_hash, full_name, role)
       VALUES (@email, @passwordHash, @fullName, @role)`,
      { email, passwordHash, fullName: full_name, role }
    );

    context.res = {
      status: 201,
      body: { message: 'User created successfully' }
    };
  } catch (error) {
    context.log.error('Create user error:', error);
    if (error.message.includes('UNIQUE')) {
      context.res = { status: 400, body: { error: 'Email already exists' } };
    } else {
      context.res = { status: 500, body: { error: 'Internal server error' } };
    }
  }
};