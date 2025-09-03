const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany({ role: 'Admin' }, { $set: { role: 'admin' } });
    console.log(`🔄 Updated ${result.nModified || result.modifiedCount} user(s) from 'Admin' to 'admin'.`);

    const users = await User.find({ role: { $nin: ['user', 'admin'] } });
    if (users.length > 0) {
      console.log('⚠️  Users with invalid roles:', users.map(u => ({ id: u._id, email: u.email, role: u.role })));
    } else {
      console.log('✅ No users with invalid roles found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
    process.exit(1);
  }
}

fixUserRoles();
