# FitMind Email Setup & Usage Guide

## 🚀 Overview

FitMind now includes a comprehensive email system that sends beautiful, aesthetic daily journal reminders to users. The system includes:

- ✨ **Beautiful HTML Email Templates** with responsive design
- ⏰ **Scheduled Daily Reminders** at user-specified times
- 🎯 **Multiple Email Types**: Welcome, Daily Reminders, Streaks, Milestones, Weekly Summaries
- 🎨 **Aesthetic Design** with gradients, animations, and motivational quotes
- 📊 **Advanced Scheduling** with cron jobs for different email types

## 📧 Email Configuration

### Step 1: Gmail App Password Setup

Since Gmail requires App Passwords for SMTP authentication:

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification
   - Follow the setup process

2. **Generate App Password**:
   - Go to Google Account settings
   - Navigate to Security → App passwords
   - Select "Mail" and "Other (custom name)"
   - Enter "FitMind App" as the name
   - Copy the generated 16-character password

3. **Update .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Step 2: Alternative Email Providers

If you prefer other email providers:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

**Yahoo Mail:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## 🎯 Features Implemented

### 1. Daily Reminder Emails
- **Beautiful HTML templates** with time-specific greetings
- **Motivational quotes** rotated daily
- **Responsive design** for all devices
- **Dynamic subject lines** based on time of day
- **User-customizable time** settings

### 2. Welcome Emails
- Sent automatically when users register
- Introduces FitMind features
- Professional branding

### 3. Streak Achievement Emails
- Celebrates journaling streaks (7, 14, 30, 50, 100+ days)
- Motivational design with achievement badges
- Automatic detection and sending

### 4. Weekly Summary Emails
- AI-powered insights about the week
- Mood analysis and top emotions
- Journal entry statistics
- Sent every Sunday at 9 AM

### 5. Milestone Emails
- First entry celebration
- 100 entries milestone
- One year anniversary
- Custom achievement tracking

### 6. Email Verification
- Secure email verification for new accounts
- Beautiful verification templates

## 🔧 API Endpoints

### Email Preferences
```bash
# Get user email preferences
GET /api/email/preferences

# Update email preferences
PUT /api/email/preferences
{
  "notifications": true,
  "dailyReminder": {
    "enabled": true,
    "time": "20:00"
  }
}
```

### Manual Email Triggers (for testing)
```bash
# Send test email
POST /api/email/test
{
  "email": "test@example.com",
  "name": "Test User"
}

# Trigger daily reminders manually
POST /api/email/daily-reminder/trigger

# Send welcome email
POST /api/email/welcome

# Send streak achievement
POST /api/email/streak-achievement
{
  "streakDays": 7
}

# Send weekly summary
POST /api/email/weekly-summary
{
  "weeklyStats": {
    "entriesThisWeek": 5,
    "averageMood": 7.2,
    "topEmotions": ["happy", "grateful", "calm"],
    "aiInsight": "Great week of consistent journaling!"
  }
}
```

### Scheduler Management
```bash
# Get scheduler status
GET /api/email/scheduler/status

# Start daily reminder scheduler
POST /api/email/scheduler/start

# Stop daily reminder scheduler
POST /api/email/scheduler/stop

# Start all scheduled jobs
POST /api/email/scheduler/start-all

# Stop all scheduled jobs
POST /api/email/scheduler/stop-all
```

## ⏰ Scheduling System

The system includes several automated jobs:

1. **Daily Reminders**: Checks every minute for users who should receive emails
2. **Weekly Summaries**: Sundays at 9 AM
3. **Milestone Checks**: Daily at 10 AM
4. **Streak Checks**: Daily at 11 AM
5. **Cleanup**: Daily at midnight

## 🎨 Email Template Features

### Design Elements
- **Gradient backgrounds** and modern aesthetics
- **Responsive layout** for mobile and desktop
- **Interactive hover effects** (in supported clients)
- **Beautiful typography** with web-safe fonts
- **Consistent branding** across all templates

### Content Features
- **Dynamic time-based greetings** (morning, afternoon, evening)
- **Motivational quotes** database with 20+ inspirational quotes
- **Personalization** with user names and custom data
- **Call-to-action buttons** linking back to the app
- **Unsubscribe options** in footer

## 🔧 User Settings Integration

### Frontend Settings Page
Users can now:
- ✅ Enable/disable daily email reminders
- ⏰ Set custom reminder time (24-hour format)
- 🔔 Toggle general email notifications
- 💾 Save preferences separately from profile updates

### Real-time Updates
- Changes are saved immediately to the backend
- Email scheduler respects user time preferences
- Users receive confirmation when settings are saved

## 🧪 Testing the Email System

### 1. Test Email Configuration
```bash
curl -X POST https://fitmind-cloud.onrender.com/api/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com", "name": "Test User"}'
```

### 2. Set Daily Reminder Time
1. Log into the app
2. Go to Settings page
3. Enable "Daily Email Reminders"
4. Set your preferred time
5. Click "Save Email Settings"

### 3. Manual Trigger (for immediate testing)
```bash
curl -X POST https://fitmind-cloud.onrender.com/api/email/daily-reminder/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Missing credentials for PLAIN" error**
   - Check your EMAIL_USER and EMAIL_PASS in .env
   - Ensure you're using an App Password for Gmail
   - Verify the email credentials are correct

2. **Emails not sending at scheduled time**
   - Check if the scheduler is running: `GET /api/email/scheduler/status`
   - Verify user has enabled daily reminders
   - Check server logs for cron job execution

3. **Emails going to spam**
   - Add your domain to SPF records (if using custom domain)
   - Use a dedicated sending service like SendGrid for production
   - Ensure proper email headers are set

### Production Recommendations

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up proper SPF/DKIM records**
3. **Monitor email delivery rates**
4. **Implement email bounce handling**
5. **Add rate limiting** to prevent spam

## 📊 Database Schema

The email preferences are stored in the User model:
```javascript
preferences: {
  notifications: Boolean,
  dailyReminder: {
    enabled: Boolean,
    time: String // HH:MM format
  }
}
```

## 🎯 How It Works

1. **User sets reminder time** in Settings (e.g., "20:00")
2. **Scheduler checks every minute** for users with current time matching their preference
3. **Email service generates** a beautiful HTML email with random quote
4. **Email is sent** via SMTP with retry logic
5. **Success/failure is logged** for monitoring

## 🚀 Next Steps

To use the email system:

1. **Set up Gmail App Password** as described above
2. **Update your .env file** with the correct credentials
3. **Restart the backend server**
4. **Set your reminder time** in the Settings page
5. **Test the email functionality** using the API endpoints

The system is now ready to send beautiful, aesthetic daily journal reminders to help users maintain their mental wellness journaling habit! 🌟
