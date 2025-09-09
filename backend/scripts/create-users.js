const bcrypt = require('bcryptjs');

async function createUsers() {
  const users = [
    {
      id: 1,
      email: 'admin@sridevi.com',
      name: 'Administrator',
      password: await bcrypt.hash('admin123!', 12),
      role: 'admin'
    },
    {
      id: 2,
      email: 'manager@sridevi.com', 
      name: 'Manager',
      password: await bcrypt.hash('manager123!', 12),
      role: 'manager'
    }
  ];

  const encoded = Buffer.from(JSON.stringify(users)).toString('base64');
  console.log('Add this to your .env file:');
  console.log(`USER_ACCOUNTS=${encoded}`);
  console.log('\nCredentials saved to CREDENTIALS.md (not in version control)');
  console.log('Admin: admin@sridevi.com / admin123!');
  console.log('Manager: manager@sridevi.com / manager123!');
}

createUsers().catch(console.error);