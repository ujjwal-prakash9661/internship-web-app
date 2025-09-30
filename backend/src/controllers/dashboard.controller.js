const User = require('../models/user.model');
const Internship = require('../models/internship.model');
const Application = require('../models/application.model');

// Get Dashboard Overview Data
const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('🔍 Dashboard Overview Request - User ID:', userId);
        
        // Get user data - STRICT user isolation
        const user = await User.findById(userId).select('-password');
        if (!user) {
            console.log(`❌ Unauthorized access attempt for user ID: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ User found for dashboard:', {
            id: user._id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            githubUsername: user.githubUsername,
            skillsCount: user.skills ? user.skills.length : 0
        });

        // Log for security audit
        console.log(`User ${userId} (${user.email}) accessed their dashboard`);

        // Get user applications and total internships available
        const userApplications = await Application.find({ user: userId });
        
        // Execute all queries in parallel for better performance
        const [totalInternships, appliedInternships] = await Promise.all([
            Internship.countDocuments(), // Total internships available in the system
            Promise.resolve(userApplications.length) // Count of internships user has applied to
        ]);

        console.log('📊 Internship counts:', {
            totalInternships,
            appliedInternships,
            userApplicationsFound: userApplications.length
        });
        
        // Get internships count by user's skills (if they have any)
        let matchingInternships = 0;
        if (user.skills && user.skills.length > 0) {
            matchingInternships = await Internship.countDocuments({
                $or: [
                    { requiredSkills: { $in: user.skills } },
                    { title: { $regex: user.skills.join('|'), $options: 'i' } },
                    { description: { $regex: user.skills.join('|'), $options: 'i' } }
                ]
            });
        }

        // Get user's recent internship interactions (ONLY for this user)
        let recentInternships = [];
        
        if (userApplications && userApplications.length > 0) {
            // User has interactions, show their recent internships
            const detailedApplications = await Application.find({ user: userId })
                .populate('internship', 'title company location stipend duration type createdAt applyLink')
                .sort({ updatedAt: -1 })
                .limit(5)
                .exec();
                
                recentInternships = detailedApplications
                .filter(app => app.internship) 
                .map(app => ({
                    ...app.internship.toObject(),
                    userStatus: app.status,
                    interactionDate: app.updatedAt
                }));

        } else {
            // New user without interactions - show EMPTY array unless they have GitHub connected
            if (user.provider === 'github' && user.skills && user.skills.length > 0) {
                // Only GitHub users get suggestions based on skills
                recentInternships = await Internship.find({
                    $or: [
                        { requiredSkills: { $in: user.skills } },
                        { title: { $regex: user.skills.join('|'), $options: 'i' } },
                        { description: { $regex: user.skills.join('|'), $options: 'i' } }
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('title company location stipend duration type createdAt applyLink');
            } else {
                // New users without GitHub connection get no suggestions
                recentInternships = [];
            }
        }

        // Calculate profile completion percentage
        let profileCompletion = 0;
        const totalFields = 6; // name, email, avatar, skills, githubUsername, provider
        
        if (user.name) profileCompletion++;
        if (user.email) profileCompletion++;
        if (user.avatar) profileCompletion++;
        if (user.skills && user.skills.length > 0) profileCompletion++;
        if (user.githubUsername) profileCompletion++;
        if (user.provider) profileCompletion++;
        
        const profileCompletionPercentage = Math.round((profileCompletion / totalFields) * 100);

        // Get user activity stats
        const userStats = {
            profileCompletion: profileCompletionPercentage,
            totalSkills: user.skills ? user.skills.length : 0,
            isGithubConnected: user.provider === 'github',
            memberSince: user.createdAt
        };

        // Prepare response data
        const dashboardData = {
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                skills: user.skills || [],
                githubUsername: user.githubUsername,
                provider: user.provider
            },
            stats: {
                totalInternships,
                matchingInternships,
                appliedInternships,
                ...userStats
            },
            recentInternships,
            quickActions: [
                {
                    title: 'Complete Profile',
                    description: 'Add more details to get better recommendations',
                    action: 'profile',
                    priority: profileCompletionPercentage < 80 ? 'high' : 'low'
                },
                {
                    title: 'Connect GitHub',
                    description: 'Sync your skills automatically',
                    action: 'github',
                    priority: user.provider !== 'github' ? 'high' : 'completed'
                },
                {
                    title: 'Browse Recommendations',
                    description: 'View personalized internship matches',
                    action: 'recommendations',
                    priority: 'medium'
                }
            ]
        };

        console.log('✅ Dashboard data prepared successfully:', {
            userSkills: dashboardData.user.skills?.length || 0,
            totalInternships: dashboardData.stats.totalInternships,
            matchingInternships: dashboardData.stats.matchingInternships,
            appliedInternships: dashboardData.stats.appliedInternships,
            recentInternshipsCount: dashboardData.recentInternships.length
        });

        res.status(200).json({
            success: true,
            message: 'Dashboard data fetched successfully',
            data: dashboardData
        });

    } catch (error) {
        console.error('❌ Dashboard overview error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

// Get User Profile Stats
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate various stats
        const stats = {
            accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
            skillsCount: user.skills ? user.skills.length : 0,
            profileViews: Math.floor(Math.random() * 100) + 20, // Mock data
            applicationsSubmitted: Math.floor(Math.random() * 10), // Mock data
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats',
            error: error.message
        });
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, skills } = req.body;

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (skills && Array.isArray(skills)) {
            // Clean up skills array - remove empty strings and duplicates
            updateData.skills = [...new Set(skills.filter(skill => skill && skill.trim()).map(skill => skill.trim()))];
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardOverview,
    getUserStats,
    updateProfile
};