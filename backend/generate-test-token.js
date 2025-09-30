// Generate JWT token for test user
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const jwt = require('jsonwebtoken');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function generateTestToken() {
    await connectDB();
    
    try {
        const user = await userModel.findOne({ provider: 'github' });
        
        if (!user) {
            console.log('❌ No GitHub user found');
            return;
        }
        
        console.log(`👤 Found user: ${user.name} (@${user.githubUsername})`);
        console.log(`🎯 Skills: ${user.skills.join(', ')}`);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('\n🔑 JWT Token Generated:');
        console.log('=' .repeat(80));
        console.log(token);
        console.log('=' .repeat(80));
        
        console.log('\n📋 Instructions:');
        console.log('1. Open browser and go to https://internship-web-app-42i2.onrender.com');
        console.log('2. Open Developer Tools (F12)');
        console.log('3. Go to Application/Storage > Local Storage > https://internship-web-app-42i2.onrender.com');
        console.log('4. Add new item:');
        console.log('   Key: token');
        console.log('   Value: (paste the token above)');
        console.log('5. Refresh the page');
        console.log('6. You should be logged in and see skills in profile!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

generateTestToken();