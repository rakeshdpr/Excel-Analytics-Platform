const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate storage in MB for better readability
    const storageMB = (user.dataUsage.totalStorage / (1024 * 1024)).toFixed(2);
    
    const overview = {
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      dataUsage: {
        totalUploads: user.dataUsage.totalUploads,
        totalStorage: user.dataUsage.totalStorage,
        totalStorageMB: storageMB,
        lastUpload: user.dataUsage.lastUpload
      },
      subscription: {
        current: user.subscription,
        limits: getSubscriptionLimits(user.subscription)
      }
    };

    res.json(overview);

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/profile
// @desc    Get user profile for dashboard
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      user: {
        ...user.toObject(),
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get user activity summary
// @access  Private
router.get('/activity', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get recent activity (placeholder for Week 2+)
    const activity = {
      recentUploads: [], // Will be populated in Week 2
      recentAnalyses: [], // Will be populated in Week 3
      totalAnalyses: 0, // Will be populated in Week 3
      lastActivity: user.lastLogin || user.createdAt
    };

    res.json(activity);

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/settings
// @desc    Get user settings
// @access  Private
router.get('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const settings = {
      notifications: {
        email: true, // Default settings
        push: false
      },
      privacy: {
        profileVisibility: 'public',
        dataSharing: false
      },
      preferences: {
        theme: 'light',
        language: 'en'
      }
    };

    res.json(settings);

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/dashboard/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', async (req, res) => {
  try {
    const { notifications, privacy, preferences } = req.body;
    
    // For now, just return success (settings will be implemented in future weeks)
    res.json({
      message: 'Settings updated successfully',
      settings: { notifications, privacy, preferences }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get subscription limits
function getSubscriptionLimits(subscription) {
  const limits = {
    free: {
      maxUploads: 5,
      maxStorage: 50 * 1024 * 1024, // 50MB
      maxAnalyses: 10,
      features: ['Basic charts', 'PNG export']
    },
    basic: {
      maxUploads: 50,
      maxStorage: 500 * 1024 * 1024, // 500MB
      maxAnalyses: 100,
      features: ['Advanced charts', 'PNG/PDF export', '3D charts']
    },
    premium: {
      maxUploads: -1, // Unlimited
      maxStorage: -1, // Unlimited
      maxAnalyses: -1, // Unlimited
      features: ['All features', 'AI insights', 'Priority support']
    }
  };

  return limits[subscription] || limits.free;
}

module.exports = router;
