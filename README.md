# User Management System - Backend

REST API backend built with Node.js, Express.js, and PostgreSQL.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- Multer
- pg
- dotenv
- CORS

## Features

- User registration and login
- JWT authentication
- Password reset
- Role-based access control (Admin/User)
- User management
- Admin and User dashboards
- Server-side pagination, search, sorting and filtering
- Audit logging
- Profile picture upload and validation
- Location management
- Last login tracking
- Database indexing for optimized queries

## Main APIs

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- Password reset APIs

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Dashboard
- `GET /api/dashboard/admin` — Admin dashboard

### Audit Log
- `GET /api/audit-log`

### Locations
- `GET /api/locations/countries`
- `GET /api/locations/states/:countryId`
- `GET /api/locations/cities/:stateId`

## Database

PostgreSQL is used for storing users, locations, and audit logs.

Indexes are added for frequently searched, filtered and sorted user fields.

## Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

Run Locally
npm install
npm run dev

The server runs on:

http://localhost:5000
Phase 2 Additions
Role-based access control
Admin and User dashboards
Server-side pagination, search, sorting and filtering
Audit logging
Profile picture handling
Database indexing

