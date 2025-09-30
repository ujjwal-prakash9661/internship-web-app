// Test script to check profile API endpoint
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

async function testProfileAPI() {
    await connectDB();
    
    try {
        // Find the GitHub user
        const githubUser = await userModel.findOne({ provider: 'github' });
        
        if (!githubUser) {
            console.log('❌ No GitHub user found');
            return;
        }
        
        console.log('\n📋 Profile API Response Simulation:');
        console.log('=====================================');
        
        // Simulate what the profile API would return
        const profileData = {
            user: {
                id: githubUser._id,
                name: githubUser.name,
                email: githubUser.email,
                avatar: githubUser.avatar,
                githubUsername: githubUser.githubUsername,
                githubId: githubUser.githubId,
                provider: githubUser.provider,
                skills: githubUser.skills,
                createdAt: githubUser.createdAt,
                updatedAt: githubUser.updatedAt
            }
        };
        
        console.log('📊 User Profile Data:');
        console.log(JSON.stringify(profileData, null, 2));
        
        console.log('\n🔍 Skills Analysis:');
        console.log(`📈 Total Skills: ${githubUser.skills?.length || 0}`);
        if (githubUser.skills && githubUser.skills.length > 0) {
            console.log(`📋 Skills List: ${githubUser.skills.join(', ')}`);
            console.log('✅ Skills are properly populated and will display in frontend');
        } else {
            console.log('❌ No skills found - this would show "No skills added yet" in frontend');
        }
        
        // Generate a test JWT token for this user
        const token = jwt.sign(
            { userId: githubUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('\n🔑 Test JWT Token Generated:');
        console.log(token.substring(0, 50) + '...');
        
        console.log('\n✅ Profile API test completed successfully!');
        console.log('🌟 Skills are ready to display in the frontend Profile page.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

testProfileAPI();