/**
 * Authentication and Authorization middleware
 * Handles JWT verification and role-based access control
 */
const { extractTokenFromHeader, verifyAccessToken } = require("../utils/jwt");
const { AppError } = require("./errorHandler");
const { prisma } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.sendUnauthorized("Access token is required");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`Authentication attempt with invalid user ID: ${decoded.id}`);
      return res.sendUnauthorized("User not found");
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    logger.debug(`User authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.originalUrl,
    });

    if (error.message.includes("expired")) {
      return res.sendUnauthorized("Token has expired");
    } else if (error.message.includes("invalid")) {
      return res.sendUnauthorized("Invalid token");
    }

    return res.sendUnauthorized("Authentication failed");
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided but doesn't fail if missing
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional authentication
    logger.debug(`Optional authentication failed: ${error.message}`);
    next();
  }
};

/**
 * Role-based authorization middleware factory
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendUnauthorized("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.originalUrl}`,
      );
      return res.sendForbidden(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      );
    }

    logger.debug(
      `Access authorized for ${req.user.email} (${req.user.role}) to ${req.originalUrl}`,
    );
    next();
  };
};

/**
 * Owner-based authorization middleware
 * Allows access if user is the owner of the resource or has admin role
 * @param {string} resourceIdParam - Name of the parameter containing resource owner ID
 * @returns {Function} Middleware function
 */
const authorizeOwner = (resourceIdParam = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendUnauthorized("Authentication required");
    }

    const resourceOwnerId = req.params[resourceIdParam];
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Admin can access everything
    if (userRole === "ADMIN") {
      return next();
    }

    // User can access their own resources
    if (currentUserId === resourceOwnerId) {
      return next();
    }

    logger.warn(
      `Unauthorized resource access attempt by ${req.user.email} for resource ${resourceOwnerId}`,
    );
    return res.sendForbidden(
      "Access denied. You can only access your own resources",
    );
  };
};

/**
 * Landlord property access middleware
 * Allows landlords to access only their properties
 */
const authorizeLandlordProperty = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendUnauthorized("Authentication required");
    }

    const { propertyId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Admin can access all properties
    if (userRole === "ADMIN") {
      return next();
    }

    // Landlords can only access their properties
    if (userRole === "LANDLORD") {
      const landlordProfile = await prisma.landlord.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!landlordProfile) {
        return res.sendForbidden("Landlord profile not found");
      }

      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          landlordId: landlordProfile.id,
        },
      });

      if (!property) {
        return res.sendForbidden("Property not found or access denied");
      }

      return next();
    }

    // Tenants need special handling based on their tenancy
    if (userRole === "TENANT") {
      const tenantProfile = await prisma.tenant.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!tenantProfile) {
        return res.sendForbidden("Tenant profile not found");
      }

      const tenancy = await prisma.tenancy.findFirst({
        where: {
          propertyId,
          tenantId: tenantProfile.id,
          status: "ACTIVE",
        },
      });

      if (!tenancy) {
        return res.sendForbidden("Property not found or access denied");
      }

      return next();
    }

    return res.sendForbidden("Access denied");
  } catch (error) {
    logger.error("Property authorization error:", error);
    return res.sendError("Authorization check failed");
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  authorizeOwner,
  authorizeLandlordProperty,
};
