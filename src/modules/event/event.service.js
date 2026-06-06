const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const EventRepository = require('./event.repository');
const EmailService = require('../../utils/email');

const emailService = new EmailService();

class EventService {
  constructor() {
    this.eventRepository = new EventRepository();
  }

  generateSlug(title) {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueId = Date.now().toString(36);
    return `${baseSlug}-${uniqueId}`;
  }

  formatEventDate(dateValue) {
    if (!dateValue) {
      return 'TBA';
    }

    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatEventTime(dateValue, fallbackTime) {
    if (!dateValue) {
      return fallbackTime || 'TBA';
    }

    return new Date(dateValue).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  buildApprovalEmailTemplate(participantName, event) {
    const location = event.location || 'TBA';
    const eventDate = this.formatEventDate(event.startAt);
    const eventTime = this.formatEventTime(event.startAt, event.time);

    const subject = `Registration Confirmed: ${event.title}`;
    const text = `Hi ${participantName},\n\nYour registration for ${event.title} has been successfully confirmed.\n\nThank you for registering through Endura Events.\n\nEvent Details\nLocation: ${location}\nDate: ${eventDate}\nTime: ${eventTime}\n\nYour bib collection details and any additional event updates will be shared closer to race day.\n\nPlease ensure that you:\n* Arrive early on event day\n* Stay hydrated\n* Follow all event instructions from organizers and marshals\n\nWe're excited to have you on the start line and appreciate your support.\n\nSee you on race day.\n\nBest regards,\nEndura Sports Limited Traded as Endura Events.\nPowered by Powerhouse\nenduraevents.com`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
        <p style="font-size: 16px; margin: 0 0 18px 0;">Hi <strong>${participantName}</strong>,</p>

        <p style="font-size: 16px; margin: 0 0 14px 0;">Your registration for <strong>${event.title}</strong> has been successfully confirmed. 🎉</p>

        <p style="font-size: 16px; margin: 0 0 18px 0;">Thank you for registering through Endura Events.</p>

        <p style="font-size: 16px; margin: 0 0 8px 0;"><strong>Event Details</strong></p>
        <p style="font-size: 16px; margin: 0 0 6px 0;">📍 Location: ${location}</p>
        <p style="font-size: 16px; margin: 0 0 6px 0;">🗓️ Date: ${eventDate}</p>
        <p style="font-size: 16px; margin: 0 0 18px 0;">⏰ Time: ${eventTime}</p>

        <p style="font-size: 16px; margin: 0 0 16px 0;">Your bib collection details and any additional event updates will be shared closer to race day.</p>

        <p style="font-size: 16px; margin: 0 0 10px 0;">Please ensure that you:</p>
        <ul style="font-size: 16px; line-height: 1.7; margin-top: 0; padding-left: 20px;">
          <li>Arrive early on event day</li>
          <li>Stay hydrated</li>
          <li>Follow all event instructions from organizers and marshals</li>
        </ul>

        <p style="font-size: 16px; margin: 0 0 16px 0;">We're excited to have you on the start line and appreciate your support.</p>

        <p style="font-size: 16px; margin: 0 0 20px 0;">See you on race day.</p>

        <p style="font-size: 16px; line-height: 1.7; margin: 0;">
          Best regards,<br/>
          Endura Sports Limited Traded as Endura Events.<br/>
          Powered by Powerhouse
        </p>

        <p style="font-size: 16px; margin-top: 16px; margin-bottom: 0;">🌐 <a href="https://enduraevents.com" style="color: #1d6fd6; text-decoration: none;">enduraevents.com</a></p>
      </div>
    `;

    return { subject, text, html };
  }

  buildOrganizerApprovalEmailTemplate(organizerName, event) {
    const location = event.location || 'TBA';
    const eventDate = this.formatEventDate(event.startAt);
    const eventTime = this.formatEventTime(event.startAt, event.time);

    const subject = `Event Approved: ${event.title}`;
    const text = `Hi ${organizerName},\n\nGreat news. Your event ${event.title} has been approved by admin.\n\nEvent Details\nLocation: ${location}\nDate: ${eventDate}\nTime: ${eventTime}\n\nYou can now manage your event from your organizer dashboard and follow participant registrations.\n\nBest regards,\nEndura Sports Limited Traded as Endura Events.\nPowered by Powerhouse\nenduraevents.com`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #f9f9f9; max-width: 620px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
        <p>Hi ${organizerName},</p>

        <p>Great news. Your event <strong>${event.title}</strong> has been approved by admin.</p>

        <h3 style="margin-top: 24px; margin-bottom: 10px;">Event Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${location}</p>
        <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${eventDate}</p>
        <p style="margin: 0 0 14px 0;"><strong>Time:</strong> ${eventTime}</p>

        <p>You can now manage your event from your organizer dashboard and follow participant registrations.</p>

        <p style="margin-top: 20px;">
          Best regards,<br/>
          Endura Sports Limited Traded as Endura Events.<br/>
          Powered by Powerhouse<br/>
          <a href="https://enduraevents.com" style="color: #1d6fd6; text-decoration: none;">enduraevents.com</a>
        </p>
      </div>
    `;

    return { subject, text, html };
  }

  async sendApprovedEventEmails(eventId) {
    const eventWithParticipants =
      await this.eventRepository.getEventParticipantsForApproval(eventId);

    if (!eventWithParticipants) {
      return;
    }

    const organizerEmail = eventWithParticipants.organizer?.email;
    if (!organizerEmail) {
      return;
    }

    const organizerName =
      eventWithParticipants.organizer?.fullName || 'Organizer';
    const { subject, text, html } = this.buildOrganizerApprovalEmailTemplate(
      organizerName,
      eventWithParticipants,
    );

    await emailService.sendMail(organizerEmail, subject, text, html);
  }

  async createEvent(eventData) {
    try {
      const slug = eventData.slug || this.generateSlug(eventData.title);
      eventData.slug = slug;
      const result = await this.eventRepository.createEvent(eventData);
      return result;
    } catch (error) {
      logger.error('Create event failed:', error);
      throw error;
    }
  }

  async getAllEvents(filterDTO, userId) {
    try {
      const { events, total } = await this.eventRepository.getAllEvents(
        filterDTO,
        userId,
      );
      return {
        events: events,
        pagination: {
          currentPage: filterDTO.page,
          itemsPerPage: filterDTO.limit,
          totalItems: total,
          totalPages: Math.ceil(total / filterDTO.limit),
          hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
          hasPreviousPage: filterDTO.page > 1,
        },
      };
    } catch (error) {
      logger.error('get event failed:', error);
      throw error;
    }
  }

  async getAllEventsWebsite(filterDTO) {
    try {
      const { events, total } =
        await this.eventRepository.getAllEventsWebsite(filterDTO);
      return {
        events: events,
        pagination: {
          currentPage: filterDTO.page,
          itemsPerPage: filterDTO.limit,
          totalItems: total,
          totalPages: Math.ceil(total / filterDTO.limit),
          hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
          hasPreviousPage: filterDTO.page > 1,
        },
      };
    } catch (error) {
      logger.error('get event failed:', error);
      throw error;
    }
  }

  async getEventById(eventId) {
    try {
      const event = await this.eventRepository.getEventById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      logger.error(`Get event with ID ${eventId} failed:`, error);
      throw error;
    }
  }

  async getEventByIdWithRevenue(eventId) {
    try {
      const event = await this.eventRepository.getEventRevenue(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      logger.error(`Get event with ID ${eventId} failed:`, error);
      throw error;
    }
  }

  async getUserBookedEvents(userId) {
    try {
      const event = await this.eventRepository.getUserBookedEvents(userId);
      return event;
    } catch (error) {
      logger.error(`Get event with ID ${userId} failed:`, error);
      throw error;
    }
  }

  async getEventBySlug(slug) {
    try {
      const event = await this.eventRepository.getEventBySlug(slug);
      if (!event) {
        throw new AppError('Event not found', 404);
      }
      return event;
    } catch (error) {
      logger.error(`Get event with ID ${slug} failed:`, error);
      throw error;
    }
  }

  async updateEvent(eventId, updateData) {
    try {
      if (updateData.complete) {
        updateData.status = 'COMPLETED';
      } else if (updateData.complete === false) {
        updateData.status = 'APPROVED';
      }

      const existingEvent = await this.eventRepository.getEventById(eventId);
      if (!existingEvent) {
        throw new AppError('Event not found', 404);
      }

      if (updateData.totalSeats) {
        updateData.availableSeats =
          existingEvent.availableSeats +
          (updateData.totalSeats - existingEvent.totalSeats);
      }

      const result = await this.eventRepository.updateEvent(
        eventId,
        updateData,
      );
      if (!result) {
        throw new AppError('Event not found', 404);
      }
      logger.info(`Event with ID ${eventId} updated successfully`, updateData);
      return result;
    } catch (error) {
      logger.error(`Update event with ID ${eventId} failed:`, error);
      throw error;
    }
  }

  async updateEventStatus(eventId, updateData) {
    try {
      const result = await this.eventRepository.updateEventStatus(
        eventId,
        updateData,
      );
      if (!result) {
        throw new AppError('Event not found', 404);
      }

      if (updateData === 'APPROVED') {
        setImmediate(() => {
          this.sendApprovedEventEmails(eventId).catch((emailError) => {
            logger.warn(
              `Approved-event email failed for event ${eventId}: ${emailError.message}`,
            );
          });
        });
      }

      logger.info(`Event with ID ${eventId} updated successfully`, updateData);
      return result;
    } catch (error) {
      logger.error(`Update event with ID ${eventId} failed:`, error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const result = await this.eventRepository.deleteEvent(eventId);
      if (!result) {
        throw new AppError('Event not found', 404);
      }
      return result;
    } catch (error) {
      logger.error(`Delete event with ID ${eventId} failed:`, error);
      throw error;
    }
  }
}

module.exports = EventService;
