/**
 * User Management Repository
 * Handles database operations for user management (separate from auth)
 */
const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

class UserRepository {
  /**
   * @method getAllUsers
   * Get paginated list of users with filters
   * @param {UserFilterDTO} filterDTO - Filter parameters
   * @returns {Object} Users list with metadata
   */
  async getAllUsers(filterDTO) {
    try {
      const { limit, search, role, sortBy, sortOrder } = filterDTO;
      const offset = filterDTO.getOffset();

      // Build where clause
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      // Build order clause
      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      // Execute queries
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            landlordProfile: {
              select: {
                id: true,
                properties: {
                  select: { id: true },
                },
              },
            },
            tenantProfile: {
              select: {
                id: true,
                status: true,
                tenancies: {
                  where: { status: 'ACTIVE' },
                  select: {
                    id: true,
                    property: {
                      select: {
                        id: true,
                        name: true,
                        address: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.user.count({
          where: whereClause,
        }),
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * @method getUserById
   * Get detailed user information by ID
   * @param {string} id - User ID
   * @returns {Object|null} User object with full details
   */
  async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          landlordProfile: {
            include: {
              properties: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  status: true,
                },
              },
              tenancies: {
                select: {
                  id: true,
                  status: true,
                  startDate: true,
                  endDate: true,
                  property: {
                    select: {
                      name: true,
                      address: true,
                    },
                  },
                },
              },
            },
          },
          tenantProfile: {
            include: {
              tenancies: {
                select: {
                  id: true,
                  status: true,
                  startDate: true,
                  endDate: true,
                  rent: true,
                  property: {
                    select: {
                      id: true,
                      name: true,
                      address: true,
                    },
                  },
                },
              },
              maintenanceRequests: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  createdAt: true,
                },
              },
              rentPayments: {
                select: {
                  id: true,
                  amount: true,
                  status: true,
                  month: true,
                  dueDate: true,
                },
              },
            },
          },
          uploadedDocuments: {
            select: {
              id: true,
              name: true,
              type: true,
              createdAt: true,
            },
          },
          sentMessages: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          auditLogs: {
            select: {
              id: true,
              action: true,
              createdAt: true,
            },
          },
          conversations: {
            select: {
              id: true,
              conversation: {
                select: {
                  id: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * @method createUser
   * Create a new user (admin function)
   * @param {Object} userData - User data
   * @param {Object} profileData - Role-specific profile data
   * @returns {Object} Created user
   */
  async createUser(userData, profileData = {}) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create base user
        const user = await tx.user.create({
          data: userData,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            ppsNumber: true,
            avatar: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Create role-specific profile
        if (
          userData.role === 'LANDLORD' &&
          Object.keys(profileData).length > 0
        ) {
          await tx.landlord.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
        } else if (
          userData.role === 'TENANT' &&
          Object.keys(profileData).length > 0
        ) {
          await tx.tenant.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
        }

        return user;
      });

      logger.info(
        `User created by admin: ${userData.email} (${userData.role})`,
      );
      return result;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * @method updateUser
   * Update user information (admin function)
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(id, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          ppsNumber: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User updated by admin: ${id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async updateOrganizeProfile(id, updateData) {
    try {
      const user = await prisma.organizerProfile.update({
        where: { userId: id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          ppsNumber: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User updated by admin: ${id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async getOrganizeProfile(id) {
    try {
      const user = await prisma.organizerProfile.findUnique({
        where: { userId: id },
      });

      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async getOrganizeProfile(id) {
    try {
      const user = await prisma.organizerProfile.findUnique({
        where: { userId: id },
      });

      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * @method deleteUser
   * Delete user (admin function)
   * @param {string} id - User ID
   * @returns {boolean} Success status
   */
  async deleteUser(id) {
    try {
      // Note: Cascade deletes will handle related records
      await prisma.user.delete({
        where: { id },
      });

      logger.info(`User deleted by admin: ${id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * @method getUsersByRole
   * Get users by role
   * @param {string} role - User role
   * @param {number} limit - Limit results
   * @returns {Array} Users array
   */
  async getUsersByRole(role, limit = 50) {
    try {
      const users = await prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return users;
    } catch (error) {
      logger.error('Error getting users by role:', error);
      throw error;
    }
  }

  /**
   * @method searchUsers
   * Search users by text
   * @param {string} searchTerm - Search term
   * @param {number} limit - Limit results
   * @returns {Array} Users array
   */
  async searchUsers(searchTerm, limit = 20) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
        take: limit,
        orderBy: { name: 'asc' },
      });

      return users;
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * @method bulkUpdateUsers
   * Bulk update multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} updateData - Data to update
   * @returns {Object} Update result
   */
  async bulkUpdateUsers(userIds, updateData) {
    try {
      const result = await prisma.user.updateMany({
        where: {
          id: {
            in: userIds,
          },
        },
        data: updateData,
      });

      logger.info(`Bulk updated ${result.count} users`);
      return result;
    } catch (error) {
      logger.error('Error bulk updating users:', error);
      throw error;
    }
  }

  /**
   * @method bulkDeleteUsers
   * Bulk delete multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Object} Delete result
   */
  async bulkDeleteUsers(userIds) {
    try {
      const result = await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });

      logger.info(`Bulk deleted ${result.count} users`);
      return result;
    } catch (error) {
      logger.error('Error bulk deleting users:', error);
      throw error;
    }
  }

  /**
   * @method getUserDashboardStats
   * Get dashboard statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} User dashboard stats
   */
  async getUserDashboardStats(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          landlordProfile: {
            include: {
              properties: true,
              tenancies: true,
            },
          },
          tenantProfile: {
            include: {
              tenancies: true,
              maintenanceRequests: true,
              rentPayments: true,
            },
          },
          uploadedDocuments: true,
          sentMessages: true,
        },
      });

      if (!user) return null;

      const stats = {
        role: user.role,
        joinDate: user.createdAt,
        documentsUploaded: user.uploadedDocuments.length,
        messagesSent: user.sentMessages.length,
      };

      if (user.landlordProfile) {
        stats.propertiesManaged = user.landlordProfile.properties.length;
        stats.totalTenancies = user.landlordProfile.tenancies.length;
        stats.activeTenancies = user.landlordProfile.tenancies.filter(
          (t) => t.status === 'ACTIVE',
        ).length;
      }

      if (user.tenantProfile) {
        stats.currentTenancy = user.tenantProfile.tenancies.find(
          (t) => t.status === 'ACTIVE',
        );
        stats.maintenanceRequests =
          user.tenantProfile.maintenanceRequests.length;
        stats.pendingPayments = user.tenantProfile.rentPayments.filter(
          (p) => p.status === 'PENDING',
        ).length;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting user dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = UserRepository;
