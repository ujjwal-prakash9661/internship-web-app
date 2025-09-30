// Load environment variables first
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
})

// Import app and db after env variables are loaded
const app = require('./src/app')
const connectDB = require('./src/db/db')
const { fixExistingGitHubUsers } = require('./src/utils/fixGithubSkills')

connectDB().then(async () => {
    // Fix existing GitHub users with empty skills on server startup
    setTimeout(async () => {
        await fixExistingGitHubUsers();
    }, 2000); // Wait 2 seconds after DB connection
})

app.listen(3000, () => {
    console.log("Server is runing on port 3000")
})