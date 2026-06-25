const EmailService = require('../../utils/email');
const paymentEmitter = require('../../utils/eventEmitter');
const { prisma } = require('../../config/database');

const emailService = new EmailService();

const formatProcessingDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Port_of_Spain',
  }).format(parsed);
};

const normalizeTimeForInput12Hour = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/[a-zA-Z]/.test(raw)) {
    return raw;
  }

  const timeMatch = raw.match(/^(\d{1,2}):(\d{2})/);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2].padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedHours = String(hours).padStart(2, '0');

    return `${formattedHours}:${minutes} ${ampm}`;
  }

  try {
    const parsed = new Date(raw.includes('T') ? raw : `1970-01-01T${raw}Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });
    }
  } catch {
    return '';
  }

  return '';
};

const formatAmount = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return 'N/A';
  }

  return numericAmount.toFixed(2);
};

const formatStartAt = (startAt) => {
  if (!startAt) {
    return { date: '', time: '' };
  }

  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const date = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
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
      organizer: {
        select: {
          organizerProfile: {
            select: {
              organizationName: true,
            },
          },
        },
      },
    },
  });

  const formattedStartAt = formatStartAt(event?.startAt);

  return {
    name: event?.title || payment.eventName || 'Event',
    location: event?.location || 'TBA',
    date: formattedStartAt.date || 'TBA',
    time: event?.time
      ? normalizeTimeForInput12Hour(event?.time)
      : formattedStartAt.time || 'TBA',
    companyTradeName:
      event?.organizer?.organizerProfile?.organizationName ||
      'Endura Sports Limited Traded as Endura Events.',
  };
};

const getProcessingDateNow = () => {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Port_of_Spain',
  }).format(new Date());
};

paymentEmitter.on('payment.success', async (data) => {
  const { payment, registrations, orderEmailData } = data;

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
        const processingDate = formatProcessingDate(
          orderEmailData?.processingDate ||
            payment?.paidAt ||
            payment?.updatedAt,
        );
        const companyTradeName =
          'Endura Sports Limited Traded as Endura Events.';
        const cardType = orderEmailData?.cardType || payment?.method || 'N/A';
        const transactionAmount = formatAmount(
          orderEmailData?.transactionAmount || payment?.total,
        );
        const currency = orderEmailData?.currency || payment?.currency || 'USD';
        const orderNumber =
          orderEmailData?.orderNumber ||
          payment?.providerRef ||
          payment?.batchId ||
          'N/A';
        const serviceDescription =
          orderEmailData?.serviceDescription ||
          eventDetails.name ||
          `Event Registration Batch: ${payment?.batchId || 'N/A'}`;

        await emailService.sendMail(
          reg.email,
          `Registration Confirmed: ${eventDetails.name}`,
          `Hi ${firstName},\n\nYour registration for ${eventDetails.name} has been successfully confirmed.\n\nThank you for registering through Endura Events.\n\nEvent Details\nLocation: ${eventDetails.location}\nDate: ${eventDetails.date}\nTime: ${eventDetails.time}\n\nOrder Information\nProcessing Date: ${processingDate}\nCompany Trade Name: ${companyTradeName}\nCard Type: ${cardType}\nTransaction Amount & Currency: ${transactionAmount} ${currency}\nOrder Number: ${orderNumber}\nDescription of the Service/Event: ${serviceDescription}\n\nYour bib collection details and any additional event updates will be shared closer to race day.\n\nPlease ensure that you:\n* Arrive early on event day\n* Stay hydrated\n* Follow all event instructions from organizers and marshals\n\nWe're excited to have you on the start line and appreciate your support.\n\nSee you on race day.\n\nBest regards,\nEndura Sports Limited Traded as Endura Events.\nPowered by Powerhouse\nenduraevents.com`,
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

            <p style="font-size: 16px; margin: 0 0 8px 0;"><strong>Order Information</strong></p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">Processing Date: ${getProcessingDateNow()}</p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">Company Trade Name: ${companyTradeName}</p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">Card Type: ${cardType}</p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">Transaction Amount &amp; Currency: ${transactionAmount} ${currency}</p>
            <p style="font-size: 16px; margin: 0 0 6px 0;">Order Number: ${orderNumber}</p>
            <p style="font-size: 16px; margin: 0 0 18px 0;">Description of the Service/Event: ${serviceDescription}</p>

            <p style="font-size: 16px; line-height: 1.8; margin: 0;">
              Best regards,<br/>
              Endura Sports Limited Traded as Endura Events.<br/>
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
