const EmailService = require('../../utils/email');

const emailService = new EmailService();

class QuestionsService {
  async contactUs(data) {
    const { email, description } = data;
    const subject = 'New Inquiry from Contact Us Form';

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
        <h2 style="color: #2ecc71; margin: 0;">Still have questions?</h2>
        <p style="color: #777;">New contact request received</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p><strong>User Email:</strong> <a href="mailto:${email}">${email}</a></p>
        
        <p><strong>Question/Description:</strong></p>
        <div style="background-color: #f4f4f4; padding: 15px; border-left: 5px solid #2ecc71; border-radius: 4px; font-style: italic;">
          "${description}"
        </div>
      </div>
      
      <p style="font-size: 14px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
        This email was sent automatically from the support section of your website.
      </p>
    </div>
  `;

    try {
      await emailService.sendMail(
        'enduraevent@gmail.com',
        subject,
        `Inquiry from ${email}: ${description}`,
        htmlContent,
      );

      return {
        success: true,
        message: 'Your message has been sent successfully!',
      };
    } catch (error) {
      logger.error('Contact Us email failed:', error);
      throw new Error('Failed to send message. Please try again later.');
    }
  }
}

module.exports = QuestionsService;
