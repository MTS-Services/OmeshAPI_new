const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class PayoutServices {
  async create(data) {
    try {
      return await prisma.$transaction(async (tx) => {
        const organizerProfile = await tx.organizerProfile.findUnique({
          where: { userId: data.organizerId },
        });

        if (!organizerProfile) {
          throw new AppError('Organizer profile not found.', 404);
        }

        if (Number(organizerProfile.availableBalance) < Number(data.amount)) {
          throw new AppError(
            'Insufficient balance for this payout request.',
            400,
          );
        }

        const payoutRequest = await tx.payoutRequest.create({
          data: {
            organizerId: data.organizerId,
            amount: data.amount,
            currency: data.currency || 'USD',
            method: data.method,
            note: data.note,
            status: 'REQUESTED',
            accountNumber: data.accountNumber,
          },
        });

        await tx.organizerProfile.update({
          where: { userId: data.organizerId },
          data: {
            availableBalance: { decrement: data.amount },
            pendingBalance: { increment: data.amount },
          },
        });

        return payoutRequest;
      });
    } catch (error) {
      logger.error('Error creating payout request logic:', error);
      throw error;
    }
  }

  async getAll(filterDTO) {
    try {
      const { status, organizerId, limit, sortBy, sortOrder } = filterDTO;
      const offset = filterDTO.getOffset();
      const whereCondition = [];

      if (status) {
        whereCondition.push({
          status: status,
        });
      }

      if (organizerId) {
        whereCondition.push({
          organizerId: organizerId,
        });
      }

      const finalWhere =
        whereCondition.length > 0 ? { AND: whereCondition } : {};

      const [payouts, total] = await Promise.all([
        prisma.payoutRequest.findMany({
          where: finalWhere,
          include: {
            organizer: { select: { fullName: true, email: true } },
            reviewedBy: { select: { fullName: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: offset,
          take: limit,
        }),
        prisma.payoutRequest.count({ where: finalWhere }),
      ]);

      return {
        data: payouts,
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
      logger.error('Error fetching payouts:', error);
      throw error;
    }
  }

  async getOrganizeBalance(id) {
    try {
      const user = await prisma.organizerProfile.findUnique({
        where: { userId: id },
        select: {
          availableBalance: true,
          pendingBalance: true,
          totalEarnings: true,
          manualBalance: true,
        },
      });

      if (!user) {
        return null;
      }

      return {
        availableBalance: Number(user.availableBalance),
        pendingBalance: Number(user.pendingBalance),
        paypalEarnings: Number(user.totalEarnings),
        totalEarnings: Number(user.totalEarnings) + Number(user.manualBalance),
        manualBalance: Number(user.manualBalance),
      };
    } catch (error) {
      logger.error('Error fetching organizer balance:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await prisma.$transaction(async (tx) => {
        const currentRequest = await tx.payoutRequest.findUnique({
          where: { id },
          select: { amount: true, organizerId: true, status: true },
        });

        if (!currentRequest) throw new Error('Payout request not found');
        if (
          currentRequest.status === 'PAID' ||
          currentRequest.status === 'REJECTED'
        ) {
          throw new Error(
            `Cannot update a request that is already ${currentRequest.status}`,
          );
        }

        const updatedRequest = await tx.payoutRequest.update({
          where: { id },
          data: data,
        });

        const amount = currentRequest.amount;
        const userId = currentRequest.organizerId;

        if (data.status === 'REJECTED') {
          await tx.organizerProfile.update({
            where: { userId },
            data: {
              pendingBalance: { decrement: amount },
              availableBalance: { increment: amount },
            },
          });
        } else if (data.status === 'PAID') {
          await tx.organizerProfile.update({
            where: { userId },
            data: {
              pendingBalance: { decrement: amount },
              totalEarnings: { increment: amount },
            },
          });
        }

        return updatedRequest;
      });
    } catch (error) {
      logger.error('Error updating payout status logic:', error);
      throw error;
    }
  }
}

module.exports = PayoutServices;
