const { prisma } = require('../../config/database');

class PlatformSettingService {
  async getSettings() {
    const result = await prisma.platformSetting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    return {
      ...result,
      platformFeePct: Number(result.platformFeePct),
    };
  }

  async updateSettings(data, userId) {
    return await prisma.platformSetting.update({
      where: { id: 1 },
      data: {
        platformFeePct: data.platformFeePct,
        currency: data.currency,
        updatedById: userId,
      },
    });
  }
}

module.exports = PlatformSettingService;
