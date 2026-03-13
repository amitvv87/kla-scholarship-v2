const { query } = require('../utils/database');
const bcrypt = require('bcryptjs');

module.exports = async function (context, req) {
  try {
    const { email, password, firstName, lastName, parentEmployeeId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      context.res = {
        status: 400,
        body: { error: 'Email, password, first name, and last name are required' }
      };
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      context.res = {
        status: 400,
        body: { error: 'Invalid email format' }
      };
      return;
    }

    if (password.length < 6) {
      context.res = {
        status: 400,
        body: { error: 'Password must be at least 6 characters long' }
      };
      return;
    }

    const existingUsers = await query(
      'SELECT user_id FROM Users WHERE email = @email',
      { email }
    );

    if (existingUsers.length > 0) {
      context.res = {
        status: 409,
        body: { error: 'An account with this email already exists' }
      };
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO Users (email, password_hash, role, first_name, last_name, parent_employee_id, created_at)
       VALUES (@email, @passwordHash, 'student', @firstName, @lastName, @parentEmployeeId, GETDATE())`,
      {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        parentEmployeeId: parentEmployeeId || null
      }
    );

    context.log('Student registered successfully:', email);

    context.res = {
      status: 201,
      body: {
        message: 'Registration successful! You can now login.',
        email: email
      }
    };

  } catch (error) {
    context.log.error('Registration error:', error);
    context.res = {
      status: 500,
      body: { error: 'Registration failed. Please try again.' }
    };
  }
};
