
---

# Backend — `README.md`

```markdown
# User Management System - Backend

REST API backend for the User Management System built with Node.js, Express, and PostgreSQL.

The backend provides authentication, user registration, location management, password reset, user management, and protected APIs.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- bcrypt
- JSON Web Token (JWT)
- dotenv
- CORS
- Nodemon

---

## Features

### Authentication

- User Registration
- User Login
- JWT authentication
- Protected APIs
- Logout handled through frontend token removal

### Password Security

- Password hashing using bcrypt
- Password validation
- Forgot Password flow
- Reset password token generation
- Token hashing before storing in database
- Token expiration
- One-time password reset token
- Reset token invalidation after successful password reset

### User Management

- Get all users
- Get user details
- Update user
- Delete user
- Reset user password

### Location Management

Location data is stored in PostgreSQL.

Available APIs:

```text
GET /api/locations/countries

GET /api/locations/states/:countryId

GET /api/locations/cities/:stateId