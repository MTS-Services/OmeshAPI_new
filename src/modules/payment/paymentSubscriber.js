const EmailService = require('../../utils/email');
const paymentEmitter = require('../../utils/eventEmitter');
const { prisma } = require('../../config/database');

const emailService = new EmailService();

const formatStartAt = (startAt) => {
  if (!startAt) {
    return { date: '', time: '' };
  }

  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const date = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed);

  return { date, time };
};

const getEventDetails = async (payment) => {
  if (!payment) {
    return {
      name: 'Event',
      location: 'TBA',
      date: 'TBA',
      time: 'TBA',
    };
  }

  const whereClause = payment.eventId
    ? { id: payment.eventId }
    : payment.id
      ? { payments: { some: { id: payment.id } } }
      : payment.batchId
        ? { payments: { some: { batchId: payment.batchId } } }
        : null;

  if (!whereClause) {
    return {
      name: payment.eventName || 'Event',
      location: 'TBA',
      date: 'TBA',
      time: 'TBA',
    };
  }

  const event = await prisma.event.findFirst({
    where: whereClause,
    select: {
      title: true,
      location: true,
      startAt: true,
      time: true,
    },
  });

  const formattedStartAt = formatStartAt(event?.startAt);

  return {
    name: event?.title || payment.eventName || 'Event',
    location: event?.location || 'TBA',
    date: formattedStartAt.date || 'TBA',
    time: formattedStartAt.time || event?.time || 'TBA',
  };
};

paymentEmitter.on('payment.success', async (data) => {
  const { payment, registrations } = data;

  try {
    const eventDetails = await getEventDetails(payment);
    if (Array.isArray(registrations) && registrations.length > 0) {
      for (const reg of registrations) {
        if (!reg?.email) {
          console.warn('Skipping registration email: missing email', reg);
          continue;
        }

        const userName =
          reg.name ||
          `${reg.firstName || ''} ${reg.lastName || ''}`.trim() ||
          'Participant';
        const firstName =
          reg.firstName || userName.split(' ')[0] || 'Participant';

        await emailService.sendMail(
          reg.email,
          `Registration Confirmed: ${eventDetails.name}`,
          `Hi ${firstName},\n\nYour registration for ${eventDetails.name} has been successfully confirmed.\n\nThank you for registering through Endura Events.\n\nEvent Details\nLocation: ${eventDetails.location}\nDate: ${eventDetails.date}\nTime: ${eventDetails.time}\n\nYour bib collection details and any additional event updates will be shared closer to race day.\n\nPlease ensure that you:\n* Arrive early on event day\n* Stay hydrated\n* Follow all event instructions from organizers and marshals\n\nWe're excited to have you on the start line and appreciate your support.\n\nSee you on race day.\n\nBest regards,\nEndura Sports Limited\nPowered by Powerhouse\nenduraevents.com`,
          `
          <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
            <p style="font-size: 16px; margin: 0 0 18px 0;">Hi <strong>${firstName}</strong>,</p>

            <p style="font-size: 16px; margin: 0 0 14px 0;">
              Your registration for <strong>${eventDetails.name}</strong> has been successfully confirmed. 🎉
            </p>

            <p style="font-size: 16px; margin: 0 0 18px 0;">Thank you for registering through Endura Events.</p>

            <p style="font-size: 16px; margin: 0 0 8px 0;"><strong>Event Details</strong></p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">📍 Location: ${eventDetails.location}</p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">🗓️ Date: ${eventDetails.date}</p>
            <p style="font-size: 16px; margin: 0 0 18px 0;">⏰ Time: ${eventDetails.time}</p>

            <p style="font-size: 16px; margin: 0 0 16px 0;">
              Your bib collection details and any additional event updates will be shared closer to race day.
            </p>

            <p style="font-size: 16px; margin: 0 0 10px 0;">Please ensure that you:</p>
            <ul style="font-size: 16px; line-height: 1.7; margin-top: 0; padding-left: 22px;">
              <li>Arrive early on event day</li>
              <li>Stay hydrated</li>
              <li>Follow all event instructions from organizers and marshals</li>
            </ul>

            <p style="font-size: 16px; margin: 0 0 16px 0;">We're excited to have you on the start line and appreciate your support.</p>

            <p style="font-size: 16px; margin: 0 0 20px 0;">See you on race day.</p>

            <p style="font-size: 16px; line-height: 1.8; margin: 0;">
              Best regards,<br/>
              Endura Sports Limited<br/>
              Powered by Powerhouse
            </p>

            <p style="font-size: 16px; margin-top: 18px; margin-bottom: 0;">
              🌐 <a href="https://enduraevents.com" style="color: #1d6fd6; text-decoration: none;">enduraevents.com</a>
            </p>
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
