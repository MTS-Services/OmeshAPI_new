# 📮 Postman Collection - Property Management API

This folder contains Postman collection and environment files for testing the Property Management API.

## 📁 Files Included

### 1. `Property_Management_API.postman_collection.json`
Complete Postman collection with all API endpoints organized by modules.

### 2. `Property_Management_Development.postman_environment.json`
Environment variables file for development testing.

## 🚀 Quick Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Drag and drop `Property_Management_API.postman_collection.json`
4. Collection will appear in your Collections tab

### Step 2: Import Environment
1. Click **Import** button again
2. Drag and drop `Property_Management_Development.postman_environment.json`
3. Select the environment from the dropdown (top-right corner)

### Step 3: Start Testing
1. Ensure your API server is running on `http://localhost:3001`
2. Start with **System & Health** → **API Health Check**
3. Then **Authentication** → **Register User** → **Login User**
4. Access token will be automatically saved for protected endpoints

## 📚 Collection Structure

### 🔧 System & Health
- Root Health Check
- API Health Check
- API Documentation

### 🔐 Authentication
- Register User
- Login User (saves tokens automatically)
- Get User Profile
- Refresh Token
- Forgot Password
- Logout

### 👥 User Management
- Get All Users (Admin only)
- Get User by ID
- Update User Profile
- Update User Role (Admin only)
- Deactivate User (Admin only)

### 🏠 Properties (Coming Soon)
- Get Properties
- Create Property

### 📋 Tenancies (Coming Soon)
- Get Tenancies

### 🛠️ Maintenance (Coming Soon)
- Get Maintenance Requests
- Submit Maintenance Request

### ❌ Error Testing
- Test 404 Error
- Test Unauthorized Access

## 🔑 Authentication Flow

1. **Register** → Creates new user account
2. **Login** → Returns access & refresh tokens
3. **Protected Endpoints** → Automatically use saved access token
4. **Refresh Token** → Get new access token when expired
5. **Logout** → Clear tokens and end session

## 🧪 Test Features

- **Automatic token management** - Login saves tokens for other requests
- **Response validation** - Tests verify response structure and data
- **Error handling** - Tests verify proper error responses
- **Pre-request scripts** - Auto-configure environment variables
- **Global tests** - Check response times and JSON structure

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API server URL | `http://localhost:3001` |
| `testEmail` | Test user email | `test.user@example.com` |
| `testPassword` | Test user password | `TestPassword123!` |
| `accessToken` | JWT access token | Auto-set after login |
| `refreshToken` | JWT refresh token | Auto-set after login |
| `userId` | Current user ID | Auto-set after login |

## 🔄 Testing Workflow

### Recommended Testing Order:
1. **Health Check** - Verify server is running
2. **API Documentation** - Check endpoints are documented
3. **User Registration** - Create test account
4. **User Login** - Get authentication tokens
5. **Profile Access** - Test protected endpoints
6. **User Management** - Test admin functions
7. **Error Handling** - Verify error responses

### For Admin Testing:
1. Register with admin credentials
2. Test user management endpoints
3. Test role assignments
4. Test user deactivation

## 📊 Response Format

All endpoints return consistent JSON format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "statusCode": 200,
  "timestamp": "2026-03-03T00:00:00.000Z",
  "data": { ... }
}
```

## 🛠️ Troubleshooting

### Common Issues:

**401 Unauthorized**
- Run Login request first to get access token
- Check if token expired (run Refresh Token)

**Connection Error**
- Verify API server is running on correct port
- Check `baseUrl` in environment matches server URL

**404 Not Found**
- Some endpoints are "Coming Soon" (not implemented yet)
- Verify endpoint URL is correct

### Server Not Running:
```bash
cd api_repr2011
npm start
```

Server should start on `http://localhost:3001`

## 🚀 Next Steps

1. Import both files into Postman
2. Set the environment to "Property Management Development"
3. Start with health checks
4. Register and login a test user
5. Explore all available endpoints
6. Check out the comprehensive API documentation at `/api/v1/docs`

Happy testing! 🎉