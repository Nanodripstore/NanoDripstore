// Email service with multiple providers including Nodemailer
import nodemailer from 'nodemailer';
import { sendSimpleEmail } from './simple-email';

// Option 1: Using Nodemailer with Gmail/SMTP (now that it's installed)
export const sendPasswordResetNodemailer = async (email: string, resetUrl: string): Promise<{ success: boolean; messageId?: string }> => {
  try {
    // Create transporter based on available environment variables
    let transporter;

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Gmail configuration
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
        },
      });
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      // Generic SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      throw new Error('No SMTP configuration found');
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request - NanoDrip Store',
      html: generatePasswordResetHTML(resetUrl, email),
    });

    console.log('Password reset email sent via Nodemailer:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    throw new Error('Failed to send password reset email via SMTP');
  }
};

// Option 2: Using EmailJS (client-side service)
export const sendPasswordResetEmailJS = async (email: string, resetUrl: string) => {
  try {
    // This would be used on the client side with EmailJS
    const templateParams = {
      to_email: email,
      reset_url: resetUrl,
      user_name: email.split('@')[0],
      expiry_time: '1 hour'
    };

    // EmailJS integration would go here
    console.log('EmailJS template params:', templateParams);
    
    return { success: true };
  } catch (error) {
    console.error('Error with EmailJS:', error);
    throw new Error('Failed to send email via EmailJS');
  }
};

// Option 3: Using Resend API (lightweight alternative)
export const sendPasswordResetResend = async (email: string, resetUrl: string): Promise<{ success: boolean; messageId?: string }> => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@nanodripstore.com',
        to: [email],
        subject: 'Password Reset Request - NanoDrip Store',
        html: generatePasswordResetHTML(resetUrl, email),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Password reset email sent via Resend:', result.id);
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Option 3: Using SendGrid API
export const sendPasswordResetSendGrid = async (email: string, resetUrl: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: 'Password Reset Request - NanoDrip Store'
        }],
        from: {
          email: process.env.EMAIL_FROM || 'noreply@nanodripstore.com',
          name: 'NanoDrip Store'
        },
        content: [{
          type: 'text/html',
          value: generatePasswordResetHTML(resetUrl, email)
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log('Password reset email sent via SendGrid');
    return { success: true };
    
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Generate HTML email template
const generatePasswordResetHTML = (resetUrl: string, email: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NanoDrip Store</div>
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p>We received a request to reset your password for your NanoDrip Store account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul>
              <li>This link will expire in <strong>1 hour</strong> for your security</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you're having trouble clicking the button, you can also visit our website and go to the "Forgot Password" page to request a new reset link.</p>
          
          <p>Best regards,<br>
          The NanoDrip Store Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from NanoDrip Store. If you have any questions, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} NanoDrip Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Main email sending function - chooses the best available service
export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<{ success: boolean; development?: boolean; messageId?: string }> => {
  // Try different email services in order of preference
  
  // 1. Try Nodemailer (SMTP/Gmail) - most reliable for production
  if ((process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || 
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD)) {
    try {
      return await sendPasswordResetNodemailer(email, resetUrl);
    } catch (error) {
      console.error('Nodemailer failed, trying next service...', error);
    }
  }
  
  // 2. Try Resend (recommended API service)
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendPasswordResetResend(email, resetUrl);
    } catch (error) {
      console.error('Resend failed, trying next service...');
    }
  }
  
  // 3. Try SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      return await sendPasswordResetSendGrid(email, resetUrl);
    } catch (error) {
      console.error('SendGrid failed, trying next service...');
    }
  }
  
  // 4. Use Simple Email Service (Always works)
  console.log('🔄 All email services failed or not configured. Using simple email service...');
  return await sendSimpleEmail(email, resetUrl);
};

// Test email configuration
export const testEmailConfig = async () => {
  if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend API key found');
    return true;
  }
  
  if (process.env.SENDGRID_API_KEY) {
    console.log('✅ SendGrid API key found');
    return true;
  }
  
  console.log('⚠️  No email service configured. Running in development mode.');
  return false;
};
