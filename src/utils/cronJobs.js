const cron = require('node-cron');
const { prisma } = require('../config/database');

const updateExpiredEvents = async () => {
  try {
    const now = new Date();
    console.log(`[Cron Job] Running daily update at: ${now.toISOString()}`);

    const result = await prisma.event.updateMany({
      where: {
        startAt: {
          lt: now,
        },
      },
      data: {
        complete: true,
        status: 'COMPLETED',
      },
    });

    if (result.count > 0) {
      console.log(
        `[Cron Job] Successfully updated ${result.count} events to COMPLETED.`,
      );
    }
  } catch (error) {
    console.error('[Cron Job Error]:', error);
  }
};

cron.schedule('1 0 * * *', () => {
  updateExpiredEvents();
});

module.exports = updateExpiredEvents;
