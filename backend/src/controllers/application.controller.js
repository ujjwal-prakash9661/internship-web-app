const Application = require('../models/application.model');
const User = require('../models/user.model');
const Internship = require('../models/internship.model');

// Record user interaction with internship
const recordInteraction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { internshipId, status = 'viewed', source = 'dashboard' } = req.body;

        if (!internshipId) {
            return res.status(400).json({
                success: false,
                message: 'Internship ID is required'
            });
        }

        // Check if internship exists
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Find existing application or create new one
        let application = await Application.findOne({
            user: userId,
            internship: internshipId
        });

        if (application) {
            // Update existing application
            application.status = status;
            application.applicationSource = source;
            if (status === 'applied') {
                application.appliedAt = new Date();
            }
            await application.save();
        } else {
            // Create new application record
            application = new Application({
                user: userId,
                internship: internshipId,
                status,
                applicationSource: source,
                viewedAt: new Date(),
                appliedAt: status === 'applied' ? new Date() : undefined
            });
            await application.save();
        }

        // Update user activity
        const user = await User.findById(userId);
        if (status === 'applied') {
            user.activity.totalApplications += 1;
        }
        user.activity.totalViews += 1;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Internship ${status} successfully`,
            data: application
        });

    } catch (error) {
        console.error('Record interaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record interaction',
            error: error.message
        });
    }
};

// Get user's applications
const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Ensure user can only access their own applications
        const query = { user: userId };
        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('internship', 'title company location stipend duration type createdAt applyLink')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const totalApplications = await Application.countDocuments(query);

        // Log for security audit
        console.log(`User ${userId} accessed ${applications.length} of their applications`);

        res.status(200).json({
            success: true,
            message: 'User applications fetched successfully',
            data: {
                applications,
                totalPages: Math.ceil(totalApplications / limit),
                currentPage: parseInt(page),
                total: totalApplications,
                userId: userId // Include user context for verification
            }
        });

    } catch (error) {
        console.error('Get user applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};

// Get user's recent internship interactions
const getRecentInteractions = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;

        // Strictly filter by user ID to prevent data leakage
        const recentInteractions = await Application.find({ user: userId })
            .populate('internship', 'title company location stipend duration type createdAt applyLink')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .exec();

        // Log for security audit
        console.log(`User ${userId} accessed ${recentInteractions.length} recent interactions`);

        res.status(200).json({
            success: true,
            message: 'Recent interactions fetched successfully',
            data: {
                interactions: recentInteractions,
                userId: userId,
                count: recentInteractions.length
            }
        });

    } catch (error) {
        console.error('Get recent interactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent interactions',
            error: error.message
        });
    }
};

// Delete user's specific application
const deleteUserApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { applicationId } = req.params;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required'
            });
        }

        // Ensure user can only delete their own applications
        const application = await Application.findOneAndDelete({
            _id: applicationId,
            user: userId // Double security check
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or access denied'
            });
        }

        // Log for security audit
        console.log(`User ${userId} deleted application ${applicationId}`);

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully',
            data: { deletedApplicationId: applicationId }
        });

    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete application',
            error: error.message
        });
    }
};

// Get application status for specific internship
const getApplicationStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { internshipId } = req.params;

        if (!internshipId) {
            return res.status(400).json({
                success: false,
                message: 'Internship ID is required'
            });
        }

        // Find user's application for this internship
        const application = await Application.findOne({
            user: userId,
            internship: internshipId
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'No application found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application status retrieved successfully',
            data: {
                status: application.status,
                viewedAt: application.viewedAt,
                appliedAt: application.appliedAt,
                applicationSource: application.applicationSource,
                userId: userId
            }
        });

    } catch (error) {
        console.error('Get application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get application status',
            error: error.message
        });
    }
};

// Clear all user data (for complete user data cleanup)
const clearAllUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Delete all applications for this user
        const deleteResult = await Application.deleteMany({ user: userId });
        
        // Reset user activity counters
        await User.findByIdAndUpdate(userId, {
            'activity.totalApplications': 0,
            'activity.totalViews': 0
        });

        // Log for security audit
        console.log(`User ${userId} cleared all their application data - ${deleteResult.deletedCount} applications removed`);

        res.status(200).json({
            success: true,
            message: 'All user applications cleared successfully',
            data: { 
                deletedCount: deleteResult.deletedCount,
                userId: userId 
            }
        });

    } catch (error) {
        console.error('Clear all applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear user applications',
            error: error.message
        });
    }
};

module.exports = {
    recordInteraction,
    getUserApplications,
    getRecentInteractions,
    getApplicationStatus,
    deleteUserApplication,
    clearAllUserApplications
};