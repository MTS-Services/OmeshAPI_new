const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../middlewares/errorHandler');
const PaymentService = require('../payment/payment.services');
const paymentEmitter = require('../../utils/eventEmitter');
const logger = require('../../utils/logger');
const { prisma } = require('../../config/database');

const PaypalService = new PaymentService();

const getStoredPaymentMethod = (paymentMethod) => {
  if (paymentMethod === 'FYGARO') {
    return 'CARD';
  }

  return paymentMethod;
};

const createRegistrationTransaction = async ({
  data,
  user,
  paymentMethod = 'PAYPAL',
}) => {
  const { eventId, participants, couponCode, platformFee = 0, source } = data;
  const onlinePaymentMethod = source === 'ONLINE' ? paymentMethod : 'MANUAL';

  const transactionResult = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (
      !event ||
      event.registerClose ||
      event.availableSeats < participants.length
    ) {
      throw new AppError('Registration unavailable or seats full.', 400);
    }

    const batchId = `${source}-${Date.now()}`;
    let subtotal = Number(event.price) * participants.length;

    const tShirtCount = participants.filter((p) => p.buyTShirt).length;

    if (event.tShirtIncluded && !event.isFree) {
      subtotal += Number(event.tShirtPrice) * tShirtCount;
    }

    const platformFeePct = Number(platformFee);
    const totalAdminFee = (subtotal * platformFeePct) / 100;

    let paymentStatus = 'PENDING';
    let registrationStatus = 'PENDING_PAYMENT';

    if (source === 'MANUAL_ADD') {
      await tx.organizerProfile.findUnique({
        where: { userId: event.organizerId },
      });
      await tx.organizerProfile.update({
        where: { userId: event.organizerId },
        data: {
          manualBalance: { increment: subtotal },
          manualCount: { increment: participants.length },
        },
      });

      paymentStatus = 'SUCCEEDED';
      registrationStatus = 'CONFIRMED';

      await tx.event.update({
        where: { id: eventId },
        data: { availableSeats: { decrement: participants.length } },
      });
    }

    const payment = await tx.payment.create({
      data: {
        batchId,
        eventId,
        subtotal: subtotal,
        processingFee: source === 'MANUAL_ADD' ? 0 : Number(totalAdminFee),
        total:
          source === 'ONLINE'
            ? subtotal + totalAdminFee
            : Number(totalAdminFee),
        method:
          source === 'ONLINE'
            ? getStoredPaymentMethod(onlinePaymentMethod)
            : 'MANUAL',
        status: paymentStatus,
        paidAt: source === 'MANUAL_ADD' ? new Date() : null,
      },
    });

    await tx.registration.createMany({
      data: participants.map((p) => ({
        ...p,
        eventId,
        batchId,
        status: registrationStatus,
        source: source,
        couponCode: couponCode,
        userId:
          source === 'ONLINE' ? user.id : user.role === 'USER' ? user.id : null,
        selectedTShirtSize: p.selectedTShirtSize || null,
        buyTShirt: p.buyTShirt || false,
      })),
    });

    if (source === 'ONLINE') {
      const providerOrder = await PaypalService.createOrder(
        subtotal + totalAdminFee,
        batchId,
        onlinePaymentMethod,
        event.title,
      );

      if (providerOrder.providerRef) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { providerRef: providerOrder.providerRef },
        });
      }

      if (onlinePaymentMethod === 'FYGARO') {
        return {
          source,
          batchId,
          paymentMethod: 'FYGARO',
          paymentUrl: providerOrder.paymentUrl,
          fygaroPaymentUrl: providerOrder.paymentUrl,
          expiresAt: providerOrder.expiresAt,
        };
      }

      return {
        source,
        paypalOrderId: providerOrder.id,
        approvalUrl: providerOrder.links.find((link) => link.rel === 'approve')
          ?.href,
      };
    }

    return {
      source,
      message: 'Manual registration successful',
      batchId,
      notifyPayload:
        source === 'MANUAL_ADD'
          ? {
              payment: {
                batchId,
                eventName: event.title,
              },
              registrations: participants,
            }
          : null,
    };
  });

  if (transactionResult?.notifyPayload) {
    paymentEmitter.emit('payment.success', transactionResult.notifyPayload);
  }

  const { notifyPayload, ...response } = transactionResult;
  return response;
};

class RegistrationService {
  async processRegistration(data, user) {
    return createRegistrationTransaction({
      data,
      user,
      paymentMethod: 'PAYPAL',
    });
  }

  async processFygaroRegistration(data, user) {
    return createRegistrationTransaction({
      data,
      user,
      paymentMethod: 'FYGARO',
    });
  }

  // async processRegistration(data, user) {
  //   const { eventId, participants, couponCode, platformFee = 0, source } = data;
  //   const event = await prisma.event.findUnique({
  //     where: { id: eventId },
  //     select: {
  //       id: true,
  //       price: true,
  //       tShirtIncluded: true,
  //       tShirtPrice: true,
  //       isFree: true,
  //       registerClose: true,
  //       availableSeats: true,
  //       organizerId: true,
  //     },
  //   });
  //   if (
  //     !event ||
  //     event.registerClose ||
  //     event.availableSeats < participants.length
  //   ) {
  //     throw new AppError('Registration unavailable or seats full.', 400);
  //   }

  //   const batchId = `${source}-${Date.now()}`;
  //   let subtotal = Number(event.price) * participants.length;
  //   const tShirtCount = participants.filter((p) => p.buyTShirt).length;
  //   if (event.tShirtIncluded && !event.isFree) {
  //     subtotal += Number(event.tShirtPrice) * tShirtCount;
  //   }
  //   const platformFeePct = Number(platformFee);
  //   const totalAdminFee = (subtotal * platformFeePct) / 100;
  //   const totalAmount = subtotal + totalAdminFee;

  //   let paymentId;
  //   let registrationStatus = 'PENDING_PAYMENT';
  //   let paymentStatus = 'PENDING';

  //   await prisma.$transaction(async (tx) => {
  //     if (source === 'MANUAL_ADD') {
  //       await tx.organizerProfile.update({
  //         where: { userId: event.organizerId },
  //         data: {
  //           manualBalance: { increment: subtotal },
  //           manualCount: { increment: participants.length },
  //         },
  //       });
  //       await tx.event.update({
  //         where: { id: eventId },
  //         data: { availableSeats: { decrement: participants.length } },
  //       });
  //       paymentStatus = 'SUCCEEDED';
  //       registrationStatus = 'CONFIRMED';
  //     }

  //     const payment = await tx.payment.create({
  //       data: {
  //         batchId,
  //         eventId,
  //         subtotal: subtotal,
  //         processingFee: source === 'MANUAL_ADD' ? 0 : Number(totalAdminFee),
  //         total: source === 'ONLINE' ? subtotal + totalAdminFee : totalAdminFee,
  //         method: source === 'ONLINE' ? 'PAYPAL' : 'MANUAL',
  //         status: paymentStatus,
  //         paidAt: source === 'MANUAL_ADD' ? new Date() : null,
  //       },
  //     });
  //     paymentId = payment.id;

  //     await tx.registration.createMany({
  //       data: participants.map((p) => ({
  //         ...p,
  //         eventId,
  //         batchId,
  //         status: registrationStatus,
  //         source: source,
  //         couponCode: couponCode,
  //         userId: source === 'ONLINE' ? user.id : null,
  //         selectedTShirtSize: p.selectedTShirtSize || null,
  //         buyTShirt: p.buyTShirt || false,
  //       })),
  //     });
  //   });

  //   if (source === 'ONLINE') {
  //     try {
  //       const paypalOrder = await PaypalService.createOrder(
  //         totalAmount,
  //         batchId,
  //       );
  //       await prisma.payment.update({
  //         where: { id: paymentId },
  //         data: { providerRef: paypalOrder.id },
  //       });
  //       return {
  //         source,
  //         paypalOrderId: paypalOrder.id,
  //         approvalUrl: paypalOrder.links.find((l) => l.rel === 'approve').href,
  //       };
  //     } catch (error) {
  //       throw new AppError('PayPal integration failed, please try again.', 500);
  //     }
  //   }

  //   return {
  //     source,
  //     message: 'Manual registration successful',
  //     batchId,
  //   };
  // }

  async getAllRegistration(filterDTO) {
    try {
      const {
        sortBy,
        sortOrder,
        search,
        status = 'CONFIRMED',
        limit,
        eventId,
        source,
      } = filterDTO;
      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (search) {
        whereCondition.push({
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      if (status) {
        whereCondition.push({
          status: status,
        });
      }

      if (eventId) {
        whereCondition.push({
          eventId: eventId,
        });
      }

      if (source) {
        whereCondition.push({
          source: source,
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      // Execute queries in parallel
      const [data, total] = await Promise.all([
        prisma.registration.findMany({
          where: finalWhere,
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: offset,
          take: limit,
        }),
        prisma.registration.count({ where: finalWhere }),
      ]);

      return {
        data,
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
      logger.error('Error getting events:', error);
      throw error;
    }
  }

  async getAllPayment() {
    const response = await prisma.payment.findMany();
    return response;
  }

  async getRegistrationExportData(filterDTO) {
    const where = {};

    if (filterDTO.eventId) {
      where.eventId = filterDTO.eventId;
      where.status = 'CONFIRMED';
    }

    // if (filterDTO.status) {
    //   where.status = filterDTO.status;
    // }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registrations.map((registration) => ({
      // registrationId: registration.id,
      // eventId: registration.eventId,
      eventTitle: registration.event?.title || '',
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone || '',
      age: registration.age || '',
      gender: registration.gender || '',
      couponCode: registration.couponCode || '',
      selectedTShirtSize: registration.selectedTShirtSize || '',
      status: registration.status,
      source: registration.source,
      teamClub: registration.teamClub || '',
      createdAt: registration.createdAt.toISOString(),
    }));
  }
}

module.exports = RegistrationService;
