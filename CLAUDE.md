# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm start           # Start production server
```

### Testing
```bash
npm test            # Run unit tests
npm run test:e2e    # Run end-to-end tests
node ace test       # Alternative: run tests using ACE CLI
```

### Code Quality
```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues in app/, start/, tests/ directories
npm run format      # Format code with Prettier
npm run typecheck   # TypeScript type checking
```

### Database & Migrations
```bash
node ace migration:run      # Run database migrations
node ace migration:rollback # Rollback last migration
node ace db:seed           # Seed the database
```

### Docker
```bash
docker-compose up --build  # Build and run with PostgreSQL
npm run docker            # Run migrations, seed, and start server (for Docker container)
```

## Architecture Overview

This is a modular AdonisJS v6 API with authentication and role-based access control. The codebase follows a clean architecture pattern with clear separation of concerns.

### Module Structure
The application is organized into feature modules under `app/modules/`:
- **user/**: User authentication, management, and JWT handling
- **role/**: Role-based access control and permissions
- **file/**: File upload and storage management
- **health/**: Health check endpoints

Each module typically contains:
- `models/`: Lucid ORM models
- `controllers/`: HTTP request handlers
- `services/`: Business logic layer
- `repositories/`: Data access layer
- `validators/`: Request validation schemas
- `routes.ts`: Module-specific routes

### Authentication System
Multiple authentication guards are configured in `config/auth.ts`:
- **jwt** (default): Custom JWT implementation with 1-hour expiry
- **api**: Database-stored access tokens
- **web**: Session-based authentication
- **basic**: HTTP Basic Authentication

### Database Architecture
- Uses PostgreSQL with Lucid ORM
- Snake_case naming strategy for database columns
- Soft deletes implemented on User model
- Many-to-many relationship between Users and Roles via user_roles pivot table

### Key Services Pattern
Services handle business logic and are injected via AdonisJS IoC container:
```typescript
// Example: app/modules/user/services/sign_in.ts
export default class SignInService {
  async handle(signInDto: SignInDTO): Promise<SignInResponse> {
    // Business logic here
  }
}
```

### Testing Approach
- Uses Japa test runner with AdonisJS integration
- Tests organized by type: unit, functional, e2e
- Test files use `.spec.ts` extension
- API testing via Japa's API client plugin

### Environment Configuration
- Copy `.env.example` to `.env` for local development
- JWT_SECRET must be set for authentication
- Database connection configured for PostgreSQL
- Multiple storage drivers supported (S3, GCS, R2, etc.)

### Route Organization
Routes are modular and imported in `start/routes.ts`:
- Authentication routes: `/sessions/*`
- User management: `/users/*`
- Role management: `/roles/*` (admin only)
- File operations: `/files/*`
- Health checks: `/health/*`

### Important Conventions
- Use snake_case for database columns, camelCase for code
- Soft deletes are handled automatically via Lucid scopes
- All DTOs use class-based structure for type safety
- Services return standardized response objects
- Repository pattern for complex database queries