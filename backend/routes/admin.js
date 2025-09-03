const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect, admin);

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status !== '') {
      query.isActive = status === 'active';
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/users/:id', [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('subscription')
    .optional()
    .isIn(['free', 'basic', 'premium'])
    .withMessage('Subscription must be free, basic, or premium')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { firstName, lastName, role, isActive, subscription } = req.body;
    const updateFields = {};

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (role !== undefined) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (subscription !== undefined) updateFields.subscription = subscription;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error during user update' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:userId/approve-admin
// @desc    Approve a user's admin request
// @access  Admin
router.put('/users/:userId/approve-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }
    if (!user.pendingAdminRequest) {
      return res.status(400).json({ message: 'No pending admin request for this user' });
    }
    user.role = 'admin';
    user.pendingAdminRequest = false;
    await user.save();
    res.json({ message: 'User promoted to admin', user: user.getProfile(), userId: user._id });
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).json({ message: 'Server error during admin approval' });
  }
});

// @route   PUT /api/admin/users/:userId/disapprove-admin
// @desc    Disapprove a user's admin request
// @access  Admin
router.put('/users/:userId/disapprove-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.pendingAdminRequest) {
      return res.status(400).json({ message: 'No pending admin request for this user' });
    }
    user.pendingAdminRequest = false;
    await user.save();
    res.json({ message: 'Admin request disapproved', user: user.getProfile(), userId: user._id });
  } catch (error) {
    console.error('Disapprove admin error:', error);
    res.status(500).json({ message: 'Server error during admin disapproval' });
  }
});

// @route   GET /api/admin/pending-requests
// @desc    Get all pending admin requests
// @access  Admin
router.get('/pending-requests', async (req, res) => {
  try {
    const requests = await User.find({ pendingAdminRequest: true }).select('-password');
    // For each request, return user info and request date (createdAt)
    const formatted = requests.map(user => ({
      _id: user._id,
      user: user.getProfile(),
      requestDate: user.updatedAt || user.createdAt
    }));
    res.json({ requests: formatted });
  } catch (error) {
    console.error('Get pending admin requests error:', error);
    res.status(500).json({ message: 'Server error fetching pending admin requests' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics (admin only)
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Subscription statistics
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription',
          count: { $sum: 1 }
        }
      }
    ]);

    // Data usage statistics
    const dataUsageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUploads: { $sum: '$dataUsage.totalUploads' },
          totalStorage: { $sum: '$dataUsage.totalStorage' },
          avgUploads: { $avg: '$dataUsage.totalUploads' }
        }
      }
    ]);

    res.json({
      userStats: {
        total: totalUsers,
        active: activeUsers,
        admin: adminUsers,
        newThisMonth: newUsersThisMonth
      },
      subscriptionStats,
      dataUsageStats: dataUsageStats[0] || { totalUploads: 0, totalStorage: 0, avgUploads: 0 }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
