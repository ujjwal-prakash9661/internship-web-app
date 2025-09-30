const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const {generateToken} = require('../utils/jwt')
const passport = require('passport');

const CLIENT_REDIRECT_URL = process.env.CLIENT_REDIRECT_URL || 'http://localhost:5173';
const CLIENT_OAUTH_REDIRECT_PATH = '/oauth/github/callback';

async function register(req, res)
{
    try
    {
        const {name, email, password} = req.body;

        if(!name || !email || !password)
        {
            return res.status(400).json({
                message : "Please fill all the fields"
            })
        }

        let existingUser = await userModel.findOne({email})

        if(existingUser)
        {
            return res.status(400).json({
                message: "User with this email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password : hashedPassword
        });

        const token = generateToken(user)

        res.cookie('token', token)

        return res.status(201).json({
            message: "User Registered Successfully",
            user: { id: user._id, name: user.name, email: user.email },
            token
        })
    }

    catch(err)
    {
        res.status(500).json({
            message: "Server error during registration",
            error: err.message
        });
    }
}

async function login(req, res)
{
    try
    {
        const {email, password} = req.body

        if(!email || !password)
        {
            return res.status(400).json({ 
                message: "Please provide email and password" 
            });
        }

        const user = await userModel.findOne({email})
        if(!user || user.provider !== 'local')
        {
            return res.status(400).json({ message: "Invalid credentials or user signed up with provider" });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched)
        {
            return res.status(400).json({
                message: "Incorrect Password"
            })
        }

        const token = generateToken(user);
        res.cookie("token", token);

        return res.status(200).json({
            message: "Login Successful",
            user: { id: user._id, name: user.name, email: user.email },
            token
        });
    }

    catch(err)
    {
        res.status(500).json({
            message: "Server error during login",
            error: err.message
        });
    }
}

function githubLogin(req, res, next) {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
}

async function githubAuthCallback(req, res, next)
{
    passport.authenticate('github', {failureRedirect : '/', session : false}, (err, user, info) => {
        if(err || !user)
        {
            return res.status(400).json({
                message : "Github authentication failed",
                error : err ? err.message : info.message
            })
        }

        const token = generateToken(user)
        // Set a cookie for users who continue browsing inside the backend domain
        res.cookie('token', token, {
            httpOnly: false,
            sameSite: 'lax',
        });

        // Redirect back to the client and let the frontend complete the login
        const redirectUrl = new URL(CLIENT_OAUTH_REDIRECT_PATH, CLIENT_REDIRECT_URL);
        redirectUrl.searchParams.set('token', token);

        return res.redirect(redirectUrl.toString());
    })(req, res, next)
}

async function getUserProfile(req, res) {
    try {
        console.log('🔍 Profile Request - User ID:', req.user.id);
        const user = await userModel.findById(req.user.id).select('-password');
        if (!user) {
            console.log('❌ User not found for profile request:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ User profile retrieved:', {
            id: user._id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            skillsCount: user.skills ? user.skills.length : 0,
            githubUsername: user.githubUsername
        });

        res.status(200).json({
            message: 'User profile retrieved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                skills: user.skills,
                githubUsername: user.githubUsername,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('❌ Profile fetch error:', err);
        res.status(500).json({
            message: 'Server error while fetching user profile',
            error: err.message
        });
    }
}

module.exports = {
    register,
    login,
    githubLogin,
    githubAuthCallback,
    getUserProfile
}