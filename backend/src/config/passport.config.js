const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const userModel = require('../models/user.model');
const axios = require('axios');

// Helper function to fetch GitHub skills
async function fetchGitHubSkills(githubUsername) {
    try {
        console.log(`🔍 Fetching skills for GitHub user: ${githubUsername}`);
        
        const githubUserResponse = await axios.get(`https://api.github.com/users/${githubUsername}`);
        const repo_url = githubUserResponse.data.repos_url;
        
        const reposResponse = await axios.get(repo_url);
        console.log(`📦 Found ${reposResponse.data.length} repositories for ${githubUsername}`);
        
        if (reposResponse.data.length === 0) {
            console.log('⚠️ No repositories found, returning empty skills');
            return [];
        }

        const languagePromises = reposResponse.data.map(r => {
            return axios.get(r.languages_url).catch(err => {
                console.log(`⚠️ Failed to fetch languages for repo ${r.name}:`, err.message);
                return { data: {} };
            });
        });

        const languageResponses = await Promise.all(languagePromises);
        
        const skillsSet = new Set();
        languageResponses.forEach((response) => {
            const languages = Object.keys(response.data);
            languages.forEach(lang => skillsSet.add(lang));
        });

        const skills = Array.from(skillsSet);
        console.log(`✅ Successfully fetched ${skills.length} skills:`, skills);
        return skills;
        
    } catch (error) {
        console.error(`❌ Error fetching GitHub skills for ${githubUsername}:`, error.message);
        return [];
    }
}

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "https://internship-web-app-42i2.onrender.com/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists by GitHub ID
        let user = await userModel.findOne({ githubId: profile.id });
        
        if (user) {
            console.log(`🔄 Updating existing GitHub user: ${profile.username}`);
            
            // Update user data in case profile has changed
            user.name = profile.displayName || profile.username || user.name;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            user.githubUsername = profile.username || user.githubUsername;
            
            // ALWAYS refresh skills from GitHub on every login to ensure they're up-to-date
            console.log('🔍 Refreshing skills from GitHub repositories...');
            const githubSkills = await fetchGitHubSkills(profile.username);
            user.skills = githubSkills;
            console.log(`✅ Updated user skills: ${githubSkills.length} skills found`);
            
            await user.save();
            return done(null, user);
        }

        // Check if user exists by email (linking account case)
        const emailFromProfile = profile.emails?.[0]?.value;
        if (emailFromProfile) {
            user = await userModel.findOne({ email: emailFromProfile });
            
            if (user && user.provider === 'local') {
                console.log(`🔗 Linking local account to GitHub: ${profile.username}`);
                
                // Link the local account to GitHub
                user.provider = 'github';
                user.githubId = profile.id;
                user.githubUsername = profile.username;
                user.avatar = profile.photos?.[0]?.value || user.avatar;
                user.name = profile.displayName || profile.username || user.name;
                
                // Fetch GitHub skills when linking account
                const githubSkills = await fetchGitHubSkills(profile.username);
                user.skills = githubSkills;
                console.log(`✅ Account linked with ${githubSkills.length} GitHub skills`);
                
                await user.save();
                return done(null, user);
            }
        }

        // Create new user for GitHub authentication
        console.log(`🚀 Creating new GitHub user: ${profile.username}`);
        
        // Fetch GitHub skills during user creation
        const githubSkills = await fetchGitHubSkills(profile.username);
        
        const newUser = new userModel({
            name: profile.displayName || profile.username || 'GitHub User',
            email: emailFromProfile || `${profile.username}@github.local`,
            provider: 'github',
            githubId: profile.id,
            githubUsername: profile.username,
            avatar: profile.photos?.[0]?.value,
            skills: githubSkills // Automatically populate skills from GitHub
        });

        await newUser.save();
        console.log(`✅ New GitHub user created with ${githubSkills.length} skills:`, githubSkills);
        return done(null, newUser);
        
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;