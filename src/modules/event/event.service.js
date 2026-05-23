const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const EventRepository = require('./event.repository');

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
