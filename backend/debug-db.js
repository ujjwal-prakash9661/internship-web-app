// Debug database connection
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});

const mongoose = require('mongoose');

async function debugDB() {
    try {
        console.log('🔍 Debugging Database Connection...\n');
        console.log('MONGO_URI:', process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get database name
        const dbName = mongoose.connection.db.databaseName;
        console.log(`📊 Connected to database: ${dbName}`);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📋 Collections in database (${collections.length}):`);
        
        for (const collection of collections) {
            console.log(`  📁 ${collection.name}`);
            
            // Count documents in each collection
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`     📊 Documents: ${count}`);
            
            // If it's users collection, show some sample data
            if (collection.name === 'users' && count > 0) {
                console.log('     👥 Sample users:');
                const sampleUsers = await mongoose.connection.db.collection('users').find({}).limit(3).toArray();
                sampleUsers.forEach(user => {
                    console.log(`       - ${user.name} (${user.provider}) - Skills: ${user.skills?.length || 0}`);
                });
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

debugDB();