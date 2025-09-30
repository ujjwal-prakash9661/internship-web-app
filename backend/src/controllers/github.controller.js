const axios = require('axios')
const userModel = require('../models/user.model')

async function syncGitHubSkills(req, res)
{
    console.log('🔄 Starting GitHub skills sync...');
    try
    {
        console.log('👤 Looking up user with ID:', req.user.id);
        const user = await userModel.findById(req.user.id);
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(404).json({
                message : "User not found"
            });
        }

        console.log('👤 User found:', {
            name: user.name,
            email: user.email,
            provider: user.provider,
            githubId: user.githubId,
            githubUsername: user.githubUsername,
            currentSkills: user.skills
        });

        if(!user || user.provider !== 'github' || !user.githubId)
        {
            console.log('❌ User is not connected to GitHub or missing GitHub data');
            return res.status(400).json({
                message : "User isn't connected to GitHub"
            })
        }

        const githubApiUsername = user.githubUsername || user.name;
        if (!githubApiUsername) {
            console.log('❌ GitHub username not available');
            return res.status(400).json({
                message: "GitHub username not available for this user"
            });
        }

        console.log(`🔍 Fetching GitHub data for username: ${githubApiUsername}`);

        const githubUserResponse = await axios.get(`https://api.github.com/users/${githubApiUsername}`);
        console.log(`✅ GitHub user found: ${githubUserResponse.data.login}`);

        const repo_url = githubUserResponse.data.repos_url;
        console.log(`📦 Repository URL: ${repo_url}`);

        const reposResponse = await axios.get(repo_url);
        console.log(`📊 Found ${reposResponse.data.length} repositories`);

        if (reposResponse.data.length === 0) {
            console.log('⚠️ No repositories found for this user');
            return res.status(200).json({
                message: 'No repositories found to extract skills from',
                skills: user.skills || []
            });
        }

        const languagePromises = reposResponse.data.map(r => {
            console.log(`🔍 Fetching languages for repo: ${r.name}`);
            return axios.get(r.languages_url);
        });

        const languageResponses = await Promise.all(languagePromises)
        console.log(`📝 Retrieved language data for ${languageResponses.length} repositories`);

        const skillsSet = new Set(user.skills || []);
        let newSkillsFound = 0;
        
        languageResponses.forEach((response, index) => {
            const languages = Object.keys(response.data);
            console.log(`Repository ${index + 1} languages:`, languages);
            languages.forEach(lang => {
                if (!skillsSet.has(lang)) {
                    newSkillsFound++;
                }
                skillsSet.add(lang);
            });
        });

        user.skills = Array.from(skillsSet);
        await user.save();

        console.log(`✅ Skills synchronized successfully! Found ${newSkillsFound} new skills`);
        console.log(`📝 Final skills list: ${user.skills.join(', ')}`);

        return res.status(200).json({
            message: 'Skills synchronized successfully!',
            skills: user.skills,
            newSkillsFound: newSkillsFound
        });
    }

    catch(err)
    {
        console.error('❌ Error syncing GitHub skills:', err.message);
        if (err.response) {
            console.error('📡 API Response Error:', err.response.status, err.response.data);
        }
        return res.status(500).json({
            message: 'Failed to sync GitHub skills.',
            error: err.message
        });
    }
}

module.exports = {
    syncGitHubSkills
}