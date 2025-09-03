const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, adminOrOwner } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
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

    const { firstName, lastName, username } = req.body;
    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateFields.username = username;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin or owner only)
// @access  Private
router.get('/:id', protect, adminOrOwner, async (req, res) => {
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

// @route   DELETE /api/users/:id
// @desc    Delete user (admin or owner only)
// @access  Private
router.delete('/:id', protect, adminOrOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - mark as inactive instead of removing
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
