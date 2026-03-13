const bcrypt = require('bcryptjs');
const { query } = require('../utils/database');
const { generateToken } = require('../middleware/auth');

module.exports = async function (context, req) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      context.res = {
        status: 400,
        body: { error: 'Email and password required' }
      };
      return;
    }

    // Get user from database
    const users = await query(
      'SELECT * FROM Users WHERE email = @email',
      { email }
    );

    if (users.length === 0) {
      context.res = {
        status: 401,
        body: { error: 'Invalid credentials' }
      };
      return;
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      context.res = {
        status: 401,
        body: { error: 'Invalid credentials' }
      };
      return;
    }

    // Generate token
    const token = generateToken(user);

    context.res = {
      status: 200,
      body: {
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          role: user.role
        }
      }
    };
  } catch (error) {
    context.log.error('Login error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};
