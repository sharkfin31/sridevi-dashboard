const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Load users from environment variables
let users = [];

try {
  if (process.env.USER_ACCOUNTS) {
    const decoded = Buffer.from(process.env.USER_ACCOUNTS, 'base64').toString('utf-8');
    users = JSON.parse(decoded);

  } else {
    console.error('❌ USER_ACCOUNTS environment variable not set. Please run: npm run create-users');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error loading user accounts:', error.message);
  process.exit(1);
}

class AuthService {
  async login(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Password strength validation
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      throw new Error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password with higher rounds for security
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;


    return { 
      success: true, 
      message: 'Password changed successfully',
      timestamp: new Date().toISOString()
    };
  }

  async updateProfile(userId, profileData) {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (profileData.name) user.name = profileData.name;
    if (profileData.email) user.email = profileData.email;
    if (profileData.phone) user.phone = profileData.phone;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();