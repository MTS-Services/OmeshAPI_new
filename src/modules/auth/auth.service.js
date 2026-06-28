/**
 * Authentication Service
 * Contains business logic for user authentication and authorization
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../../config');
const logger = require('../../utils/logger');
const { generateTokenPair, verifyRefreshToken } = require('../../utils/jwt');
const { AppError } = require('../../middlewares/errorHandler');
const AuthRepository = require('./auth.repository');
const { UserResponseDTO, AuthResponseDTO } = require('./auth.dto');
const EmailService = require('../../utils/email');

const emailService = new EmailService();

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(registerDTO) {
    try {
      const userData = registerDTO.toDatabase();

      const existingUser = await this.authRepository.findUserByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(
        userData.passwordHash,
        config.security.bcryptRounds,
      );
      userData.passwordHash = hashedPassword;

      const user = await this.authRepository.createUser(userData);
      const tokens = generateTokenPair(user);

      // Persist session
      await this.authRepository.createSession({
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const displayName = user.fullName || user.email;

      // Do not block registration success on email provider latency/failure.
      //     setImmediate(() => {
      //       emailService
      //         .sendMail(
      //           user.email,
      //           `Welcome to Endura Events, ${displayName}!`,
      //           `Welcome to Endura Events! We are excited to have you as a ${user.role}.`,
      //           `
      // <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0;">
      //   <h2 style="color: #333; text-align: center;">Welcome Aboard, ${displayName}! 🎉</h2>
      //   <p style="font-size: 16px; color: #555; line-height: 1.5;">
      //     Thank you for joining <strong>Endura Events</strong>. We are absolutely thrilled to have you onboard as an <strong>${user.role}</strong>.
      //   </p>
      //   <p style="font-size: 16px; color: #555; line-height: 1.5;">
      //     Our platform is built to make event management and participation seamless for you. Log in to your dashboard to get started!
      //   </p>

      //   <hr style="border: 0; border-top: 1px solid #eee;" />
      //   <p style="font-size: 12px; color: #999; text-align: center;">
      //     © 2026 Endura Events. All rights reserved. <br/>
      //     If you have any questions, feel free to contact our support team.
      //   </p>
      // </div>
      // `,
      //         )
      //         .catch((emailError) => {
      //           logger.warn(
      //             `Welcome email failed for ${user.email}: ${emailError.message}`,
      //           );
      //         });
      //     });

      if (user.role === 'ORGANIZER') {
        setImmediate(() => {
          emailService
            .sendMail(
              user.email,
              `Welcome to Endura Events, ${displayName}!`,
              `Welcome to Endura Events! Your organizer account has been successfully created.`,
              `
<div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
  
  <!-- Header / Logo Area -->
  <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 20px;">Welcome to Endura Events! 🎉</h2>
  
  <p style="font-size: 16px; color: #555; line-height: 1.5;">
    Hi <strong>${displayName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555; line-height: 1.5;">
    Your organizer account has been successfully created and is currently being prepared for activation. We are thrilled to have you on board!
  </p>

  <!-- Features Section -->
  <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #eaeaea; margin: 20px 0;">
    <h3 style="font-size: 16px; color: #222; margin-top: 0;">Through our platform, you'll be able to:</h3>
    <ul style="font-size: 15px; color: #555; line-height: 1.6; padding-left: 20px; margin-bottom: 0;">
      <li>Create and manage events</li>
      <li>Request Payments</li>
      <li>Track registrations in real time</li>
      <li>Access participant data</li>
      <li>Use promo codes</li>
      <li>Accept online payments</li>
      <li>Receive event support services</li>
      <li>Request quotations for bibs, medals, and merchandise</li>
    </ul>
  </div>

  <!-- Account Details & CTA -->
  <div style="text-align: center; margin: 25px 0;">
    <p style="font-size: 15px; color: #555; margin-bottom: 5px;"><strong>Login Email:</strong> ${user.email}</p>
    <a href="https://enduraevents.com/org" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 15px; margin-top: 10px;">Access Organizer Dashboard</a>
  </div>

  <p style="font-size: 16px; color: #555; line-height: 1.5;">
    Thank you for choosing Endura Events. We look forward to helping you create an amazing event experience.
  </p>

  <!-- Closing -->
  <p style="font-size: 15px; color: #555; line-height: 1.5; margin-top: 25px;">
    Best regards,<br/>
    <strong>Endura Sports Limited Traded as Endura Events.</strong><br/>
    <span style="font-size: 13px; color: #777;">Powered by Powerhouse</span>
  </p>

  <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
  
  <!-- Footer -->
  <p style="font-size: 12px; color: #999; text-align: center;">
    © 2026 Endura Events. All rights reserved. <br/>
    <a href="https://enduraevents.com" style="color: #007bff; text-decoration: none;">enduraevents.com</a> <br/>
    If you have any questions, feel free to contact our support team.
  </p>
</div>
`,
            )
            .catch((emailError) => {
              logger.warn(
                `Welcome email failed for ${user.email}: ${emailError.message}`,
              );
            });
        });
      }

      if (user.role === 'USER') {
        const firstName = (displayName || 'User').split(' ')[0];
        const loginLink = 'https://enduraevents.com/login';

        setImmediate(() => {
          emailService
            .sendMail(
              user.email,
              'Welcome to Endura Events',
              `Hi ${firstName},\n\nWelcome to Endura Events.\n\nYour account has been successfully created.\n\nYou can now:\n- Discover upcoming events\n- Register for races online\n- Access training plans\n- Manage your registrations\n- Track your event history\n- Build your athlete profile\n\nYour Account Details\nEmail: ${user.email}\nLogin Here: ${loginLink}\n\nWhether you're preparing for your first 5K or your next marathon, Endura Events is built to support your journey.\n\nBest regards,\nEndura Sports Limited Traded as Endura Events.\nPowered by Powerhouse\nenduraevents.com`,
              `
<div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
  <p style="font-size: 16px; margin: 0 0 18px 0;">Hi <strong>${firstName}</strong>,</p>

  <p style="font-size: 16px; margin: 0 0 16px 0;">Welcome to <strong>Endura Events</strong>.</p>

  <p style="font-size: 16px; margin: 0 0 16px 0;">Your account has been successfully created.</p>

  <p style="font-size: 16px; margin: 0 0 10px 0;">You can now:</p>
  <ul style="font-size: 16px; line-height: 1.7; margin-top: 0; padding-left: 22px;">
    <li>Discover upcoming events</li>
    <li>Register for races online</li>
    <li>Access training plans</li>
    <li>Manage your registrations</li>
    <li>Track your event history</li>
    <li>Build your athlete profile</li>
  </ul>

  <hr style="border: 0; border-top: 1px solid #e6e6e6; margin: 22px 0;" />

  <h3 style="font-size: 20px; margin: 0 0 12px 0;">Your Account Details</h3>
  <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>Email:</strong> ${user.email}</p>
  <p style="font-size: 16px; margin: 0 0 20px 0;"><strong>Login Here:</strong> <a href="${loginLink}" style="color: #1d6fd6; text-decoration: none;">${loginLink}</a></p>

  <hr style="border: 0; border-top: 1px solid #e6e6e6; margin: 22px 0;" />

  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
    Whether you're preparing for your first 5K or your next marathon, Endura Events is built to support your journey.
  </p>

  <p style="font-size: 16px; line-height: 1.8; margin: 0;">
    Best regards,<br/>
    Endura Sports Limited Traded as Endura Events.<br/>
    Powered by Powerhouse
  </p>

  <p style="font-size: 16px; margin-top: 18px; margin-bottom: 0;">
    <a href="https://enduraevents.com" style="color: #1d6fd6; text-decoration: none;">enduraevents.com</a>
  </p>
</div>
`,
            )
            .catch((emailError) => {
              logger.warn(
                `Welcome email failed for ${user.email}: ${emailError.message}`,
              );
            });
        });
      }

      logger.info(`User registered successfully: ${user.email} (${user.role})`);
      return new AuthResponseDTO(user, tokens);
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  async login(loginDTO) {
    try {
      const user = await this.authRepository.findUserByEmail(
        loginDTO.email,
        true,
      );
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      if (user.isDeleted) {
        throw new AppError('Account has been deleted', 403);
      }

      const isPasswordValid = await bcrypt.compare(
        loginDTO.password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        logger.warn(`Failed login attempt for email: ${loginDTO.email}`);
        throw new AppError('Invalid email or password', 401);
      }

      delete user.passwordHash;

      const tokens = generateTokenPair(user);

      // Persist session and update lastLoginAt in parallel
      await Promise.all([
        this.authRepository.createSession({
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
        this.authRepository.updateLastLogin(user.id),
      ]);

      logger.info(`User logged in successfully: ${user.email} (${user.role})`);
      return new AuthResponseDTO(user, tokens);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshTokenDTO) {
    try {
      const decoded = verifyRefreshToken(refreshTokenDTO.refreshToken);

      // Ensure session is still valid (not revoked)
      const session = await this.authRepository.findSessionByRefreshToken(
        refreshTokenDTO.refreshToken,
      );
      if (!session || session.revokedAt) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      const user = await this.authRepository.findUserById(decoded.id, false);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Rotate: revoke old session, create new one
      const tokens = generateTokenPair(user);
      await Promise.all([
        this.authRepository.revokeSession(refreshTokenDTO.refreshToken),
        this.authRepository.createSession({
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      ]);

      logger.debug(`Tokens refreshed for user: ${user.email}`);
      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      if (
        error.message.includes('expired') ||
        error.message.includes('invalid')
      ) {
        throw new AppError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  }

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await this.authRepository.revokeSession(refreshToken);
      }
      return true;
    } catch (error) {
      // Silently ignore if session not found
      logger.debug(
        'Logout session revoke failed (already revoked or not found)',
      );
      return true;
    }
  }

  async changePassword(userId, changePasswordDTO) {
    try {
      const user = await this.authRepository.findUserById(userId, false, true);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDTO.currentPassword,
        user.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      const hashedNewPassword = await bcrypt.hash(
        changePasswordDTO.newPassword,
        config.security.bcryptRounds,
      );

      await this.authRepository.updatePassword(userId, hashedNewPassword);
      logger.info(`Password changed successfully for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return new UserResponseDTO(user);
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateProfileDTO) {
    try {
      const updateData = updateProfileDTO.getUpdateData();

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', 400);
      }

      const user = await this.authRepository.updateUser(userId, updateData);
      logger.info(`Profile updated successfully for user: ${userId}`);
      return new UserResponseDTO(user);
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  }

  async deleteAccount(userId) {
    try {
      await this.authRepository.deleteUser(userId);
      logger.info(`Account deleted successfully: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Account deletion failed:', error);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDTO) {
    try {
      const user = await this.authRepository.findUserByEmail(
        forgotPasswordDTO.email,
      );
      if (!user) {
        // Avoid user enumeration
        logger.debug(
          `Forgot password for non-existent email: ${forgotPasswordDTO.email}`,
        );
        return { message: 'If that email exists, a reset code has been sent.' };
      }

      // const plainCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const plainCode = crypto.randomInt(100000, 999999).toString();
      const codeHash = await bcrypt.hash(plainCode, 10);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.authRepository.createOtpToken({
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        codeHash,
        expiresAt,
      });

      // In production, send plainCode via email instead of returning it

      await emailService.sendMail(
        forgotPasswordDTO.email,
        'Endura Events Password Reset OTP',
        `Hi ${user.fullName || 'User'},\n\nWe received a request to reset your Endura Events password.\n\nYour OTP code is: ${plainCode}\n\nThis OTP will expire in 60 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nEndura Sports Limited Traded as Endura Events.\nPowered by Powerhouse\nenduraevents.com`,
        `
      <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; color: #333;">
        <h2 style="margin-top: 0; margin-bottom: 12px; color: #1a1a1a;">Password Reset OTP</h2>

        <p style="font-size: 16px; margin: 0 0 14px 0;">Hi <strong>${user.fullName || 'User'}</strong>,</p>

        <p style="font-size: 16px; margin: 0 0 12px 0;">
          We received a request to reset your Endura Events password.
        </p>

        <p style="font-size: 16px; margin: 0 0 8px 0;">Use the OTP below to continue:</p>

        <div style="margin: 16px 0 18px 0; padding: 14px 18px; background: #ffffff; border: 1px dashed #1d6fd6; border-radius: 8px; text-align: center;">
          <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #1d6fd6;">${plainCode}</span>
        </div>

        <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">This OTP will expire in <strong>2 minutes</strong>.</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 18px 0;">If you did not request this, please ignore this email.</p>

        <hr style="border: 0; border-top: 1px solid #e6e6e6; margin: 18px 0;" />

        <p style="font-size: 15px; line-height: 1.7; margin: 0;">
          Best regards,<br/>
          Endura Sports Limited Traded as Endura Events.<br/>
          Powered by Powerhouse
        </p>

        <p style="font-size: 15px; margin-top: 14px; margin-bottom: 0;">
          <a href="https://enduraevents.com" style="color: #1d6fd6; text-decoration: none;">enduraevents.com</a>
        </p>
      </div>
    `,
      );

      logger.info(`Password reset code generated for: ${user.email}`);
      return { message: 'Reset code generated', code: plainCode };
    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  }

  async validOtp(resetPasswordDTO) {
    try {
      const user = await this.authRepository.findUserByEmail(
        resetPasswordDTO.email,
      );
      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const otpToken = await this.authRepository.findValidOtpToken(
        user.id,
        'PASSWORD_RESET',
      );
      if (!otpToken) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const isCodeValid = await bcrypt.compare(
        resetPasswordDTO.token,
        otpToken.codeHash,
      );
      if (!isCodeValid) {
        throw new AppError('Invalid or expired reset token', 400);
      }
      return resetPasswordDTO;
    } catch (error) {
      logger.error('Reset password failed:', error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDTO) {
    try {
      const user = await this.authRepository.findUserByEmail(
        resetPasswordDTO.email,
      );
      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const otpToken = await this.authRepository.findValidOtpToken(
        user.id,
        'PASSWORD_RESET',
      );
      if (!otpToken) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const isCodeValid = await bcrypt.compare(
        resetPasswordDTO.token,
        otpToken.codeHash,
      );
      if (!isCodeValid) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      const hashedPassword = await bcrypt.hash(
        resetPasswordDTO.password,
        config.security.bcryptRounds,
      );

      await Promise.all([
        this.authRepository.updatePassword(user.id, hashedPassword),
        this.authRepository.markOtpTokenConsumed(otpToken.id),
      ]);

      logger.info(`Password reset successfully for: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Reset password failed:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      return await this.authRepository.getUserStats();
    } catch (error) {
      logger.error('Get user stats failed:', error);
      throw error;
    }
  }

  validateUserAccess(userId, resourceOwnerId, userRole) {
    if (userRole === 'ADMIN') return true;
    if (userId === resourceOwnerId) return true;
    return false;
  }
}

module.exports = AuthService;
