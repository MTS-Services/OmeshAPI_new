/**
 * JWT utility for handling access and refresh tokens
 * Implements secure token generation, verification, and refresh strategy
 */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config");
const logger = require("./logger");

/**
 * Generate access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        type: "access",
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.accessExpire,
        issuer: "property-management-api",
        audience: "property-management-client",
      },
    );

    return token;
  } catch (error) {
    logger.error("Error generating access token:", error);
    throw new Error("Token generation failed");
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        type: "refresh",
        jti: crypto.randomBytes(8).toString("hex"),
      },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpire,
        issuer: "property-management-api",
        audience: "property-management-client",
      },
    );

    return token;
  } catch (error) {
    logger.error("Error generating refresh token:", error);
    throw new Error("Refresh token generation failed");
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} payload - User data
 * @returns {Object} Token pair object
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.jwt.accessExpire,
  };
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: "property-management-api",
      audience: "property-management-client",
    });

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }

    logger.error("Access token verification failed:", error);
    throw new Error("Token verification failed");
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: "property-management-api",
      audience: "property-management-client",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }

    logger.error("Refresh token verification failed:", error);
    throw new Error("Refresh token verification failed");
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {number|null} Expiration timestamp
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded ? decoded.exp : null;
  } catch (error) {
    logger.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
  const exp = getTokenExpiration(token);
  if (!exp) return true;

  return Date.now() >= exp * 1000;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  getTokenExpiration,
  isTokenExpired,
};
