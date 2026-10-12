const crypto = require('crypto');
const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');
const PaymentService = require('../payment/payment.services');

const paymentService = new PaymentService();

// WiPay order_id must stay short (~16 chars).
const buildSponsorOrderId = () =>
  `S${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}`;

const getSponsorResponseUrl = () =>
  String(
    process.env.WIPAY_SPONSOR_RESPONSE_URL ||
      `${process.env.FRONTEND_URL}/sponsor/payment-success`,
  ).trim();

const toPublicResult = (request) => ({
  orderId: request.orderId,
  supportType: request.supportType,
  name: request.name,
  email: request.email,
  amount: request.amount,
  currency: request.currency,
  paymentStatus: request.paymentStatus,
  paidAt: request.paidAt,
});

class SponsorRequestServices {
  async create(data) {
    const request = await prisma.sponsorRequest.create({
      data: { ...data, orderId: buildSponsorOrderId() },
    });

    if (request.amount === null) {
      return { orderId: request.orderId, paymentUrl: null };
    }

    try {
      const order = await paymentService.createWiPayOrder(
        request.amount,
        request.orderId,
        request.email,
        getSponsorResponseUrl(),
      );

      return {
        orderId: request.orderId,
        paymentUrl: order.paymentUrl,
      };
    } catch (error) {
      await prisma.sponsorRequest
        .delete({ where: { id: request.id } })
        .catch((cleanupError) =>
          logger.error('Failed to remove unpaid sponsor request:', cleanupError),
        );
      throw error;
    }
  }

  async confirmWiPayPayment({ orderId, transactionId, status, hash, message }) {
    const resolvedOrderId = String(orderId || '').trim();
    if (!resolvedOrderId) {
      throw new AppError('order_id is required for WiPay confirmation.', 400);
    }

    const request = await prisma.sponsorRequest.findUnique({
      where: { orderId: resolvedOrderId },
    });

    if (!request || request.amount === null) {
      throw new AppError('Sponsor request not found for this order.', 404);
    }

    if (request.paymentStatus === 'SUCCEEDED') {
      return toPublicResult(request);
    }

    if (String(status || '').trim().toLowerCase() !== 'success') {
      throw new AppError(message || 'WiPay payment was not successful.', 400);
    }

    const txnId = String(transactionId || '').trim();
    if (!txnId || !hash) {
      throw new AppError(
        'transaction_id and hash are required for WiPay confirmation.',
        400,
      );
    }

    const { apiKey } = paymentService.getWiPayConfig();
    const expectedHash = paymentService.buildWiPayResponseHash(
      txnId,
      request.amount,
      apiKey,
    );

    if (expectedHash.toLowerCase() !== String(hash).trim().toLowerCase()) {
      throw new AppError('Invalid WiPay response hash.', 400);
    }

    const updated = await prisma.sponsorRequest.update({
      where: { id: request.id },
      data: {
        paymentStatus: 'SUCCEEDED',
        transactionId: txnId,
        paidAt: new Date(),
      },
    });

    return toPublicResult(updated);
  }

  async deleteById(id) {
    try {
      await prisma.sponsorRequest.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError('Sponsor request not found.', 404);
      }
      throw error;
    }
  }

  async getAll(filterDTO) {
    const { search, supportType, paymentStatus, limit, page } = filterDTO;
    const where = {
      ...(supportType ? { supportType } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { eventName: { contains: search, mode: 'insensitive' } },
              { itemDescription: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total, typeCounts, received] = await Promise.all([
      prisma.sponsorRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filterDTO.getOffset(),
        take: limit,
      }),
      prisma.sponsorRequest.count({ where }),
      prisma.sponsorRequest.groupBy({
        by: ['supportType'],
        _count: { _all: true },
      }),
      prisma.sponsorRequest.aggregate({
        where: { paymentStatus: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ]);

    const countOf = (type) =>
      typeCounts.find((row) => row.supportType === type)?._count._all || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: {
        items,
        stats: {
          total:
            countOf('SPONSORSHIP') + countOf('DONATION') + countOf('IN_KIND'),
          sponsorships: countOf('SPONSORSHIP'),
          donations: countOf('DONATION'),
          inKind: countOf('IN_KIND'),
          totalReceived: Number(received._sum.amount || 0),
        },
      },
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}

module.exports = SponsorRequestServices;
