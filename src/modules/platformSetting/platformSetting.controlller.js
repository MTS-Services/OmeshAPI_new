const { asyncHandler } = require('../../middlewares/errorHandler');
const PlatformSettingService = require('./platformSetting.services');

class PlatformSettingController {
  constructor() {
    this.platformSettingService = new PlatformSettingService();
  }

  // GET: Get current settings
  getSettings = asyncHandler(async (req, res) => {
    const settings = await this.platformSettingService.getSettings();
    res.sendSuccess(settings, 'Settings retrieved successfully');
  });

  // PATCH/PUT: Update settings
  updateSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From your auth middleware
    const updatedSettings = await this.platformSettingService.updateSettings(
      req.body,
      userId,
    );
    res.sendSuccess(updatedSettings, 'Settings updated successfully');
  });
}

module.exports = PlatformSettingController;
