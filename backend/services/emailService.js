const nodemailer = require('nodemailer');
const User = require('../models/User');

class EmailService {
  constructor() {
    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email credentials not configured. Email features will be disabled.');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    if (!this.transporter) {
      return;
    }
    
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send messages');
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
      this.transporter = null;
    }
  }

  // Generate beautiful HTML email template
  generateDailyReminderHTML(userName, motivationalQuote) {
    const timeContent = this.getTimeSpecificContent();
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Journal Reminder - FitMind</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a"><stop offset="20%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle fill="url(%23a)" cx="10" cy="10" r="10"/><circle fill="url(%23a)" cx="30" cy="5" r="8"/><circle fill="url(%23a)" cx="60" cy="15" r="6"/><circle fill="url(%23a)" cx="80" cy="8" r="7"/></svg>');
          opacity: 0.3;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .time-greeting {
          background: rgba(255,255,255,0.15);
          padding: 15px;
          border-radius: 15px;
          margin-top: 20px;
          backdrop-filter: blur(10px);
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        
        .quote-section {
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
          border-left: 4px solid #8b5cf6;
          position: relative;
          overflow: hidden;
        }
        
        .quote-section::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 15px;
          font-size: 80px;
          color: rgba(139, 92, 246, 0.1);
          font-family: Georgia, serif;
        }
        
        .quote {
          font-size: 18px;
          font-style: italic;
          color: #6b21a8;
          margin-bottom: 10px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .quote-author {
          font-size: 14px;
          color: #7c3aed;
          text-align: center;
          font-weight: 500;
        }
        
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .benefits {
          margin: 30px 0;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding: 15px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .benefit-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .benefit-icon {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 18px;
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }
        
        .benefit-text {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
        
        .footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        
        .social-links {
          margin-top: 15px;
        }
        
        .social-links a {
          color: #6b7280;
          text-decoration: none;
          margin: 0 10px;
          font-size: 12px;
          transition: color 0.2s;
        }
        
        .social-links a:hover {
          color: #3b82f6;
        }
        
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 20px 0;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .benefit-item {
            flex-direction: column;
            text-align: center;
          }
          
          .benefit-icon {
            margin-bottom: 10px;
            margin-right: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <h1>🧠 FitMind</h1>
            <p>Your Daily Mental Wellness Companion</p>
            <div class="time-greeting">
              <div style="font-size: 20px; margin-bottom: 5px;">${timeContent.emoji}</div>
              <div>${timeContent.greeting}! ${timeContent.timeMessage}</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <div class="greeting">
            <span>Hello ${userName}!</span> 
            <span style="font-size: 28px;">👋</span>
          </div>
          
          <div class="message">
            It's time for your daily reflection. Taking a few minutes to journal about your day can help you process emotions, track your mental wellness journey, and gain valuable insights about yourself.
          </div>
          
          <div class="quote-section">
            <div class="quote">"${motivationalQuote.text}"</div>
            <div class="quote-author">— ${motivationalQuote.author}</div>
          </div>
          
          <div class="cta-section">
            <a href="${process.env.FRONTEND_URL}/journal" class="cta-button">
              ✍️ Start Writing Today
            </a>
          </div>
          
          <div class="divider"></div>
          
          <div class="benefits">
            <div class="benefit-item">
              <div class="benefit-icon">🎯</div>
              <div class="benefit-text">Track your emotional patterns and mood trends over time</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🤖</div>
              <div class="benefit-text">Get AI-powered insights about your mental state and growth</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">📈</div>
              <div class="benefit-text">Build a consistent journaling habit with streaks and rewards</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🧘</div>
              <div class="benefit-text">Practice mindfulness and enhance self-reflection skills</div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="message">
            Remember, even a few sentences about your day can make a difference. Your mental wellness journey matters, and every entry is a step toward better self-understanding! 💙
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent because you have daily reminders enabled in your FitMind account.</p>
          <p>You can update your notification preferences in your account settings.</p>
          
          <div class="social-links">
            <a href="${process.env.FRONTEND_URL}/settings">Update Preferences</a> |
            <a href="${process.env.FRONTEND_URL}">Visit FitMind</a> |
            <a href="${process.env.FRONTEND_URL}/stats">View Your Stats</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Send daily reminder email to a user
  async sendDailyReminder(user, motivationalQuote) {
    if (!this.transporter) {
      console.log('📧 Email service not configured, skipping daily reminder for', user.email);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const htmlContent = this.generateDailyReminderHTML(user.name, motivationalQuote);
      const timeContent = this.getTimeSpecificContent();
      
      // Create dynamic subject lines based on time of day
      const subjectOptions = [
        `${timeContent.emoji} ${timeContent.greeting}, ${user.name}! Time to reflect`,
        `🌟 Your daily journal awaits - How was your day, ${user.name}?`,
        `📝 FitMind Reminder: ${timeContent.timeMessage.toLowerCase()}`,
        `💭 Daily reflection time! What's on your mind, ${user.name}?`,
        `🧠 ${user.name}, let's explore your thoughts today`
      ];
      
      const randomSubject = subjectOptions[Math.floor(Math.random() * subjectOptions.length)];
      
      const mailOptions = {
        from: `"FitMind 🧠" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: randomSubject,
        html: htmlContent,
        text: `${timeContent.greeting} ${user.name}! It's time for your daily reflection. Visit ${process.env.FRONTEND_URL}/journal to start writing about your day. Quote of the day: "${motivationalQuote.text}" - ${motivationalQuote.author}`,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'FitMind Daily Reminder Service'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Daily reminder sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send daily reminder to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    if (!this.transporter) {
      console.log('📧 Email service not configured, skipping welcome email for', user.email);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 Welcome to FitMind!</h1>
            <p>Your Mental Wellness Journey Starts Here</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}! 👋</h2>
            <p>Thank you for joining FitMind! We're excited to help you on your mental wellness journey through the power of journaling and AI insights.</p>
            <p>Here's what you can do with FitMind:</p>
            <ul>
              <li>✍️ Write daily journal entries in a beautiful, distraction-free interface</li>
              <li>🤖 Get AI-powered emotional insights and mood analysis</li>
              <li>📊 Track your mental wellness patterns and trends</li>
              <li>🎯 Build consistent journaling habits with streaks and achievements</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/journal" class="button">Start Your First Entry</a>
            <p>Remember, even a few minutes of daily reflection can make a significant impact on your mental wellness.</p>
            <p>Best regards,<br>The FitMind Team 💙</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind 🧠" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🌟 Welcome to FitMind, ${user.name}! Your mental wellness journey begins now`,
        html: htmlContent,
        text: `Welcome to FitMind, ${user.name}! Start your mental wellness journey by writing your first journal entry at ${process.env.FRONTEND_URL}/journal`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password for your FitMind account.</p>
          <a href="${resetUrl}" class="button">Reset Your Password</a>
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>Best regards,<br>The FitMind Team</p>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind Security 🔒" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔒 FitMind Password Reset Request',
        html: htmlContent,
        text: `Password reset requested for ${user.email}. Reset your password: ${resetUrl}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send email verification email
  async sendEmailVerificationEmail(user, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
          .info { background: #f0f9ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
            <p>Almost there! Just one more step</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}! 👋</h2>
            <p>Thank you for signing up for FitMind! To complete your registration and start your mental wellness journey, please verify your email address.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <div class="info">
              <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            <p>If you didn't create an account with FitMind, you can safely ignore this email.</p>
            <p>Best regards,<br>The FitMind Team 💙</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind Verification ✉️" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '✉️ Verify Your FitMind Account Email',
        html: htmlContent,
        text: `Please verify your FitMind account email: ${verificationUrl}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email verification sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email verification to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send streak achievement email
  async sendStreakAchievementEmail(user, streakDays) {
    try {
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 30px; text-align: center; }
          .streak-number { font-size: 48px; font-weight: bold; color: #f59e0b; margin: 20px 0; }
          .achievement-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 15px 25px; border-radius: 50px; display: inline-block; margin: 20px 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Streak Achievement!</h1>
            <p>Congratulations on your consistency!</p>
          </div>
          <div class="content">
            <h2>Amazing Work, ${user.name}! 🎉</h2>
            <div class="streak-number">${streakDays}</div>
            <div class="achievement-badge">Day Streak Achieved!</div>
            <p>You've been consistently journaling for <strong>${streakDays} days</strong> in a row! This is a fantastic achievement that shows your dedication to mental wellness and self-reflection.</p>
            <p>Consistency is key to building healthy habits, and you're proving that you have what it takes to maintain a meaningful journaling practice.</p>
            <p>Keep up the excellent work and continue your journey of self-discovery! 💙</p>
            <p>Best regards,<br>The FitMind Team</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind Achievements 🏆" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🏆 Congratulations! ${streakDays}-Day Streak Achievement`,
        html: htmlContent,
        text: `Congratulations ${user.name}! You've achieved a ${streakDays}-day journaling streak! Keep up the great work!`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Streak achievement email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send streak achievement email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send weekly summary email
  async sendWeeklySummaryEmail(user, weeklyStats) {
    try {
      const { entriesThisWeek, averageMood, topEmotions, aiInsight } = weeklyStats;
      
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .stat-item { background: #f8fafc; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #8b5cf6; }
          .insight-box { background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%); padding: 20px; border-radius: 10px; margin: 20px 0; }
          .emotion-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 5px 10px; border-radius: 15px; margin: 3px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Weekly Summary</h1>
            <p>Insights from your journaling journey</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}! 👋</h2>
            <p>Here's a summary of your mental wellness journey from this past week:</p>
            
            <div class="stat-item">
              <h3>✍️ Journal Entries</h3>
              <p>You wrote <strong>${entriesThisWeek}</strong> entries this week!</p>
            </div>
            
            <div class="stat-item">
              <h3>😊 Average Mood</h3>
              <p>Your average mood was <strong>${averageMood}/10</strong></p>
            </div>
            
            <div class="stat-item">
              <h3>💭 Top Emotions</h3>
              <div>
                ${topEmotions.map(emotion => `<span class="emotion-tag">${emotion}</span>`).join('')}
              </div>
            </div>
            
            <div class="insight-box">
              <h3>🤖 AI Insight</h3>
              <p><em>"${aiInsight}"</em></p>
            </div>
            
            <p>Keep up the great work with your mental wellness journey! Remember, every entry is a step toward better self-understanding.</p>
            <p>Best regards,<br>The FitMind Team 💙</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind Weekly Summary 📊" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📊 Your Weekly Mental Wellness Summary - Week of ${new Date().toLocaleDateString()}`,
        html: htmlContent,
        text: `Weekly Summary: ${entriesThisWeek} entries, ${averageMood}/10 average mood. ${aiInsight}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Weekly summary email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send weekly summary email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Get motivational quotes for emails
  getRandomMotivationalQuote() {
    const quotes = [
      { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
      { text: "Your mental health is just as important as your physical health.", author: "Unknown" },
      { text: "Progress, not perfection, is the goal.", author: "Unknown" },
      { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay" },
      { text: "You are stronger than you think and more resilient than you know.", author: "Unknown" },
      { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
      { text: "Mental health is not a destination, but a process.", author: "Noam Shpancer" },
      { text: "It's okay to not be okay; it's not okay to stay that way.", author: "Unknown" },
      { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
      { text: "Taking care of yourself is productive.", author: "Unknown" },
      { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
      { text: "The only way out is through.", author: "Robert Frost" },
      { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
      { text: "You have been assigned this mountain to show others it can be moved.", author: "Mel Robbins" },
      { text: "Your current situation is not your final destination.", author: "Unknown" },
      { text: "Growth begins at the end of your comfort zone.", author: "Unknown" },
      { text: "Be patient with yourself. Self-growth is tender; it's holy ground.", author: "Stephen Covey" },
      { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
      { text: "You are not a drop in the ocean, but the entire ocean in each drop.", author: "Rumi" },
      { text: "Mindfulness is the aware, balanced acceptance of the present experience.", author: "Sylvia Boorstein" }
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Get time-specific greeting and emoji
  getTimeSpecificContent() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning",
        emoji: "🌅",
        timeMessage: "Start your day with mindful reflection"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon",
        emoji: "☀️",
        timeMessage: "Take a moment to pause and reflect"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good evening",
        emoji: "🌆",
        timeMessage: "Wind down and reflect on your day"
      };
    } else {
      return {
        greeting: "Good evening",
        emoji: "🌙",
        timeMessage: "End your day with peaceful reflection"
      };
    }
  }

  // Send milestone email (100 entries, 1 year anniversary, etc.)
  async sendMilestoneEmail(user, milestone) {
    try {
      const milestoneMessages = {
        first_entry: {
          title: "🎉 First Entry Complete!",
          message: "Congratulations on writing your first journal entry! You've taken the first step on your mental wellness journey.",
          badge: "🌱 New Beginner"
        },
        week_streak: {
          title: "🔥 One Week Streak!",
          message: "Amazing! You've journaled for a full week. You're building a powerful habit for mental wellness.",
          badge: "📅 Week Warrior"
        },
        month_streak: {
          title: "🌟 One Month Strong!",
          message: "Incredible dedication! A full month of consistent journaling shows your commitment to self-growth.",
          badge: "🗓️ Monthly Master"
        },
        hundred_entries: {
          title: "💯 Century Milestone!",
          message: "Wow! 100 journal entries is a remarkable achievement. You've built a treasure trove of self-reflection.",
          badge: "💯 Century Writer"
        },
        year_anniversary: {
          title: "🎂 One Year Anniversary!",
          message: "A full year with FitMind! Your dedication to mental wellness is truly inspiring.",
          badge: "🎂 Annual Achiever"
        }
      };

      const milestoneData = milestoneMessages[milestone.type] || {
        title: "🏆 Milestone Achieved!",
        message: "Congratulations on reaching this milestone in your mental wellness journey!",
        badge: "🏆 Achiever"
      };

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 30px; text-align: center; }
          .milestone-badge { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 25px; border-radius: 50px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 18px; }
          .celebration { font-size: 64px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${milestoneData.title}</h1>
          </div>
          <div class="content">
            <div class="celebration">🎊</div>
            <h2>Congratulations, ${user.name}!</h2>
            <div class="milestone-badge">${milestoneData.badge}</div>
            <p>${milestoneData.message}</p>
            <p>Your commitment to mental wellness and self-reflection is truly admirable. Keep up the fantastic work!</p>
            <p>Best regards,<br>The FitMind Team 💙</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind Milestones 🏆" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `${milestoneData.title} - ${user.name}`,
        html: htmlContent,
        text: `${milestoneData.title} Congratulations ${user.name}! ${milestoneData.message}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Milestone email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send milestone email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send custom email template for special occasions
  async sendCustomEmail(user, emailData) {
    try {
      const { subject, title, message, buttonText, buttonUrl, type = 'info' } = emailData;
      
      const typeStyles = {
        info: { color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
        success: { color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        warning: { color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        celebration: { color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
      };

      const style = typeStyles[type] || typeStyles.info;

      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
          .header { background: ${style.gradient}; padding: 40px 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .button { display: inline-block; background: ${style.gradient}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}! 👋</h2>
            <p>${message}</p>
            ${buttonText && buttonUrl ? `<div style="text-align: center;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>` : ''}
            <p>Best regards,<br>The FitMind Team 💙</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"FitMind 🧠" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent,
        text: `${title} - ${message} ${buttonUrl ? `Link: ${buttonUrl}` : ''}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Custom email sent to ${user.email} - Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send custom email to ${user.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Send daily reminders to all eligible users
  async sendDailyRemindersToAllUsers() {
    if (!this.transporter) {
      console.log('📧 Email service not configured, skipping daily reminders');
      return { success: false, message: 'Email service not configured', count: 0 };
    }

    try {
      console.log('🕐 Starting daily reminder job...');
      
      // Get current time in HH:MM format
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      // Find users who have daily reminders enabled and should receive email at this time
      const users = await User.find({
        'preferences.dailyReminder.enabled': true,
        'preferences.dailyReminder.time': currentTime,
        isEmailVerified: { $ne: false } // Include users where isEmailVerified is true or undefined
      });

      console.log(`📧 Found ${users.length} users to send daily reminders to at ${currentTime}`);

      if (users.length === 0) {
        return { success: true, message: 'No users found for this time slot', count: 0 };
      }

      const motivationalQuote = this.getRandomMotivationalQuote();
      const results = [];

      for (const user of users) {
        const result = await this.sendDailyReminder(user, motivationalQuote);
        results.push({
          email: user.email,
          success: result.success,
          error: result.error || null
        });

        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`✅ Daily reminder job completed: ${successCount} sent, ${failureCount} failed`);

      return {
        success: true,
        message: `Daily reminders processed for ${users.length} users`,
        count: users.length,
        successCount,
        failureCount,
        results
      };
    } catch (error) {
      console.error('❌ Error in daily reminder job:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
