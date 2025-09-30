const mongoose = require('mongoose')

async function connectDB()
{
    try
    {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    }

    catch(err)
    {
        console.log("Error in connecting to DB", err.message)
        process.exit(1)
    }
}

module.exports = connectDB