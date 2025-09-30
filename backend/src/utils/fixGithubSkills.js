const userModel = require('../models/user.model');
const axios = require('axios');

async function fixExistingGitHubUsers() {
    try {
        console.log('🔧 Checking for GitHub users with empty skills...');
        
        const usersWithEmptySkills = await userModel.find({
            provider: 'github',
            githubUsername: { $exists: true },
            $or: [
                { skills: { $exists: false } },
                { skills: { $size: 0 } }
            ]
        });

        if (usersWithEmptySkills.length === 0) {
            console.log('✅ All GitHub users already have skills populated');
            return;
        }

        console.log(`🔧 Found ${usersWithEmptySkills.length} GitHub users with empty skills`);

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
                
                console.log(`✅ Fixed skills for ${user.githubUsername}: ${skills.join(', ')}`);
                fixedUsers++;
                
            } catch (error) {
                console.error(`❌ Failed to fix skills for ${user.githubUsername}:`, error.message);
            }
        }

        console.log(`🎉 Successfully fixed skills for ${fixedUsers} out of ${usersWithEmptySkills.length} GitHub users`);
        
    } catch (error) {
        console.error('❌ Error in fixExistingGitHubUsers:', error);
    }
}

module.exports = { fixExistingGitHubUsers };