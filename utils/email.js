import nodemailer from 'nodemailer';

// Create transporter with error handling
let transporter;

try {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email configuration missing. OTP emails will not be sent.');
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter configured successfully');
      }
    });
  }
} catch (error) {
  console.error('❌ Failed to create email transporter:', error.message);
}

// Send OTP email
export const sendOTP = async (email, otp, type = 'login') => {
  try {
    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const subject = type === 'login' 
      ? 'Your Login OTP - Window Management System'
      : 'Email Verification OTP - Window Management System';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp-box { background-color: #fff; border: 2px solid #4CAF50; padding: 20px; text-align: center; margin: 20px 0; }
          .otp { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Window Management System</h1>
          </div>
          <div class="content">
            <h2>${type === 'login' ? 'Login Verification' : 'Email Verification'}</h2>
            <p>Your OTP code is:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Window Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Window Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

