const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

class DashboardServices {
  async getAdminDashboardStats() {
    try {
      const [totalEvents, totalPayments, totalOrganizers] = await Promise.all([
        // 1. Total Events
        prisma.event.count(),

        // 2. Total Earnings (Platform Fees from Payments)
        prisma.payment.aggregate({
          where: { status: 'SUCCEEDED' },
          _sum: { processingFee: true },
        }),

        // 3. Total Organizers
        prisma.user.count({
          where: { role: 'ORGANIZER' },
        }),
      ]);

      return {
        totalEvents,
        totalEarnings: Number(totalPayments._sum.processingFee) || 0,
        totalOrganizers,
      };
    } catch (error) {
      logger.error('Error getting events:', error);
      throw error;
    }
  }

  formatSalesData(sales, range, startDate, endDate) {
    const groups = {};
    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      let label;

      if (range === 'year' || range === 'lastYear') {
        label = date.toLocaleDateString('en-US', { month: 'short' });
      } else if (range === 'week') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }

      groups[label] = (groups[label] || 0) + Number(sale.total);
    });
    if (range === 'year' || range === 'lastYear') {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return months.map((m) => ({
        label: m,
        amount: groups[m] || 0,
      }));
    } else {
      const result = [];
      let current = new Date(startDate.getTime());
      const finalEnd = new Date(endDate.getTime());

      while (current <= finalEnd) {
        let label;
        if (range === 'week') {
          label = current.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          label = current.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        }

        result.push({
          label: label,
          amount: groups[label] || 0,
        });

        current.setDate(current.getDate() + 1);
      }
      return result;
    }
  }

  formatSalesDataOr(sales, range, startDate, endDate) {
    const groups = {};

    // ১. পেমেন্টগুলো গ্রুপিং করা
    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      let label;

      // year অথবা lastYear হলে শুধু মাসের নাম লেবেল হবে (Jan, Feb...)
      if (range === 'year' || range === 'lastYear') {
        label = date.toLocaleDateString('en-US', { month: 'short' });
      }
      // week হলে বারের নাম (Mon, Tue...) অথবা তারিখ ব্যবহার করতে পারেন
      else if (range === 'week') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      // month হলে তারিখ (May 5...)
      else {
        label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }

      groups[label] = (groups[label] || 0) + Number(sale.subtotal);
    });

    if (range === 'year' || range === 'lastYear') {
      const allMonths = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return allMonths.map((m) => ({
        label: m,
        amount: groups[m] || 0,
      }));
    } else {
      const result = [];
      let current = new Date(startDate.getTime());
      const finalEnd = new Date(endDate.getTime());

      while (current <= finalEnd) {
        let label;
        if (range === 'week') {
          label = current.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          label = current.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        }

        result.push({
          label: label,
          amount: groups[label] || 0,
        });

        current.setDate(current.getDate() + 1);
      }
      return result;
    }
  }

  async getSalesPerformance(range = 'week') {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (range === 'week') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'lastYear') {
      startDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    }

    const sales = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return this.formatSalesData(sales, range, startDate, endDate);
  }

  async getOrganizerDashboardStats(userId) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const allStatuses = [
        'DRAFT',
        'PENDING',
        'APPROVED',
        'UPCOMING',
        'ONGOING',
        'COMPLETED',
        'REJECTED',
        'SUSPENDED',
        'CANCELLED',
      ];

      const initialStats = allStatuses.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {});

      const [eventStatusCounts, monthlyParticipants, revenueData] =
        await Promise.all([
          prisma.event.groupBy({
            by: ['status'],
            where: { organizerId: userId },
            _count: { status: true },
          }),

          prisma.registration.count({
            where: {
              event: { organizerId: userId },
              status: 'CONFIRMED',
              createdAt: { gte: startOfMonth },
            },
          }),

          prisma.payment.aggregate({
            where: {
              event: { organizerId: userId },
              status: 'SUCCEEDED',
            },
            _sum: {
              subtotal: true,
            },
          }),
        ]);

      const statusStats = { ...initialStats };
      eventStatusCounts.forEach((curr) => {
        statusStats[curr.status] = curr._count.status;
      });

      const totalEvents = eventStatusCounts.reduce(
        (sum, curr) => sum + curr._count.status,
        0,
      );

      return {
        totalEvents,
        statusStats,
        monthlyParticipants,
        totalRevenue: Number(revenueData._sum.subtotal || 0),
      };
    } catch (error) {
      logger.error('Error getting organizer stats:', error);
      throw error;
    }
  }

  async getOrganizerSalesPerformance(range = 'week', userId) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    console.log('Range:', range);

    if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'lastYear') {
      startDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    }

    const sales = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        event: {
          organizerId: userId,
        },
      },
      select: {
        subtotal: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return this.formatSalesDataOr(sales, range, startDate, endDate);
  }

  async getTopEvents(range = 'week', userId) {
    try {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      if (range === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (range === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (range === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (range === 'lastYear') {
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      }

      const topEvents = await prisma.registration.groupBy({
        by: ['eventId'],
        where: {
          event: { organizerId: userId },
          status: 'CONFIRMED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      // ৩. ইভেন্টের টাইটেলগুলো নিয়ে আসা
      const eventDetails = await Promise.all(
        topEvents.map(async (item) => {
          const event = await prisma.event.findUnique({
            where: { id: item.eventId },
            select: { title: true },
          });
          return {
            label: event?.title || 'Unknown Event',
            value: item._count.id,
          };
        }),
      );

      return eventDetails;
    } catch (error) {
      logger.error('Error getting top events:', error);
      throw error;
    }
  }

  async getOrganizerEarnings(organizerId) {
    const onlinePayments = await prisma.payment.aggregate({
      where: {
        event: {
          is: {
            organizerId: organizerId,
          },
        },
        status: 'SUCCEEDED',
        registrations: {
          some: {
            source: 'ONLINE',
          },
        },
      },
      _sum: {
        subtotal: true,
      },
    });

    const manualPayments = await prisma.payment.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: 'SUCCEEDED',
        registrations: {
          some: {
            source: 'MANUAL_ADD',
          },
        },
      },
      _sum: {
        subtotal: true,
      },
    });

    console.log('Online Payments:', onlinePayments);
    console.log('Manual Payments:', manualPayments);

    return {
      organizerId,
      onlineEarnings: onlinePayments._sum.total
        ? Number(onlinePayments._sum.total)
        : 0,
      manualEarnings: manualPayments._sum.total
        ? Number(manualPayments._sum.total)
        : 0,
      totalEarnings:
        (onlinePayments._sum.total ? Number(onlinePayments._sum.total) : 0) +
        (manualPayments._sum.total ? Number(manualPayments._sum.total) : 0),
    };
  }
}

module.exports = DashboardServices;
