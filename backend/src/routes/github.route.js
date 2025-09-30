const express = require('express');
const githubController = require('../controllers/github.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const userModel = require('../models/user.model')

const router = express.Router();

router.post('/sync-skills', authMiddleware.authMiddleware, githubController.syncGitHubSkills)

// Fix route for users with empty skills
router.post('/fix-empty-skills', async (req, res) => {
    try {
        const usersWithEmptySkills = await userModel.find({
            provider: 'github',
            githubUsername: { $exists: true },
            $or: [
                { skills: { $exists: false } },
                { skills: { $size: 0 } }
            ]
        });

        console.log(`🔧 Found ${usersWithEmptySkills.length} GitHub users with empty skills`);

        const axios = require('axios');
        let fixedUsers = 0;

        for (const user of usersWithEmptySkills) {
            try {
                console.log(`🔍 Fixing skills for user: ${user.githubUsername}`);
                
                const githubUserResponse = await axios.get(`https://api.github.com/users/${user.githubUsername}`);
                const repo_url = githubUserResponse.data.repos_url;
                
                const reposResponse = await axios.get(repo_url);
                
                if (reposResponse.data.length === 0) {
                    console.log(`⚠️ No repositories found for ${user.githubUsername}`);
                    continue;
                }

                const languagePromises = reposResponse.data.map(r => {
                    return axios.get(r.languages_url).catch(() => ({ data: {} }));
                });

                const languageResponses = await Promise.all(languagePromises);
                
                const skillsSet = new Set();
                languageResponses.forEach((response) => {
                    const languages = Object.keys(response.data);
                    languages.forEach(lang => skillsSet.add(lang));
                });

                const skills = Array.from(skillsSet);
                
                user.skills = skills;
                await user.save();
                
                console.log(`✅ Fixed skills for ${user.githubUsername}: ${skills.length} skills`);
                fixedUsers++;
                
            } catch (error) {
                console.error(`❌ Failed to fix skills for ${user.githubUsername}:`, error.message);
            }
        }

        res.json({
            message: `Fixed skills for ${fixedUsers} out of ${usersWithEmptySkills.length} users`,
            fixedUsers,
            totalUsersWithEmptySkills: usersWithEmptySkills.length
        });

    } catch (error) {
        console.error('❌ Error fixing empty skills:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug route to check GitHub users
router.get('/debug/users', async (req, res) => {
    try {
        const users = await userModel.find({}).select('name email provider githubId githubUsername skills');
        res.json({
            totalUsers: users.length,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                provider: u.provider,
                githubId: u.githubId,
                githubUsername: u.githubUsername,
                skills: u.skills
            }))
        });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// Test route to create a GitHub user for debugging
router.post('/debug/create-test-user', async (req, res) => {
    try {
        // Create a test user with GitHub provider
        const testUser = new userModel({
            name: 'Test GitHub User',
            email: 'testgithub@example.com',
            provider: 'github',
            githubId: '123456',
            githubUsername: 'octocat', // This is a real GitHub username for testing
            skills: []
        });
        
        await testUser.save();
        
        res.json({
            message: 'Test GitHub user created',
            user: {
                id: testUser._id,
                name: testUser.name,
                email: testUser.email,
                provider: testUser.provider,
                githubId: testUser.githubId,
                githubUsername: testUser.githubUsername
            }
        });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;