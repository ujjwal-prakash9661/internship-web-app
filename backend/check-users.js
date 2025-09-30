// Check all users in database
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

async function checkUsers() {
    await connectDB();
    
    try {
        console.log('\n🔍 Checking all users in database...\n');
        
        const allUsers = await userModel.find({});
        console.log(`📊 Total users found: ${allUsers.length}`);
        
        if (allUsers.length === 0) {
            console.log('⚠️  No users found in database');
            return;
        }
        
        allUsers.forEach((user, index) => {
            console.log(`\n👤 User ${index + 1}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Provider: ${user.provider}`);
            console.log(`  GitHub Username: ${user.githubUsername || 'N/A'}`);
            console.log(`  GitHub ID: ${user.githubId || 'N/A'}`);
            console.log(`  Skills: ${user.skills?.join(', ') || 'None'}`);
            console.log(`  Created: ${user.createdAt}`);
        });
        
        // Check specifically for GitHub users
        const githubUsers = await userModel.find({ provider: 'github' });
        console.log(`\n📈 GitHub users: ${githubUsers.length}`);
        
        const localUsers = await userModel.find({ provider: 'local' });
        console.log(`📈 Local users: ${localUsers.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
}

checkUsers();