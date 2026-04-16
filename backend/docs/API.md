# API Documentation

Base URL: `http://localhost:5001/api`

## Authentication

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |

### Protected Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /auth/profile | Get current user profile |
| GET | /slots | Get all time slots |
| POST | /slots | Create time slot |
| PUT | /slots/:id | Update time slot |
| DELETE | /slots/:id | Delete time slot |
| POST | /scheduler/run | Run scheduler |
| GET | /scheduler/versions | Get timetable versions |
| GET | /scheduler/versions/:id | Get specific version |
| POST | /scheduler/generate | Generate timetable |
| POST | /scheduler/assign-classrooms | Assign classrooms |
| GET | /reschedule/requests | Get reschedule requests |
| POST | /reschedule/requests/:id/approve | Approve request |
| POST | /reschedule/requests/:id/reject | Reject request |
| POST | /course/drafts/upload | Upload course draft |
| GET | /course/drafts/files/list | List course files |

## Request/Response Formats

### Register
```json
POST /auth/register
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "admin" | "professor" | "student"
}
```

### Login
```json
POST /auth/login
{
  "email": "string",
  "password": "string"
}
```

### Response (Auth)
```json
{
  "success": true,
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "expiresIn": 900000
}
```

## Headers

Include Bearer token in Authorization header:
```
Authorization: Bearer <accessToken>
```