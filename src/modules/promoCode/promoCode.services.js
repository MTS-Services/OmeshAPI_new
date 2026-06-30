// services/promoCode.service.ts

const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class PromoCodeService {
  async create(data) {
    console.log(':====================', data);

    const { allowedEmails, userId, ...rest } = data;
    return await prisma.promoCode.create({
      data: {
        ...rest,
        user: {
          connect: { id: userId },
        },
        allowedEmails: {
          create: allowedEmails?.map((email) => ({ email })) || [],
        },
      },
      include: { allowedEmails: true },
    });
  }

  async getAll(filterDTO, userId) {
    const { sortBy, sortOrder, search, limit, isActive } = filterDTO;
    const offset = filterDTO.getOffset();
    const whereCondition = [];

    if (search) {
      whereCondition.push({
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (userId) {
      whereCondition.push({
        userid: userId,
      });
    }

    if (isActive) {
      whereCondition.push({
        isActive: isActive,
      });
    }
    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    const [data, total] = await Promise.all([
      prisma.promoCode.findMany({
        where: finalWhere,
        include: { allowedEmails: true },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.promoCode.count({ where: finalWhere }),
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
  }

  async update(id, data) {
    const { allowedEmails, ...rest } = data;

    // Update simple fields first
    return await prisma.promoCode.update({
      where: { id },
      data: {
        ...rest,
        // If emails are provided, replace the old ones
        allowedEmails: allowedEmails
          ? {
              deleteMany: {},
              create: allowedEmails.map((email) => ({ email })),
            }
          : undefined,
      },
    });
  }

  async validateAndApply(data) {
    const { code, emails, eventId } = data;

    const promo = await prisma.promoCode.findUnique({
      where: { code },
      include: { allowedEmails: true },
    });

    if (!promo || !promo.isActive) {
      throw new AppError(
        'The promo code you entered is invalid or has been deactivated.',
        400,
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (event?.promoCode !== code) {
      throw new AppError(
        'This promo code is not applicable for this specific event.',
        400,
      );
    }

    const now = new Date();
    if (promo.startsAt && now < promo.startsAt) {
      throw new AppError(
        `This promo code will be active starting from ${promo.startsAt.toLocaleDateString()}.`,
        400,
      );
    }

    if (promo.expiresAt && now > promo.expiresAt) {
      throw new AppError('Sorry, this promo code has already expired.', 400);
    }

    const emailList = Array.isArray(emails) ? emails : [emails];
    const normalizedEmailList = emailList
      .filter(Boolean)
      .map((email) => email.toLowerCase());

    // Check which emails are already registered for this event
    const existingRegistrations = await prisma.registration.findMany({
      where: {
        eventId,
        email: { in: normalizedEmailList },
      },
      select: { email: true },
    });
    const alreadyRegisteredEmails = new Set(
      existingRegistrations.map((r) => r.email.toLowerCase()),
    );

    // Check which emails are not in the allowedEmails list (only if the promo is restricted)
    const allowedEmailSet =
      promo.allowedEmails.length > 0
        ? new Set(promo.allowedEmails.map((e) => e.email.toLowerCase()))
        : null;

    const invalidEmails = [];
    const alreadyUsedEmails = [];

    for (const email of emailList) {
      const normalised = email.toLowerCase();
      if (alreadyRegisteredEmails.has(normalised)) {
        alreadyUsedEmails.push(email);
        continue;
      }
      if (allowedEmailSet && !allowedEmailSet.has(normalised)) {
        invalidEmails.push(email);
      }
    }

    let msg = '';
    if (alreadyUsedEmails.length > 0) {
      msg += `${alreadyUsedEmails.join(', ')} this email already used.`;
    }
    if (invalidEmails.length > 0) {
      if (msg.length > 0) msg += ' ';
      msg += `${invalidEmails.join(', ')} is a not valid email`;
    }
    if (msg.length > 0) {
      throw new AppError(msg, 400, [...alreadyUsedEmails, ...invalidEmails]);
    }

    return await prisma.promoCode.update({
      where: { id: promo.id },
      data: {
        redeemedCount: {
          increment: normalizedEmailList.length,
        },
      },
      include: { allowedEmails: true },
    });
  }

  async deletePromoCode(id) {
    return await prisma.promoCode.delete({
      where: { id },
    });
  }
}

module.exports = PromoCodeService;
