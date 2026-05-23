# McCann & Curran Property Management API

A comprehensive, production-ready backend API for property management operations built with Node.js, Express, Prisma ORM, and PostgreSQL.

## 🏗️ Architecture Overview

This API follows **Clean Architecture** principles with strict separation of concerns:

- **📁 Interface Layer**: Controllers, Routes, DTOs, Middlewares
- **🔧 Business Logic Layer**: Services (no business logic in controllers)
- **💾 Data Access Layer**: Repositories (using Repository pattern)
- **🛡️ Cross-cutting Concerns**: Authentication, Authorization, Validation, Logging, Error Handling

### 🎯 Key Features

- ✅ **JWT Authentication** with Access + Refresh token strategy
- ✅ **Role-based Authorization** (Admin, Landlord, Tenant)
- ✅ **Dependency Injection** pattern
- ✅ **Repository Pattern** for database abstraction
- ✅ **Centralized Error Handling** with consistent responses
- ✅ **Global Response Formatter** for API consistency
- ✅ **Production-ready Logging** (Winston)
- ✅ **Environment-based Configuration** with validation
- ✅ **Request Validation** (Joi schemas)
- ✅ **Rate Limiting** and Security middleware
- ✅ **Health Check** endpoints
- ✅ **Graceful Shutdown** handling

## 📋 Requirements

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 12.0 or higher
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd property-management-api

# Install dependencies
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/property_management"
JWT_SECRET="your-super-secure-jwt-secret-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run prisma:seed

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app.js                      # Express app configuration
├── server.js                   # Server entry point with graceful shutdown
├──📁 config/
│   ├── index.js               # Environment-based configuration
│   └── database.js            # Prisma client setup
├── 📁 middlewares/
│   ├── auth.js                # Authentication & authorization
│   ├── errorHandler.js        # Global error handling
│   └── responseFormatter.js   # Response formatting
├── 📁 utils/
│   ├── apiResponse.js         # Response helpers
│   ├── jwt.js                 # JWT utilities
│   └── logger.js              # Winston logger setup
├── 📁 validators/
│   ├── auth.validator.js      # Authentication validation schemas
│   └── common.validator.js    # Reusable validation patterns
├── 📁 routes/
│   └── index.js               # Main API routes consolidation
└── 📁 modules/
    ├── 📁 auth/               # Authentication module
    │   ├── auth.controller.js
    │   ├── auth.dto.js
    │   ├── auth.repository.js
    │   ├── auth.routes.js
    │   ├── auth.service.js
    │   └── auth.test.http
    └── 📁 user/               # User management module
        ├── user.controller.js
        ├── user.dto.js
        ├── user.repository.js
        ├── user.routes.js
        ├── user.service.js
        └── user.test.http
```

## 📚 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/register` | Register new user | Public |
| `POST` | `/login` | User login | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `POST` | `/logout` | User logout | Private |
| `GET` | `/me` | Get current user | Private |
| `GET` | `/profile` | Get user profile | Private |
| `PUT` | `/profile` | Update profile | Private |
| `POST` | `/change-password` | Change password | Private |
| `DELETE` | `/account` | Delete account | Private |
| `GET` | `/stats` | User statistics | Admin |

### 👥 User Management (`/api/v1/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | List users with pagination | Admin |
| `GET` | `/search` | Search users | Admin |
| `GET` | `/role/:role` | Get users by role | Admin |
| `POST` | `/` | Create new user | Admin |
| `GET` | `/:id` | Get user details | Admin |
| `PUT` | `/:id` | Update user | Admin |
| `DELETE` | `/:id` | Delete user | Admin |
| `POST` | `/bulk-action` | Bulk operations | Admin |
| `GET` | `/me/dashboard` | Current user dashboard | Private |
| `GET` | `/:id/analytics` | User analytics | Admin/Own |

### 🏠 Additional Modules (Structure Ready)

The following modules follow the same pattern and can be implemented:

- **Properties** (`/api/v1/properties`) - Property management
- **Tenancies** (`/api/v1/tenancies`) - Tenancy relationships
- **Maintenance** (`/api/v1/maintenance`) - Maintenance requests
- **Documents** (`/api/v1/documents`) - Document management
- **Conversations** (`/api/v1/conversations`) - Messaging system
- **Payments** (`/api/v1/payments`) - Rent payment tracking
- **Reports** (`/api/v1/reports`) - Analytics and reporting

## 🛡️ Authentication Flow

### Registration & Login
```bash
# 1. Register new user
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "LANDLORD"
}

# 2. Login to get tokens
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

# Response includes access + refresh tokens
{
  "success": true,
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "tokenType": "Bearer",
      "expiresIn": "15m"
    }
  }
}
```

### Making Authenticated Requests
```bash
# Include Bearer token in Authorization header
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:3000/api/v1/auth/profile
```

### Token Refresh
```bash
# When access token expires, use refresh token
POST /api/v1/auth/refresh
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 👨‍💼 User Roles & Permissions

### 🔧 Admin
- Full CRUD access to all resources
- User management capabilities
- System statistics and reporting
- Audit log access

### 🏠 Landlord  
- Manage their own properties
- View associated tenants and tenancies
- Access property documents and maintenance
- Communicate with tenants and admin

### 🏘️ Tenant
- View their current property details
- Submit maintenance requests  
- Access lease documents and statements
- Make rent payments and view history
- Communicate with landlord and admin

## 📋 Testing

### HTTP Test Files

Each module includes `.test.http` files for manual API testing with VS Code REST Client extension:

- `src/modules/auth/auth.test.http` - Authentication endpoints
- `src/modules/user/user.test.http` - User management endpoints

### Sample Test Request

```http
### Login as admin
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@mccannandcurran.ie",
  "password": "AdminPassword123!"
}

### Get all users (requires admin token)
GET http://localhost:3000/api/v1/users?page=1&limit=10
Authorization: Bearer {{accessToken}}
```

## 🔍 API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "statusCode": 200,
  "timestamp": "2024-03-02T10:30:00.000Z",
  "data": { ... },
  "meta": { 
    "pagination": { ... }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-03-02T10:30:00.000Z",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

## 🔒 Security Features

- **🔐 JWT Authentication** with secure token generation
- **🛡️ Password Hashing** using bcrypt with configurable rounds
- **🚫 Rate Limiting** to prevent abuse
- **🔍 Input Validation** with Joi schemas
- **🛡️ Helmet.js** security headers
- **🌐 CORS** configuration for cross-origin requests
- **📝 Audit Logging** for security events
- **⚡ Graceful Error Handling** without information leakage

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="long-secure-random-string"
JWT_REFRESH_SECRET="another-long-secure-random-string"
ALLOWED_ORIGINS="https://yourdomain.com"
LOG_LEVEL=warn
```

### Database Migration

```bash
# Deploy database changes
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Process Management

Use PM2 or similar for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name "property-api"

# Monitor
pm2 monit

# View logs
pm2 logs property-api
```

### Health Checks

Monitor application health:
- `GET /health` - Basic health check
- `GET /api/v1/health` - Detailed API health
- `GET /api/v1/docs` - API documentation

## 🐛 Error Handling

The API uses centralized error handling with:

### Custom Error Classes
```javascript
const { AppError } = require('./middlewares/errorHandler');

// Throw operational errors
throw new AppError('Resource not found', 404);
throw new AppError('Validation failed', 422, validationErrors);
```

### Automatic Error Handling
- **Prisma Errors** - Database constraint violations, not found errors
- **JWT Errors** - Token validation and expiration
- **Validation Errors** - Joi schema validation failures  
- **File Upload Errors** - Multer file size and type errors

## 📊 Logging

Production-ready logging with Winston:

- **Development**: Colorized console output with stack traces
- **Production**: JSON format with file rotation
- **Audit Logging**: User actions and security events
- **Request Logging**: HTTP request/response logging

Log files (production):
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs

## 🤝 Contributing

1. Follow the existing folder structure and patterns
2. Each new module should include: DTO, Repository, Service, Controller, Routes, Tests
3. Use TypeScript-style JSDoc comments for better documentation
4. Add appropriate validation schemas
5. Include comprehensive error handling
6. Add audit logging for sensitive operations

## 📞 Support

For questions and support:
- **Email**: support@mccannandcurran.ie
- **Documentation**: Check the `src/modules/*/test.http` files for API examples

---

**McCann & Curran Property Management Platform** - Built with ❤️ using Node.js, Express, Prisma, and PostgreSQL# rpr2011_2500_api
# OmeshAPI
