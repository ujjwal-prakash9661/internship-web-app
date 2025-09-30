const userModel = require('../models/user.model')
const internshipModel = require('../models/internship.model')

async function getRecommendedInternships(req, res)
{
    try
    {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        
        // Log for security audit
        console.log(`User ${userId} (${user?.email || 'unknown'}) requested recommendations`);
        
        if(!user || !user.skills || user.skills.length === 0)
        {
            // Only show recommendations to users who have connected GitHub
            if (user.provider !== 'github') {
                return res.status(200).json({
                    message: "Connect GitHub to get personalized recommendations based on your skills",
                    recommendations: [],
                    requiresGitHub: true
                });
            }

            // GitHub users without synced skills get general recommendations
            const allInternships = await internshipModel.find({}).sort({createdAt : -1}).lean()
            
            // Add default match data for GitHub users without skills
            const internshipsWithMatchData = allInternships.map(internship => ({
                ...internship,
                matchScore: 0,
                matchPercentage: 0,
                matchLabel: 'General'
            }));

            return res.status(200).json({
                message : "Skills not synced, returning general recommendations. Sync your skills for better matches.",
                recommendations : internshipsWithMatchData
            })
        }

        const userSkills = new Set(user.skills.map(skill => skill.toLowerCase()))

        const allInternships = await internshipModel.find({}).lean()
        const scoredInternships = allInternships.map(internship => {
            let matchScore = 0

            if(internship.requiredSkills && internship.requiredSkills.length > 0)
            {
                internship.requiredSkills.forEach(requiredSkill => {
                    if(userSkills.has(requiredSkill.toLowerCase()))
                    {
                        matchScore++
                    }
                })
            }

            // Calculate match percentage based on required skills
            const matchPercentage = internship.requiredSkills && internship.requiredSkills.length > 0 
                ? Math.round((matchScore / internship.requiredSkills.length) * 100) 
                : 0;

            // Determine match label based on percentage and absolute score
            let matchLabel = 'No Match';
            if (matchPercentage >= 80 || matchScore >= 4) {
                matchLabel = 'Best Match';
            } else if (matchPercentage >= 50 || matchScore >= 2) {
                matchLabel = 'Good Match';
            } else if (matchPercentage >= 25 || matchScore >= 1) {
                matchLabel = 'Partial Match';
            }

            return { 
                ...internship, 
                matchScore, 
                matchPercentage, 
                matchLabel 
            };
        })

        const sortedInternships = scoredInternships.sort((a, b) => b.matchScore - a.matchScore)

        // Log for security audit  
        console.log(`User ${userId} received ${sortedInternships.length} personalized recommendations`);

        res.status(200).json({
            message : "Successfully fetched recomendations",
            recommendations : sortedInternships,
            userContext: {
                userId: userId,
                skillsCount: user.skills ? user.skills.length : 0,
                totalRecommendations: sortedInternships.length
            }
        })
    }

    catch(err)
    {
        console.error('Error getting recommendations:', err.message);
        res.status(500).json({ message: 'Failed to get recommendations.' });
    }
}   

module.exports = {
    getRecommendedInternships
};