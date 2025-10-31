# Syncrow Test API

A NestJS-based REST API with WebSocket support, featuring JWT authentication, device management, and real-time communication capabilities.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 📡 **WebSocket Support** - Real-time bidirectional communication with JWT authentication
- 📦 **Device Management** - CRUD operations for device entities with pagination
- 🗄️ **PostgreSQL Database** - TypeORM for database operations
- ✅ **Input Validation** - Custom validators including unique field validation
- 🔒 **Role-Based Access Control** - Admin and user roles with guards
- 📄 **Pagination** - Efficient data pagination for list endpoints
- 🛡️ **Exception Filtering** - Global exception handling with consistent error responses
- 🔐 **Security Features** - CORS

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens) with Passport
- **WebSocket**: Socket.IO
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt, CSRF protection

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation  

1. Clone the repository:
```bash
git clone <repository-url>
cd syncrow-test
```


2. Create a `.env` file in the root directory:
```env
# Application
PORT=3000
APP_ENV=development

# Database
DB_HOST=localhost # or localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=syncrow
DB_SSL=false

# JWT
JWT_ACCESS_TOKEN_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRATION_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRATION_DAYS=7

# CORS
CORS_ENABLED=true
```

3. RUN THE APPLICATION:
```bash
# Using Docker Compose
docker-compose up -d 

```




The API will be available at `http://localhost:3000/api/v1`


```
4. SEED
```bash
npm run db:seed
```


## TESTING

```bash
npm run test
npm run test:e2e

```


## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login and get JWT tokens
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

- `POST /api/v1/auth/refresh` - Refresh access token (Requires JWT)
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

- `POST /api/v1/auth/logout` - Logout (Requires JWT)
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

### Devices (Requires JWT)

- `GET /api/v1/devices` - Get all devices (paginated)
  - Query parameters: `?page=1&limit=10`
  
- `GET /api/v1/devices/:id` - Get device by ID

- `POST /api/v1/devices` - Create new device
  ```json
  {
    "name": "Device Name",
    "type": "sensor",
    "location": "Room 101"
  }
  ```

- `PUT /api/v1/devices/:id` - Update device

- `DELETE /api/v1/devices/:id` - Delete device (Admin only)

## WebSocket Connection

The WebSocket server supports real-time communication with JWT authentication.

### Connection Methods

**Option 1: Token in auth object** (Recommended)
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-access-token'
  }
});
```

**Option 2: Token in query parameter**
```javascript
const socket = io('http://localhost:3000?token=your-jwt-access-token');
```

**Option 3: Token in Authorization header**
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-access-token'
  }
});
```

### WebSocket Events

- **Connect**: Automatically joins user to `user:{userId}` and `devices` rooms
- **Message Events**:
  - `message` - Send/receive messages
  - `ping` - Send ping, receive `pong` response
  - `DEVICE_CREATED` - Emitted when a device is created
  - `DEVICE_UPDATED` - Emitted when a device is updated
  - `DEVICE_DELETED` - Emitted when a device is deleted

### Example Usage

```javascript
// Connect
const socket = io('http://localhost:3000', {
  auth: { token: accessToken }
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('DEVICE_CREATED', (data) => {
  console.log('New device:', data);
});

// Send message
socket.emit('message', { message: 'Hello Server!' });
```

## Database Seeding

Default users are created during seeding:
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `mohammad`, password: `password123`

Run seeding:
```bash
npm run db:seed
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run db:seed` - Seed the database
- `npm run db:seed:prod` - Seed database (production)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests


## Project Structure

```
src/
├── auth/           # Authentication module
├── device/         # Device management module
├── websocket/      # WebSocket gateway
├── config/         # Configuration
├── db/             # Database setup and seeds
├── shared/         # Shared utilities, filters, decorators
└── setup/          # Application setup functions
└── test/          # Application test config and e2e test

```

## License

UNLICENSED
