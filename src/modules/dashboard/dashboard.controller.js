const { asyncHandler } = require('../../middlewares/errorHandler');
const { filterUserDTO } = require('./dashboard.dto');

const DashboardServices = require('./dashboard.services');

class DashboardController {
  constructor() {
    this.services = new DashboardServices();
  }

  dashboardAdminStats = asyncHandler(async (req, res) => {
    const result = await this.services.getAdminDashboardStats();
    res.sendCreated(result, 'Get Data Successfully');
  });

  dashboardAdminSalesCount = asyncHandler(async (req, res) => {
    const { range } = req.query;
    const result = await this.services.getSalesPerformance(range);
    res.sendCreated(result, 'Get Data Successfully');
  });

  dashboardOrganizerStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await this.services.getOrganizerDashboardStats(userId);
    res.sendCreated(result, 'Get Data Successfully');
  });

  dashboardOrganizerSalesCount = asyncHandler(async (req, res) => {
    const { range } = req.query;
    const userId = req.user.id;
    const result = await this.services.getOrganizerSalesPerformance(
      range,
      userId,
    );
    res.sendCreated(result, 'Get Data Successfully');
  });

  getTopEventsOrganizer = asyncHandler(async (req, res) => {
    const { range } = req.query;
    const userId = req.user.id;
    const result = await this.services.getTopEvents(range, userId);
    res.sendCreated(result, 'Get Data Successfully');
  });

  getTakaEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const result = await this.services.getOrganizerEarnings(eventId);
    res.sendSuccess(result, 'event delete successfully');
  });

  getUsers = asyncHandler(async (req, res) => {
    const filterDTO = new filterUserDTO(req.query);
    const result = await this.services.getOrganizerData(filterDTO);
    res.sendSuccess(
      result.users,
      'event delete successfully',
      result.pagination,
    );
  });
}

module.exports = DashboardController;
