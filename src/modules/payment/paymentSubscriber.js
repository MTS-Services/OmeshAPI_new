const EmailService = require('../../utils/email');
const paymentEmitter = require('../../utils/eventEmitter');

const emailService = new EmailService();

paymentEmitter.on('payment.success', async (data) => {
  const { payment, registrations } = data;

  try {
    const eventName = payment?.eventName || 'Event';
    if (Array.isArray(registrations) && registrations.length > 0) {
      for (const reg of registrations) {
        if (!reg?.email) {
          console.warn('Skipping registration email: missing email', reg);
          continue;
        }

        const userName =
          reg.name ||
          `${reg.firstName || ''} ${reg.lastName || ''}`.trim() ||
          'User';
        await emailService.sendMail(
          reg.email,
          `Confirmed: Ticket for ${eventName}`,
          `Hi ${userName}, registration successful!`,
          `
          <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
            <h2 style="color: #2e7d32; text-align: center;">Event Registration Confirmed! 🎟️</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Your registration for <strong>${eventName}</strong> has been successfully confirmed via <strong>Endura Events</strong>.</p>
            <ul style="padding-left: 0; list-style: none;">
              <li><strong>Name:</strong> ${userName || '-'}</li>
              <li><strong>Email:</strong> ${reg.email || '-'}</li>
              <li><strong>Phone:</strong> ${reg.phone || '-'}</li>
            </ul>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #999; text-align: center;">© 2026 Endura Events</p>
          </div>
          `,
        );
        console.log(`Email successfully sent to: ${reg.email}`);
      }
    } else {
      console.log(
        `No registration emails sent for batch ${payment?.batchId}: no registrations found.`,
      );
    }
  } catch (error) {
    console.error('Background email sending failed:', error);
  }
});
