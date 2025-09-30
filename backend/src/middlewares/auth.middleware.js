const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

async function authMiddleware(req, res, next)
{
    let token;
    console.log("Auth Header:", req.headers.authorization);
    
    try
    {
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
        {
            token = req.headers.authorization.split(" ")[1];
            console.log("Extracted token:", token ? "Present" : "Missing");

            const decode = jwt.verify(token, process.env.JWT_SECRET)
            console.log("Token decoded successfully, user ID:", decode.id)

            req.user = await userModel.findById(decode.id).select('-password');

            if(!req.user)
            {
                console.log("User not found in database for ID:", decode.id);
                return res.status(401).json({
                    message : "User not found"
                })
            }

            console.log("Auth successful for user:", req.user.name || req.user.email);
            return next();
        }
        else
        {
            console.log("No Bearer token found in authorization header");
        }
    }
    catch(err)
    {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({
            message: 'Unauthorized, token failed'
        })
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
}

module.exports = {
    authMiddleware
}