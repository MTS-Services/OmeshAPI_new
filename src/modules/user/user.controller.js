/**
 * User Management Controller
 * Handles HTTP requests for user management operations
 */
const { asyncHandler } = require('../../middlewares/errorHandler');
const UserService = require('./user.service');
const {
  UserFilterDTO,
  CreateUserDTO,
  UpdateUserDTO,
  BulkActionDTO,
} = require('./user.dto');
const logger = require('../../utils/logger');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * @method GET /api/v1/users
   * Get paginated list of users with filters
   * @example GET /api/v1/users?page=1&limit=10&search=john&role=LANDLORD&sortBy=createdAt&sortOrder=desc
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const filterDTO = new UserFilterDTO(req.query);
    const result = await this.userService.getAllUsers(filterDTO);

    logger.audit(req.user.id, 'Users List', 'Fetched users list', {
      filters: filterDTO,
      count: result.users.length,
      ip: req.ip,
    });

    res.sendList(
      result.users,
      result.pagination.currentPage,
      result.pagination.itemsPerPage,
      result.pagination.totalItems,
      'Users retrieved successfully',
    );
  });

  /**
   * @method GET /api/v1/users/:id
   * Get detailed user information by ID
   * @example GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000
   */
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.userService.getUserById(id);

    logger.audit(req.user.id, 'User Detail', `Fetched user: ${id}`, {
      targetUser: id,
      ip: req.ip,
    });

    res.sendSuccess(result, 'User details retrieved successfully');
  });

  getOrganizerProfileById = asyncHandler(async (req, res) => {
    const id = req.user.id;
    const result = await this.userService.getOrganizerProfileById(id);
    res.sendSuccess(result, 'User details retrieved successfully');
  });

  /**
   * @method POST /api/v1/users
   * Create a new user (admin only)
   * @example POST /api/v1/users
   */
  createUser = asyncHandler(async (req, res) => {
    const createUserDTO = new CreateUserDTO(req.body);
    const result = await this.userService.createUser(createUserDTO);

    logger.audit(
      req.user.id,
      'User Creation',
      `Created user: ${createUserDTO.email}`,
      {
        newUser: {
          email: createUserDTO.email,
          role: createUserDTO.role,
        },
        ip: req.ip,
      },
    );

    res.sendCreated(result, 'User created successfully');
  });

  /**
   * @method PUT /api/v1/users/:id
   * Update user information (admin only)
   * @example PUT /api/v1/users/123e4567-e89b-12d3-a456-426614174000
   */
  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateUserDTO = new UpdateUserDTO(req.body);
    const result = await this.userService.updateUser(id, updateUserDTO);

    logger.audit(req.user.id, 'User Update', `Updated user: ${id}`, {
      targetUser: id,
      updates: Object.keys(updateUserDTO.getUpdateData()),
      ip: req.ip,
    });

    res.sendSuccess(result, 'User updated successfully');
  });

  /**
   * @method DELETE /api/v1/users/:id
   * Delete user (admin only)
   * @example DELETE /api/v1/users/123e4567-e89b-12d3-a456-426614174000
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log('=============================:', id);

    // Prevent self-deletion
    // if (req.user.id === id) {
    //   return res.sendBadRequest('You cannot delete your own account');
    // }

    await this.userService.deleteUser(id);

    // logger.audit(req.user.id, 'User Deletion', `Deleted user: ${id}`, {
    //   targetUser: id,
    //   ip: req.ip,
    // });

    res.sendSuccess(null, 'User deleted successfully');
  });

  /**
   * @method GET /api/v1/users/role/:role
   * Get users by role
   * @example GET /api/v1/users/role/LANDLORD?limit=50
   */
  getUsersByRole = asyncHandler(async (req, res) => {
    const { role } = req.params;
    const { limit } = req.query;

    const users = await this.userService.getUsersByRole(
      role,
      parseInt(limit) || 50,
    );

    res.sendSuccess(
      users,
      `${role.toLowerCase()} users retrieved successfully`,
    );
  });

  /**
   * @method GET /api/v1/users/search
   * Search users by text
   * @example GET /api/v1/users/search?q=john&limit=20
   */
  searchUsers = asyncHandler(async (req, res) => {
    const { q: searchTerm, limit } = req.query;

    if (!searchTerm) {
      return res.sendBadRequest('Search term is required');
    }

    const users = await this.userService.searchUsers(
      searchTerm,
      parseInt(limit) || 20,
    );

    res.sendSuccess(users, 'User search completed successfully');
  });

  /**
   * @method POST /api/v1/users/bulk-action
   * Perform bulk actions on users (admin only)
   * @example POST /api/v1/users/bulk-action
   */
  bulkAction = asyncHandler(async (req, res) => {
    const bulkActionDTO = new BulkActionDTO(req.body);

    // Prevent self-action for destructive operations
    if (
      ['delete'].includes(bulkActionDTO.action) &&
      bulkActionDTO.userIds.includes(req.user.id)
    ) {
      return res.sendBadRequest(
        'You cannot perform this action on your own account',
      );
    }

    const result = await this.userService.bulkAction(bulkActionDTO);

    logger.audit(
      req.user.id,
      'Bulk User Action',
      `${bulkActionDTO.action} on ${bulkActionDTO.userIds.length} users`,
      {
        action: bulkActionDTO.action,
        targetUsers: bulkActionDTO.userIds,
        params: bulkActionDTO.params,
        result: result,
        ip: req.ip,
      },
    );

    res.sendSuccess(
      result,
      `Bulk ${bulkActionDTO.action} completed successfully`,
    );
  });

  /**
   * @method GET /api/v1/users/:id/dashboard
   * Get dashboard statistics for a user
   * @example GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000/dashboard
   */
  getUserDashboardStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can view their own dashboard or admins can view any
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.sendForbidden('You can only view your own dashboard');
    }

    const stats = await this.userService.getUserDashboardStats(id);

    res.sendSuccess(stats, 'User dashboard statistics retrieved successfully');
  });

  /**
   * @method GET /api/v1/users/:id/analytics
   * Get user analytics and insights
   * @example GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000/analytics
   */
  getUserAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can view their own analytics or admins can view any
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.sendForbidden('You can only view your own analytics');
    }

    const analytics = await this.userService.getUserAnalytics(id);

    res.sendSuccess(analytics, 'User analytics retrieved successfully');
  });

  /**
   * @method GET /api/v1/users/me/dashboard
   * Get current user's dashboard statistics
   * @example GET /api/v1/users/me/dashboard
   */
  getMyDashboard = asyncHandler(async (req, res) => {
    const stats = await this.userService.getUserDashboardStats(req.user.id);

    res.sendSuccess(stats, 'Your dashboard statistics retrieved successfully');
  });

  /**
   * @method GET /api/v1/users/me/analytics
   * Get current user's analytics
   * @example GET /api/v1/users/me/analytics
   */
  getMyAnalytics = asyncHandler(async (req, res) => {
    const analytics = await this.userService.getUserAnalytics(req.user.id);

    res.sendSuccess(analytics, 'Your analytics retrieved successfully');
  });
}

module.exports = UserController;
