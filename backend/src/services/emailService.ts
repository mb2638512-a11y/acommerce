import { env } from '../config/env';

/**
 * Email template types
 */
export type EmailTemplate =
 | 'welcome'
 | 'order_confirmation'
 | 'order_shipped'
 | 'order_delivered'
 | 'password_reset'
 | 'kyc_verification';

/**
 * Email data interface for template rendering
 */
export interface EmailData {
 // Common fields
 name?: string;
 email?: string;
 url?: string;

 // Order specific fields
 orderId?: string;
 orderNumber?: string;
 orderDate?: string;
 orderTotal?: string;
 shippingAddress?: string;
 trackingNumber?: string;
 carrier?: string;

 // KYC specific fields
 kycStatus?: 'approved' | 'rejected' | 'pending';
 kycMessage?: string;

 // Password reset fields
 resetToken?: string;
 resetExpiry?: string;

 // Additional data
 [key: string]: string | undefined;
}

/**
 * SendGrid email client interface
 */
interface SendGridMail {
 to: string;
 from: string;
 subject: string;
 text?: string;
 html?: string;
 templateId?: string;
 dynamicTemplateData?: Record<string, unknown>;
}

/**
 * Email template configurations
 */
const emailTemplates: Record<EmailTemplate, { subject: string; text: string; html: string }> = {
 welcome: {
  subject: 'Welcome to Aureon!',
  text: `Welcome to Aureon!\n\nHi {{name}},\n\nThank you for joining Aureon. We're excited to have you on board!\n\nStart exploring our marketplace today and discover amazing products.\n\nBest regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5;">Welcome to Aureon!</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Thank you for joining Aureon. We're excited to have you on board!</p>
  <p>Start exploring our marketplace today and discover amazing products from sellers around the world.</p>
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 },

 order_confirmation: {
  subject: 'Order Confirmation - {{orderNumber}}',
  text: `Order Confirmation\n\nHi {{name}},\n\nThank you for your order! Here are your order details:\n\nOrder Number: {{orderNumber}}\nOrder Date: {{orderDate}}\nTotal: {{orderTotal}}\n\nShipping Address:\n{{shippingAddress}}\n\nWe'll notify you when your order ships.\n\nBest regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5;">Order Confirmation</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Thank you for your order! Here are your order details:</p>
  <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
    <p style="margin: 5px 0;"><strong>Order Date:</strong> {{orderDate}}</p>
    <p style="margin: 5px 0;"><strong>Total:</strong> {{orderTotal}}</p>
  </div>
  <div style="margin: 20px 0;">
    <p><strong>Shipping Address:</strong></p>
    <p>{{shippingAddress}}</p>
  </div>
  <p>We'll notify you when your order ships.</p>
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 },

 order_shipped: {
  subject: 'Your Order Has Been Shipped - {{orderNumber}}',
  text: `Order Shipped\n\nHi {{name}},\n\nGreat news! Your order has been shipped.\n\nOrder Number: {{orderNumber}}\nTracking Number: {{trackingNumber}}\nCarrier: {{carrier}}\n\nYou can track your package using the tracking number above.\n\nBest regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5;">Order Shipped!</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Great news! Your order has been shipped.</p>
  <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
    <p style="margin: 5px 0;"><strong>Tracking Number:</strong> {{trackingNumber}}</p>
    <p style="margin: 5px 0;"><strong>Carrier:</strong> {{carrier}}</p>
  </div>
  <p>You can track your package using the tracking number above.</p>
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 },

 order_delivered: {
  subject: 'Your Order Has Been Delivered - {{orderNumber}}',
  text: `Order Delivered\n\nHi {{name}},\n\nYour order has been delivered!\n\nOrder Number: {{orderNumber}}\n\nThank you for shopping with Aureon. We hope you enjoy your purchase!\n\nIf you have any issues with your order, please don't hesitate to contact us.\n\nBest regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10B981;">Order Delivered!</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Your order has been delivered!</p>
  <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
  </div>
  <p>Thank you for shopping with Aureon. We hope you enjoy your purchase!</p>
  <p>If you have any issues with your order, please don't hesitate to contact us.</p>
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 },

 password_reset: {
  subject: 'Reset Your Password - Aureon',
  text: `Password Reset Request\n\nHi {{name}},\n\nWe received a request to reset your password. Click the link below to reset your password:\n\n{{resetToken}}\n\nThis link will expire in {{resetExpiry}}.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5;">Password Reset Request</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>We received a request to reset your password. Click the button below to reset your password:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{resetToken}}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
  </div>
  <p style="color: #6B7280; font-size: 14px;">This link will expire in {{resetExpiry}}.</p>
  <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 },

 kyc_verification: {
  subject: 'KYC Verification Status Update - {{kycStatus}}',
  text: `KYC Verification Update\n\nHi {{name}},\n\nYour KYC verification status has been updated.\n\nStatus: {{kycStatus}}\nMessage: {{kycMessage}}\n\n{{#ifEquals kycStatus 'approved'}}
Your verification was successful! You can now enjoy all features of the platform.
{{/ifEquals}}
{{#ifEquals kycStatus 'rejected'}}
Your verification was not successful. Please review the message above and resubmit.
{{/ifEquals}}
{{#ifEquals kycStatus 'pending'}}
Your verification is still being reviewed. We'll notify you once it's complete.
{{/ifEquals}}

Best regards,\nThe Aureon Team`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4F46E5;">KYC Verification Update</h1>
  </div>
  <p>Hi {{name}},</p>
  <p>Your KYC verification status has been updated.</p>
  <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Status:</strong> {{kycStatus}}</p>
    <p style="margin: 5px 0;"><strong>Message:</strong> {{kycMessage}}</p>
  </div>
  {{#ifEquals kycStatus 'approved'}}
  <p style="color: #10B981;">Your verification was successful! You can now enjoy all features of the platform.</p>
  {{/ifEquals}}
  {{#ifEquals kycStatus 'rejected'}}
  <p style="color: #EF4444;">Your verification was not successful. Please review the message above and resubmit your documents.</p>
  {{/ifEquals}}
  {{#ifEquals kycStatus 'pending'}}
  <p style="color: #F59E0B;">Your verification is still being reviewed. We'll notify you once it's complete.</p>
  {{/ifEquals}}
  <div style="margin-top: 30px; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
    <p style="margin: 0; color: #6B7280;">Best regards,<br>The Aureon Team</p>
  </div>
</body>
</html>`
 }
};

/**
 * Replace template variables with actual data
 */
function replaceTemplateVariables(template: string, data: EmailData): string {
 let result = template;

 for (const [key, value] of Object.entries(data)) {
  if (value !== undefined) {
   const regex = new RegExp(`{{${key}}}`, 'g');
   result = result.replace(regex, value);
  }
 }

 // Handle handlebars-style ifEquals (simple implementation)
 result = result.replace(/\{\{#ifEquals\s+(\w+)\s+'([^']+)'}\}/g, (match, key, checkValue) => {
  const actualValue = data[key];
  if (actualValue === checkValue) {
   return '';
  }
  return '';
 });

 result = result.replace(/\{\{\/ifEquals\}\}/g, '');

 return result;
}

/**
 * Send an email using SendGrid API
 */
export async function sendEmail(
 to: string,
 subject: string,
 template: EmailTemplate,
 data: EmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 // Check if SendGrid API key is configured
 if (!env.sendgridApiKey) {
  console.warn('SendGrid API key not configured. Email not sent.');
  return {
   success: false,
   error: 'SendGrid API key not configured'
  };
 }

 const templateConfig = emailTemplates[template];
 if (!templateConfig) {
  return {
   success: false,
   error: `Invalid email template: ${template}`
  };
 }

 // Replace variables in subject and content
 const processedSubject = replaceTemplateVariables(templateConfig.subject, data);
 const processedText = replaceTemplateVariables(templateConfig.text, data);
 const processedHtml = replaceTemplateVariables(templateConfig.html, data);

 // Build the SendGrid request
 const mailConfig: SendGridMail = {
  to,
  from: env.fromEmail,
  subject: processedSubject,
  text: processedText,
  html: processedHtml
 };

 try {
  // Use dynamic template if you have SendGrid dynamic templates set up
  // For now, we use the HTML content directly

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
   method: 'POST',
   headers: {
    'Authorization': `Bearer ${env.sendgridApiKey}`,
    'Content-Type': 'application/json'
   },
   body: JSON.stringify({
    personalizations: [{
     to: [{ email: to }]
    }],
    from: {
     email: env.fromEmail,
     name: env.fromName
    },
    subject: processedSubject,
    content: [
     {
      type: 'text/plain',
      value: processedText
     },
     {
      type: 'text/html',
      value: processedHtml
     }
    ]
   })
  });

  if (response.ok || response.status === 202) {
   const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(7)}`;
   console.log(`Email sent successfully to ${to}: ${processedSubject}`);
   return {
    success: true,
    messageId
   };
  } else {
   const errorText = await response.text();
   console.error('SendGrid API error:', response.status, errorText);
   return {
    success: false,
    error: `SendGrid API error: ${response.status} - ${errorText}`
   };
  }
 } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Failed to send email:', errorMessage);
  return {
   success: false,
   error: errorMessage
  };
 }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
 to: string,
 name: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, 'Welcome to Aureon!', 'welcome', { name });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
 to: string,
 name: string,
 orderData: {
  orderNumber: string;
  orderDate: string;
  orderTotal: string;
  shippingAddress: string;
 }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, `Order Confirmation - ${orderData.orderNumber}`, 'order_confirmation', {
  name,
  ...orderData
 });
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
 to: string,
 name: string,
 orderData: {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
 }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, `Your Order Has Been Shipped - ${orderData.orderNumber}`, 'order_shipped', {
  name,
  ...orderData
 });
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
 to: string,
 name: string,
 orderNumber: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, `Your Order Has Been Delivered - ${orderNumber}`, 'order_delivered', {
  name,
  orderNumber
 });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
 to: string,
 name: string,
 resetToken: string,
 resetExpiry: string = '1 hour'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, 'Reset Your Password - Aureon', 'password_reset', {
  name,
  resetToken,
  resetExpiry
 });
}

/**
 * Send KYC verification status update email
 */
export async function sendKycVerificationEmail(
 to: string,
 name: string,
 kycStatus: 'approved' | 'rejected' | 'pending',
 kycMessage: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
 return sendEmail(to, `KYC Verification Status Update - ${kycStatus}`, 'kyc_verification', {
  name,
  kycStatus,
  kycMessage
 });
}

export default {
 sendEmail,
 sendWelcomeEmail,
 sendOrderConfirmationEmail,
 sendOrderShippedEmail,
 sendOrderDeliveredEmail,
 sendPasswordResetEmail,
 sendKycVerificationEmail
};
