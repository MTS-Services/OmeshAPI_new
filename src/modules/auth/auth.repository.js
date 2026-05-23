/**
 * Authentication Repository
 * Handles all database operations related to user authentication
 */
const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  status: true,
  emailVerified: true,
  gender: true,
  dateOfBirth: true,
  location: true,
  teamClub: true,
  joinedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

class AuthRepository {
  async findUserByEmail(email, includePassword = false) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          ...USER_SELECT,
          ...(includePassword ? { passwordHash: true } : {}),
        },
      });
      logger.debug(
        `User lookup by email ${email}: ${user ? 'found' : 'not found'}`,
      );
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findUserById(id, includeProfile = true, includePassword = false) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          ...USER_SELECT,
          ...(includePassword ? { passwordHash: true } : {}),
        },
      });
      return user;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const user = await prisma.user.create({
        data: userData,
        select: USER_SELECT,
      });

      if (userData.role === 'ORGANIZER') {
        await prisma.organizerProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      logger.info(
        `User created successfully: ${userData.email} (${userData.role})`,
      );
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: USER_SELECT,
      });
      logger.info(`User updated successfully: ${id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const {
        organizationName,
        bio,
        website,
        ...userData
      } = updateData;

      const finalUpdateData = { ...userData };

      if (
        organizationName !== undefined ||
        bio !== undefined ||
        website !== undefined
      ) {
        finalUpdateData.organizerProfile = {
          update: {
            organizationName,
            bio,
            website,
          },
        };
      }

      // 3. Execute update
      const user = await prisma.user.update({
        where: { id },
        data: finalUpdateData,
        include: {
          organizerProfile: true, // Profile data ko return mein include karein
        },
      });

      logger.info(`User and OrganizerProfile updated successfully: ${id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user and profile:', error);
      // Agar profile exist nahi karti toh update fail ho sakta hai,
      // us case mein 'upsert' use karna zyada safe hota hai agar zaroorat ho.
      throw error;
    }
  }

  async updatePassword(id, hashedPassword) {
    try {
      await prisma.user.update({
        where: { id },
        data: { passwordHash: hashedPassword },
      });
      logger.info(`Password updated successfully for user: ${id}`);
      return true;
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      logger.error('Error updating last login:', error);
    }
  }

  async deleteUser(id) {
    try {
      await prisma.user.delete({ where: { id } });
      logger.info(`User deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async checkEmailExists(email, excludeId = null) {
    try {
      const whereClause = { email: email.toLowerCase() };
      if (excludeId) {
        whereClause.NOT = { id: excludeId };
      }
      const user = await prisma.user.findFirst({
        where: whereClause,
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const stats = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      });
      const result = { total: 0, admin: 0, organizer: 0, user: 0 };
      stats.forEach((stat) => {
        result.total += stat._count.id;
        result[stat.role.toLowerCase()] = stat._count.id;
      });
      return result;
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  // ── OTP (password reset / email verification) ──────────────────

  async createOtpToken(data) {
    try {
      return await prisma.otpToken.create({ data });
    } catch (error) {
      logger.error('Error creating OTP token:', error);
      throw error;
    }
  }

  async findValidOtpToken(userId, purpose) {
    try {
      return await prisma.otpToken.findFirst({
        where: {
          userId,
          purpose,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error finding OTP token:', error);
      throw error;
    }
  }

  async markOtpTokenConsumed(id) {
    try {
      await prisma.otpToken.update({
        where: { id },
        data: { consumedAt: new Date() },
      });
      return true;
    } catch (error) {
      logger.error('Error consuming OTP token:', error);
      throw error;
    }
  }

  // ── Sessions (refresh tokens) ──────────────────────────────────

  async createSession(data) {
    try {
      return await prisma.session.create({ data });
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  async findSessionByRefreshToken(refreshToken) {
    try {
      return await prisma.session.findUnique({ where: { refreshToken } });
    } catch (error) {
      logger.error('Error finding session:', error);
      throw error;
    }
  }

  async revokeSession(refreshToken) {
    try {
      await prisma.session.update({
        where: { refreshToken },
        data: { revokedAt: new Date() },
      });
      return true;
    } catch (error) {
      logger.error('Error revoking session:', error);
      throw error;
    }
  }
}

module.exports = AuthRepository;
