const cron = require('node-cron');
const emailService = require('./emailService');

class SchedulerService {
  constructor() {
    this.jobs = [];
  }

  // Start all scheduled jobs
  startScheduler() {
    console.log('🚀 Starting FitMind Scheduler Service...');
    
    // Schedule daily reminder check every minute
    // This will check if any users need reminders at the current time
    const dailyReminderJob = cron.schedule('* * * * *', async () => {
      try {
        await emailService.sendDailyRemindersToAllUsers();
      } catch (error) {
        console.error('❌ Error in scheduled daily reminder job:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Schedule weekly summary emails (every Sunday at 9 AM)
    const weeklySummaryJob = cron.schedule('0 9 * * 0', async () => {
      try {
        await this.triggerWeeklySummaries();
      } catch (error) {
        console.error('❌ Error in weekly summary job:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule milestone checks (daily at 10 AM)
    const milestoneCheckJob = cron.schedule('0 10 * * *', async () => {
      try {
        await this.checkMilestones();
      } catch (error) {
        console.error('❌ Error in milestone check job:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule a cleanup job to run daily at midnight
    const cleanupJob = cron.schedule('0 0 * * *', () => {
      console.log('🧹 Running daily cleanup job...');
      // Add any cleanup tasks here (e.g., removing old data, updating stats, etc.)
    }, {
      scheduled: false
    });

    // Schedule streak achievement checks (daily at 11 AM)
    const streakCheckJob = cron.schedule('0 11 * * *', async () => {
      try {
        console.log('� Checking for streak achievements...');
        const User = require('../models/User');
        
        // Find users with notable streaks (7, 14, 30, 50, 100+ days)
        const streakMilestones = [7, 14, 30, 50, 100, 200, 365];
        
        for (const milestone of streakMilestones) {
          const users = await User.find({
            'stats.currentStreak': milestone,
            'preferences.notifications': true
          });

          for (const user of users) {
            try {
              await emailService.sendStreakAchievementEmail(user, milestone);
              // Add delay between emails
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(`Error sending streak email to ${user.email}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in streak check job:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs = [
      { name: 'Daily Reminders', job: dailyReminderJob, active: false, schedule: 'Every minute' },
      { name: 'Weekly Summaries', job: weeklySummaryJob, active: false, schedule: 'Sundays at 9 AM' },
      { name: 'Milestone Checks', job: milestoneCheckJob, active: false, schedule: 'Daily at 10 AM' },
      { name: 'Streak Checks', job: streakCheckJob, active: false, schedule: 'Daily at 11 AM' },
      { name: 'Daily Cleanup', job: cleanupJob, active: false, schedule: 'Daily at midnight' }
    ];

    console.log('✅ Scheduler jobs configured:');
    this.jobs.forEach(job => {
      console.log(`   📅 ${job.name}: ${job.schedule}`);
    });
    console.log('Use startDailyReminders() or startAllJobs() to activate.');
  }

  // Start daily reminder scheduler
  startDailyReminders() {
    const dailyReminderJob = this.jobs.find(j => j.name === 'Daily Reminders');
    if (dailyReminderJob && !dailyReminderJob.active) {
      dailyReminderJob.job.start();
      dailyReminderJob.active = true;
      console.log('✅ Daily reminder scheduler started - checking every minute for users to notify');
    }
  }

  // Stop daily reminder scheduler
  stopDailyReminders() {
    const dailyReminderJob = this.jobs.find(j => j.name === 'Daily Reminders');
    if (dailyReminderJob && dailyReminderJob.active) {
      dailyReminderJob.job.stop();
      dailyReminderJob.active = false;
      console.log('⏹️ Daily reminder scheduler stopped');
    }
  }

  // Start all jobs
  startAllJobs() {
    this.jobs.forEach(({ name, job }) => {
      job.start();
      console.log(`✅ Started job: ${name}`);
    });
  }

  // Stop all jobs
  stopAllJobs() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
  }

  // Get scheduler status
  getStatus() {
    return this.jobs.map(({ name, active }) => ({ name, active }));
  }

  // Manual trigger for testing daily reminders
  async triggerDailyRemindersManually() {
    console.log('🔄 Manually triggering daily reminders...');
    try {
      const result = await emailService.sendDailyRemindersToAllUsers();
      console.log('✅ Manual trigger completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Manual trigger failed:', error);
      throw error;
    }
  }

  // Send a test email to verify email configuration
  async sendTestEmail(userEmail, userName = 'Test User') {
    console.log(`📧 Sending test email to ${userEmail}...`);
    try {
      const testUser = { email: userEmail, name: userName };
      const quote = emailService.getRandomMotivationalQuote();
      const result = await emailService.sendDailyReminder(testUser, quote);
      console.log('✅ Test email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      throw error;
    }
  }

  // Send weekly summary emails to eligible users
  async triggerWeeklySummaries() {
    console.log('📊 Starting weekly summary email job...');
    try {
      const User = require('../models/User');
      const Journal = require('../models/Journal');
      
      // Find users who have been active in the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const activeUsers = await User.find({
        'preferences.notifications': true,
        'stats.lastEntryDate': { $gte: oneWeekAgo }
      });

      console.log(`Found ${activeUsers.length} active users for weekly summaries`);

      const results = [];

      for (const user of activeUsers) {
        try {
          // Calculate weekly stats
          const weeklyEntries = await Journal.find({
            user: user._id,
            date: { $gte: oneWeekAgo }
          });

          if (weeklyEntries.length === 0) continue;

          const averageMood = weeklyEntries.reduce((sum, entry) => sum + (entry.mood || 5), 0) / weeklyEntries.length;
          
          // Extract top emotions (simplified)
          const emotions = weeklyEntries.flatMap(entry => entry.emotions || []);
          const emotionCounts = emotions.reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
          }, {});
          
          const topEmotions = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emotion]) => emotion);

          const weeklyStats = {
            entriesThisWeek: weeklyEntries.length,
            averageMood: Math.round(averageMood * 10) / 10,
            topEmotions: topEmotions.length > 0 ? topEmotions : ['reflective', 'thoughtful'],
            aiInsight: `This week you wrote ${weeklyEntries.length} entries with an average mood of ${Math.round(averageMood * 10) / 10}/10. Keep up the great work with your self-reflection journey!`
          };

          const result = await emailService.sendWeeklySummaryEmail(user, weeklyStats);
          results.push({
            email: user.email,
            success: result.success,
            error: result.error || null
          });

          // Add delay between emails
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (userError) {
          console.error(`Error processing weekly summary for ${user.email}:`, userError);
          results.push({
            email: user.email,
            success: false,
            error: userError.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`✅ Weekly summary job completed: ${successCount} sent, ${failureCount} failed`);

      return {
        success: true,
        message: `Weekly summaries processed for ${activeUsers.length} users`,
        count: activeUsers.length,
        successCount,
        failureCount,
        results
      };
    } catch (error) {
      console.error('❌ Error in weekly summary job:', error);
      return { success: false, error: error.message };
    }
  }

  // Check and send milestone emails for users
  async checkMilestones() {
    console.log('🏆 Checking for milestone achievements...');
    try {
      const User = require('../models/User');
      const users = await User.find({
        'preferences.notifications': true,
        'stats.totalEntries': { $gt: 0 }
      });

      const results = [];

      for (const user of users) {
        try {
          const milestones = [];

          // Check various milestones
          if (user.stats.totalEntries === 1) {
            milestones.push({ type: 'first_entry' });
          }
          if (user.stats.currentStreak === 7) {
            milestones.push({ type: 'week_streak' });
          }
          if (user.stats.currentStreak === 30) {
            milestones.push({ type: 'month_streak' });
          }
          if (user.stats.totalEntries === 100) {
            milestones.push({ type: 'hundred_entries' });
          }
          
          // Check if it's user's anniversary (1 year since joining)
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          const userCreatedDate = new Date(user.createdAt);
          
          if (Math.abs(userCreatedDate.getTime() - oneYearAgo.getTime()) < 24 * 60 * 60 * 1000) {
            milestones.push({ type: 'year_anniversary' });
          }

          // Send milestone emails
          for (const milestone of milestones) {
            const result = await emailService.sendMilestoneEmail(user, milestone);
            results.push({
              email: user.email,
              milestone: milestone.type,
              success: result.success,
              error: result.error || null
            });

            // Add delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (userError) {
          console.error(`Error checking milestones for ${user.email}:`, userError);
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Milestone check completed: ${successCount} milestone emails sent`);

      return {
        success: true,
        message: `Checked milestones for ${users.length} users`,
        milestonesFound: results.length,
        successCount
      };
    } catch (error) {
      console.error('❌ Error in milestone check:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SchedulerService();
