/**
 * Event Management Repository
 * Handles database operations for event management (separate from auth)
 */

const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class EventRepository {
  /**
   * @method createEvent
   * Create a new event (ORGANIZER function)
   * @param {Object} eventData - event data
   * @returns {Object} Created event
   */
  async createEvent(eventData) {
    try {
      const result = await prisma.event.create({
        data: {
          title: eventData.title,
          slug: eventData.slug,
          coverImageUrl: eventData.coverImageUrl,
          flag: eventData.flag,
          status: eventData.status,
          startAt: eventData.startAt,
          endAt: eventData.endAt,
          timezone: eventData.timezone,
          location: eventData.location,
          country: eventData.country,
          distance: eventData.distance,
          price: eventData.price,
          currency: eventData.currency,
          totalSeats: eventData.totalSeats,
          availableSeats: eventData.availableSeats,
          headline: eventData.headline,
          body: eventData.body,
          tagline: eventData.tagline,
          bulletsTop: eventData.bulletsTop,
          bulletsBottom: eventData.bulletsBottom,
          organizerId: eventData.organizerId,
          images: {
            create: eventData.images.map((url, index) => ({
              url: url,
              position: index,
            })),
          },
          tShirtIncluded: eventData.tShirtIncluded,
          tShirtSizes: eventData.tShirtSizes,
          tShirtPrice: eventData.tShirtPrice,
          isFree: eventData.isFree,
          tShirtImageUrl: eventData.tShirtImageUrl,
          promoCode: eventData.promoCode,
        },
        include: {
          images: true,
        },
      });
      logger.info(
        `event created by organizer: ${eventData.title} (ID: ${result.id})`,
      );
      return result;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async getAllEvents(filterDTO, userId) {
    try {
      const {
        sortBy,
        sortOrder,
        search,
        status,
        limit,
        organizerId,
        startDate,
        country,
        endDate,
        createdAfter,
      } = filterDTO;
      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (search) {
        whereCondition.push({
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { headline: { contains: search, mode: 'insensitive' } },
            { tagline: { contains: search, mode: 'insensitive' } },
          ],
        });
      }
      if (userId) {
        whereCondition.push({
          organizerId: userId,
        });
      }

      if (status) {
        whereCondition.push({
          status: status,
        });
      }

      if (country) {
        whereCondition.push({
          country: country,
        });
      }

      if (startDate || endDate) {
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        whereCondition.push({ startAt: dateFilter });
      }

      if (createdAfter) {
        const startDate = new Date(createdAfter);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(createdAfter);
        endDate.setHours(23, 59, 59, 999);

        whereCondition.push({
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      // Execute queries in parallel
      const [rawEvents, total] = await Promise.all([
        prisma.event.findMany({
          where: finalWhere,
          include: {
            images: true,
            organizer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: offset,
          take: limit,
        }),
        prisma.event.count({ where: finalWhere }),
      ]);

      const events = rawEvents.map((event) => ({
        ...event,
        price: Number(event.price),
      }));

      return {
        events,
        total,
      };
    } catch (error) {
      logger.error('Error getting events:', error);
      throw error;
    }
  }

  async getAllEventsWebsite(filterDTO) {
    try {
      const {
        sortBy,
        sortOrder,
        search,
        status,
        limit,
        country,
        startDate,
        endDate,
        createdAfter,
      } = filterDTO;
      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (!status) {
        whereCondition.push({
          status: {
            notIn: [
              'DRAFT',
              'PENDING',
              'COMPLETED',
              'REJECTED',
              'SUSPENDED',
              'CANCELLED',
            ],
          },
        });
      } else {
        whereCondition.push({ status: status });
      }

      if (search) {
        whereCondition.push({
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { headline: { contains: search, mode: 'insensitive' } },
            { tagline: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      if (country) {
        whereCondition.push({ country: country });
      }

      if (startDate || endDate) {
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);
        whereCondition.push({ startAt: dateFilter });
      }

      if (createdAfter) {
        const startDate = new Date(createdAfter);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(createdAfter);
        endDate.setHours(23, 59, 59, 999);

        whereCondition.push({
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [rawEvents, total] = await Promise.all([
        prisma.event.findMany({
          where: finalWhere,
          include: {
            images: true,
            organizer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: limit,
        }),
        prisma.event.count({ where: finalWhere }),
      ]);

      const events = rawEvents.map((event) => ({
        ...event,
        price: Number(event.price),
      }));

      return { events, total };
    } catch (error) {
      logger.error('Error getting events:', error);
      throw error;
    }
  }

  async getEventById(eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          images: true,
        },
      });

      const platformFee = await prisma.platformSetting.findUnique({
        where: { id: 1 },
      });
      return {
        ...event,
        price: Number(event.price),
        platformFeePct: Number(platformFee.platformFeePct),
      };
    } catch (error) {
      logger.error(`Error fetching event with ID ${eventId}:`, error);
      throw error;
    }
  }

  async getEventRevenue(eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
            },
          },
          images: true,
          payments: {
            where: {
              status: 'SUCCEEDED',
            },
            select: {
              subtotal: true,
            },
          },
        },
      });

      const platformFee = await prisma.platformSetting.findUnique({
        where: { id: 1 },
      });

      if (!event) return null;

      const revenue = event.payments.reduce((sum, payment) => {
        return sum + Number(payment.subtotal);
      }, 0);
      const { payments, ...eventData } = event;

      return {
        ...eventData,
        price: Number(eventData?.price),
        revenue: revenue ?? 0,
        platformFeePct: Number(platformFee.platformFeePct),
      };
    } catch (error) {
      logger.error(`Error calculating revenue for event ${eventId}:`, error);
      throw error;
    }
  }

  async getUserBookedEvents(userId) {
    try {
      const registrations = await prisma.registration.findMany({
        where: {
          userId: userId,
          status: 'CONFIRMED',
        },
        include: {
          event: {
            include: {
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const now = new Date();
      const allEvents = registrations.map((reg) => {
        const event = reg.event;
        return {
          ...event,
          price: Number(event.price),
          registrationStatus: reg.status,
          bookedAt: reg.createdAt,
        };
      });

      const result = {
        upcomingEvents: [],
        completedEvents: [],
      };

      allEvents.forEach((event) => {
        const eventDate = new Date(event.endDate || event.startDate);

        if (eventDate < now || event.status === 'COMPLETED') {
          result.completedEvents.push(event);
        } else {
          result.upcomingEvents.push(event);
        }
      });

      return result;
    } catch (error) {
      logger.error('Error fetching user events:', error);
      throw error;
    }
  }

  async getEventBySlug(slug) {
    try {
      const event = await prisma.event.findUnique({
        where: { slug: slug },
        include: {
          organizer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          images: true,
        },
      });
      return event;
    } catch (error) {
      logger.error(`Error fetching event with ID ${eventId}:`, error);
      throw error;
    }
  }

  async updateEvent(eventId, updateData) {
    try {
      const result = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...updateData,
          images:
            updateData.images?.length > 0
              ? {
                  deleteMany: {},
                  create: updateData.images.map((url) => ({
                    url: url,
                  })),
                }
              : undefined,
        },
      });

      if (!result) {
        logger.warn(`Event with ID ${eventId} not found for update`);
        throw new AppError('Event not found', 404);
      }

      return result;
    } catch (error) {
      logger.error('Error updating events:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId, status) {
    try {
      const result = await prisma.event.update({
        where: { id: eventId },
        data: { status },
      });

      if (!result) {
        logger.warn(`Event with ID ${eventId} not found for status update`);
        throw new AppError('Event not found', 404);
      }
      return result;
    } catch (error) {
      logger.error('Error updating event status:', error);
      throw error;
    }
  }

  async getEventParticipantsForApproval(eventId) {
    try {
      return await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          location: true,
          startAt: true,
          time: true,
          organizer: {
            select: {
              email: true,
              fullName: true,
            },
          },
          registrations: {
            where: {
              status: 'CONFIRMED',
            },
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(
        `Error fetching event participants for event ${eventId}:`,
        error,
      );
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Delete dependent payments first
        await tx.payment.deleteMany({
          where: { eventId: eventId },
        });

        // 2. Delete dependent registrations (uncomment if needed)
        await tx.registration.deleteMany({
          where: { eventId: eventId },
        });

        // 3. Finally, delete the event
        return await tx.event.delete({
          where: { id: eventId },
        });
      });
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }
}

module.exports = EventRepository;
