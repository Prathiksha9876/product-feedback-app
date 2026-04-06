const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/product_feedback', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin@123';

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log('Admin already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      userExists.password = await bcrypt.hash(adminPassword, salt);
      userExists.role = 'admin';
      await userExists.save();
      console.log('Admin password updated to: ' + adminPassword);
    } else {
      console.log('Creating Admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully!');
      console.log('Email: ' + adminEmail);
      console.log('Password: ' + adminPassword);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
