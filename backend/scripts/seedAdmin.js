const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@excelanalytics.com',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      subscription: 'premium',
      isActive: true
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully:');
    console.log('   Email:', adminUser.email);
    console.log('   Username:', adminUser.username);
    console.log('   Password: admin123456');
    console.log('   Role:', adminUser.role);

    // Create a test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@excelanalytics.com',
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      subscription: 'free',
      isActive: true
    });

    await testUser.save();

    console.log('✅ Test user created successfully:');
    console.log('   Email:', testUser.email);
    console.log('   Username:', testUser.username);
    console.log('   Password: test123456');
    console.log('   Role:', testUser.role);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@excelanalytics.com / admin123456');
    console.log('   User:  test@excelanalytics.com / test123456');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
