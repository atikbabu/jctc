// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User').default; // Adjust path as necessary

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jc-tc-erp';
mongoose.connect(uri);

async function createAdmin() {
  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('⚠️ Admin user already exists');
    return mongoose.disconnect();
  }

  const hash = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    username: 'admin',
    password: hash,
    role: 'admin'
  });

  console.log('✅ Admin user created with username: admin and password: admin123');
  mongoose.disconnect();
}

createAdmin();
