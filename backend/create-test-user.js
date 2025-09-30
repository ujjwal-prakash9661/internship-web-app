// Create test GitHub user with skills
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function createTestUser() {
    await connectDB();
    
    try {
        console.log('\n🔧 Creating test GitHub user with skills...\n');
        
        // Check if user already exists
        const existingUser = await userModel.findOne({ 
            $or: [
                { email: 'ujjwal-prakash9661@github.local' },
                { githubId: '181618362' }
            ]
        });
        
        if (existingUser) {
            console.log('✅ User already exists:');
            console.log(`   Name: ${existingUser.name}`);
            console.log(`   Skills: ${existingUser.skills?.join(', ') || 'None'}`);
            return;
        }
        
        // Create new GitHub user
        const testUser = new userModel({
            name: 'Ujjawal Prakash',
            email: 'ujjwal-prakash9661@github.local',
            provider: 'github',
            githubId: '181618362',
            githubUsername: 'ujjwal-prakash9661',
            avatar: 'https://avatars.githubusercontent.com/u/181618362?v=4',
            skills: ['JavaScript', 'CSS', 'HTML', 'TypeScript'], // Pre-populated skills
            isVerified: true
        });
        
        await testUser.save();
        
        console.log('✅ Test GitHub user created successfully!');
        console.log(`   Name: ${testUser.name}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   GitHub Username: ${testUser.githubUsername}`);
        console.log(`   Skills: ${testUser.skills.join(', ')}`);
        console.log(`   User ID: ${testUser._id}`);
        
        console.log('\n🎉 User is ready for testing!');
        console.log('📱 Frontend should now display skills properly.');
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

createTestUser();