// Test script to check and fix GitHub skills
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const { fixExistingGitHubUsers } = require('./src/utils/fixGithubSkills');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function testSkills() {
    await connectDB();
    
    console.log('\n🔍 Checking all GitHub users and their skills...\n');
    
    try {
        // Find all GitHub users
        const githubUsers = await userModel.find({ provider: 'github' });
        
        console.log(`📊 Found ${githubUsers.length} GitHub users in database`);
        
        if (githubUsers.length === 0) {
            console.log('⚠️  No GitHub users found in database');
            return;
        }
        
        // Display current skills for each user
        for (const user of githubUsers) {
            console.log('\n' + '='.repeat(50));
            console.log(`👤 User: ${user.name} (@${user.githubUsername})`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`🆔 GitHub ID: ${user.githubId}`);
            console.log(`🔗 Provider: ${user.provider}`);
            console.log(`📅 Created: ${user.createdAt}`);
            
            if (user.skills && user.skills.length > 0) {
                console.log(`✅ Skills (${user.skills.length}): ${user.skills.join(', ')}`);
            } else {
                console.log('❌ No skills found');
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🔧 Running skills fix function...\n');
        
        // Run the fix function
        await fixExistingGitHubUsers();
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 Checking skills after fix...\n');
        
        // Check users again after fix
        const updatedUsers = await userModel.find({ provider: 'github' });
        
        for (const user of updatedUsers) {
            console.log(`👤 ${user.name} (@${user.githubUsername}): ${user.skills?.length || 0} skills`);
            if (user.skills && user.skills.length > 0) {
                console.log(`   Skills: ${user.skills.join(', ')}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

testSkills();