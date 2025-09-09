# Backend Setup Guide

## Secure Authentication Setup

### 1. Generate User Accounts
```bash
npm run create-users
```

This will output a base64-encoded string for your `.env` file.

### 2. Create .env File
```bash
cp .env.example .env
```

Add the generated `USER_ACCOUNTS` string to your `.env` file along with other required variables:

```env
JWT_SECRET=your-super-secure-jwt-secret-key-here
USER_ACCOUNTS=your_generated_base64_string_here
NOTION_KEY=your_notion_integration_token
# ... other variables
```

### 3. Security Best Practices

**Environment Variables:**
- Never commit `.env` files to version control
- Use strong JWT secrets (32+ characters)
- Rotate secrets regularly

**Production Deployment:**
- Use environment variable injection (Docker, Kubernetes, etc.)
- Consider external secret management (AWS Secrets Manager, HashiCorp Vault)
- Enable HTTPS only
- Set secure CORS origins

**User Management:**
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire in 24 hours
- User data is base64 encoded in environment

### 4. Alternative Secure Storage Options

**Option 1: External Database**
```javascript
// Replace in-memory users with database queries
const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
```

**Option 2: AWS Secrets Manager**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();
const secret = await secretsManager.getSecretValue({SecretId: 'user-accounts'}).promise();
```

**Option 3: HashiCorp Vault**
```javascript
const vault = require('node-vault')();
const secret = await vault.read('secret/data/user-accounts');
```

## Default Test Accounts

After running `npm run create-users`:
- **Admin**: admin@sridevi.com / admin123!
- **Manager**: manager@sridevi.com / manager123!

## Starting the Server

```bash
npm run dev
```

Server will start on port 3001 with authentication enabled.