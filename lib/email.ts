// Production-ready email service with detailed logging
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  console.log('🚀 Email Service Starting...');
  console.log('📧 Target:', to);
  console.log('📧 Subject:', subject);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  
  try {
    // Check environment variables
    const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    console.log('🔧 Gmail Config Check:');
    console.log('  - GMAIL_USER:', process.env.GMAIL_USER ? '✅ SET' : '❌ MISSING');
    console.log('  - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ SET' : '❌ MISSING');
    console.log('  - EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
    
    if (!hasGmail) {
      const missing = [];
      if (!process.env.GMAIL_USER) missing.push('GMAIL_USER');
      if (!process.env.GMAIL_APP_PASSWORD) missing.push('GMAIL_APP_PASSWORD');
      
      const errorMsg = `Missing environment variables: ${missing.join(', ')}`;
      console.error('❌ Configuration Error:', errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log('✅ Gmail credentials present, creating transporter...');
    
    // Create transporter with detailed config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      debug: true,
      logger: true,
    });
    
    console.log('🔍 Verifying SMTP connection...');
    
    // Verify connection first
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return { 
        success: false, 
        error: `SMTP verification failed: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}` 
      };
    }
    
    // Prepare email options
    const mailOptions = {
      from: `"NanoDrip Store" <${process.env.EMAIL_FROM || process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };
    
    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Send Result:', {
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
    });
    
    return { 
      success: true, 
      messageId: result.messageId 
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      // Specific Gmail error handling
      if (error.message.includes('Invalid login')) {
        return { 
          success: false, 
          error: 'Gmail authentication failed. Check GMAIL_APP_PASSWORD is correct and 2FA is enabled.' 
        };
      }
      
      if (error.message.includes('Less secure app')) {
        return { 
          success: false, 
          error: 'Gmail requires App Password. Enable 2FA and generate an App Password.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  console.log('🔄 Password reset email requested for:', email);
  console.log('🔗 Reset URL:', resetUrl);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - NanoDrip Store</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">NanoDrip Store</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
            
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
              We received a request to reset your password for your NanoDrip Store account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
              To reset your password, click the button below:
            </p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: #ffffff; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
                        transition: all 0.3s ease;">
                Reset My Password
              </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="color: #4b5563; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                Button not working? Copy and paste this link:
              </p>
              <p style="color: #667eea; font-size: 14px; margin: 0; word-break: break-all;">
                ${resetUrl}
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security. If you didn't request this reset, please contact our support team.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              This email was sent by NanoDrip Store
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Please do not reply to this email. This mailbox is not monitored.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: email,
    subject: 'Reset Your Password - NanoDrip Store',
    html,
  });

  console.log('📬 Password reset email result:', result);
  return result;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  console.log('🔄 Verification email requested for:', email);
  console.log('🔗 Verification URL:', verificationUrl);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - NanoDrip Store</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">NanoDrip Store</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Welcome! Please verify your email</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
            
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
              Thank you for creating your NanoDrip Store account! To complete your registration and start shopping, please verify your email address by clicking the button below.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
              Click the button below to verify your email:
            </p>
            
            <!-- Verify Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: #ffffff; 
                        padding: 16px 32px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);
                        transition: all 0.3s ease;">
                Verify My Email
              </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="color: #4b5563; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                Button not working? Copy and paste this link:
              </p>
              <p style="color: #667eea; font-size: 14px; margin: 0; word-break: break-all;">
                ${verificationUrl}
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>Important:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with us, please ignore this email.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              This email was sent by NanoDrip Store
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Please do not reply to this email. This mailbox is not monitored.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({
    to: email,
    subject: 'Verify Your Email - NanoDrip Store',
    html,
  });

  console.log('📬 Verification email result:', result);
  return result;
}
