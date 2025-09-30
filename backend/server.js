// Load environment variables first
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
})

// Import app and db after env variables are loaded
const app = require('./src/app')
const connectDB = require('./src/db/db')

connectDB()

app.listen(3000, () => {
    console.log("Server is runing on port 3000")
})