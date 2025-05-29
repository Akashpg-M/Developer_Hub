# Authentication System

A complete authentication system built with Node.js, Express, TypeScript, and PostgreSQL. Supports both JWT-based authentication and OAuth 2.0 (Google and GitHub).

## Features

- JWT-based authentication with access and refresh tokens
- OAuth 2.0 integration with Google and GitHub
- Password hashing with bcrypt
- PostgreSQL database with TypeORM
- TypeScript support
- Input validation
- Error handling
- Token refresh mechanism
- Protected routes

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Google OAuth 2.0 credentials
- GitHub OAuth credentials

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=auth_system

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

4. Create the PostgreSQL database:
```bash
createdb auth_system
```

5. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`

- `POST /auth/login` - Login with email and password
  - Body: `{ "email": "string", "password": "string" }`

- `POST /auth/refresh-token` - Get new access token using refresh token
  - Body: `{ "refreshToken": "string" }`

- `POST /auth/logout` - Logout user (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

- `GET /auth/me` - Get current user info (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

### OAuth

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback URL

- `GET /auth/github` - Initiate GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback URL

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens with expiration
- Refresh token rotation
- Input validation
- CORS enabled
- Helmet security headers
- Rate limiting (optional)

## Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT 