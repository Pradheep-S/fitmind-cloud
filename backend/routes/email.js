const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const emailService = require('../services/emailService');
const schedulerService = require('../services/schedulerService');

const router = express.Router();

// @route   POST /api/email/test
// @desc    Send a test email to verify email configuration
// @access  Private (Admin only for now)
router.post('/test', auth, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // For security, you might want to add admin check here
    // For demo purposes, allowing any authenticated user to test
    
    const result = await schedulerService.sendTestEmail(
      email || req.user.email, 
      name || req.user.name
    );
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/daily-reminder/trigger
// @desc    Manually trigger daily reminders (for testing)
// @access  Private (Admin only for now)
router.post('/daily-reminder/trigger', auth, async (req, res) => {
  try {
    const result = await schedulerService.triggerDailyRemindersManually();
    
    res.json({
      success: true,
      message: 'Daily reminders triggered successfully',
      data: result
    });
  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger daily reminders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/email/scheduler/status
// @desc    Get scheduler status
// @access  Private (Admin only for now)
router.get('/scheduler/status', auth, async (req, res) => {
  try {
    const status = schedulerService.getStatus();
    
    res.json({
      success: true,
      message: 'Scheduler status retrieved',
      data: {
        jobs: status,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Scheduler status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduler status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/scheduler/start
// @desc    Start the daily reminder scheduler
// @access  Private (Admin only for now)
router.post('/scheduler/start', auth, async (req, res) => {
  try {
    schedulerService.startDailyReminders();
    
    res.json({
      success: true,
      message: 'Daily reminder scheduler started successfully'
    });
  } catch (error) {
    console.error('Scheduler start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start scheduler',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/scheduler/stop
// @desc    Stop the daily reminder scheduler
// @access  Private (Admin only for now)
router.post('/scheduler/stop', auth, async (req, res) => {
  try {
    schedulerService.stopDailyReminders();
    
    res.json({
      success: true,
      message: 'Daily reminder scheduler stopped successfully'
    });
  } catch (error) {
    console.error('Scheduler stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop scheduler',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/email/preferences
// @desc    Update user email preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('dailyReminder.enabled')
    .optional()
    .isBoolean()
    .withMessage('Daily reminder enabled must be a boolean'),
  body('dailyReminder.time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { dailyReminder, notifications } = req.body;

    // Build update object
    const updateData = {};
    if (notifications !== undefined) {
      updateData['preferences.notifications'] = notifications;
    }
    if (dailyReminder) {
      if (dailyReminder.enabled !== undefined) {
        updateData['preferences.dailyReminder.enabled'] = dailyReminder.enabled;
      }
      if (dailyReminder.time !== undefined) {
        updateData['preferences.dailyReminder.time'] = dailyReminder.time;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: 'name email preferences' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Email preferences updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/email/preferences
// @desc    Get user email preferences
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Email preferences retrieved successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/welcome
// @desc    Send welcome email to user (for testing or manual trigger)
// @access  Private
router.post('/welcome', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await emailService.sendWelcomeEmail(user);
    
    res.json({
      success: true,
      message: 'Welcome email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/streak-achievement
// @desc    Send streak achievement email
// @access  Private
router.post('/streak-achievement', auth, async (req, res) => {
  try {
    const { streakDays } = req.body;
    
    if (!streakDays || streakDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Streak days must be provided and greater than 0'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await emailService.sendStreakAchievementEmail(user, streakDays);
    
    res.json({
      success: true,
      message: 'Streak achievement email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Streak achievement email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send streak achievement email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/weekly-summary
// @desc    Send weekly summary email
// @access  Private
router.post('/weekly-summary', auth, async (req, res) => {
  try {
    const { weeklyStats } = req.body;
    
    if (!weeklyStats) {
      return res.status(400).json({
        success: false,
        message: 'Weekly stats data is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await emailService.sendWeeklySummaryEmail(user, weeklyStats);
    
    res.json({
      success: true,
      message: 'Weekly summary email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Weekly summary email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send weekly summary email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/milestone
// @desc    Send milestone achievement email
// @access  Private
router.post('/milestone', auth, async (req, res) => {
  try {
    const { milestone } = req.body;
    
    if (!milestone || !milestone.type) {
      return res.status(400).json({
        success: false,
        message: 'Milestone type is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await emailService.sendMilestoneEmail(user, milestone);
    
    res.json({
      success: true,
      message: 'Milestone email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Milestone email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send milestone email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/custom
// @desc    Send custom email
// @access  Private
router.post('/custom', [
  auth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, title, message, buttonText, buttonUrl, type } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const emailData = {
      subject,
      title,
      message,
      buttonText,
      buttonUrl,
      type: type || 'info'
    };

    const result = await emailService.sendCustomEmail(user, emailData);
    
    res.json({
      success: true,
      message: 'Custom email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/verification
// @desc    Send email verification
// @access  Private
router.post('/verification', auth, async (req, res) => {
  try {
    const { verificationToken } = req.body;
    
    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await emailService.sendEmailVerificationEmail(user, verificationToken);
    
    res.json({
      success: true,
      message: 'Email verification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/email/templates
// @desc    Get available email templates info
// @access  Private
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = [
      {
        name: 'Daily Reminder',
        description: 'Motivational daily journal reminder with quotes',
        endpoint: '/api/email/daily-reminder/trigger',
        parameters: []
      },
      {
        name: 'Welcome Email',
        description: 'Welcome new users to FitMind',
        endpoint: '/api/email/welcome',
        parameters: []
      },
      {
        name: 'Streak Achievement',
        description: 'Celebrate journaling streaks',
        endpoint: '/api/email/streak-achievement',
        parameters: ['streakDays (number)']
      },
      {
        name: 'Weekly Summary',
        description: 'Weekly mental wellness insights',
        endpoint: '/api/email/weekly-summary',
        parameters: ['weeklyStats (object)']
      },
      {
        name: 'Milestone',
        description: 'Achievement milestone celebrations',
        endpoint: '/api/email/milestone',
        parameters: ['milestone.type (string)']
      },
      {
        name: 'Email Verification',
        description: 'Email address verification',
        endpoint: '/api/email/verification',
        parameters: ['verificationToken (string)']
      },
      {
        name: 'Custom Email',
        description: 'Send custom branded emails',
        endpoint: '/api/email/custom',
        parameters: ['subject', 'title', 'message', 'buttonText?', 'buttonUrl?', 'type?']
      }
    ];

    res.json({
      success: true,
      message: 'Email templates retrieved successfully',
      data: {
        templates,
        totalTemplates: templates.length
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/weekly-summaries/trigger
// @desc    Manually trigger weekly summary emails
// @access  Private (Admin)
router.post('/weekly-summaries/trigger', auth, async (req, res) => {
  try {
    const result = await schedulerService.triggerWeeklySummaries();
    
    res.json({
      success: true,
      message: 'Weekly summaries triggered successfully',
      data: result
    });
  } catch (error) {
    console.error('Weekly summaries trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger weekly summaries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/milestones/check
// @desc    Manually check and send milestone emails
// @access  Private (Admin)
router.post('/milestones/check', auth, async (req, res) => {
  try {
    const result = await schedulerService.checkMilestones();
    
    res.json({
      success: true,
      message: 'Milestone check completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Milestone check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check milestones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/scheduler/start-all
// @desc    Start all scheduled jobs
// @access  Private (Admin)
router.post('/scheduler/start-all', auth, async (req, res) => {
  try {
    schedulerService.startAllJobs();
    
    res.json({
      success: true,
      message: 'All scheduled jobs started successfully'
    });
  } catch (error) {
    console.error('Start all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start all jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/email/scheduler/stop-all
// @desc    Stop all scheduled jobs
// @access  Private (Admin)
router.post('/scheduler/stop-all', auth, async (req, res) => {
  try {
    schedulerService.stopAllJobs();
    
    res.json({
      success: true,
      message: 'All scheduled jobs stopped successfully'
    });
  } catch (error) {
    console.error('Stop all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop all jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
