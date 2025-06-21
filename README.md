<h1 align="center">
  <img src=".github/assets/images/img1.png" height="200" alt="acl">
</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/gabrielmaialva33/base-acl-api?color=00b8d3?style=flat&logo=appveyor" alt="License" />
  <img src="https://img.shields.io/github/languages/top/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub top language" >
  <img src="https://img.shields.io/github/languages/count/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub language count" >
  <img src="https://img.shields.io/github/repo-size/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="Repository size" >
  <img src="https://wakatime.com/badge/user/e61842d0-c588-4586-96a3-f0448a434be4/project/b0347a5f-cacf-486d-bd2d-b91d3e6cb570.svg?style=flat&logo=appveyor" alt="Wakatime" >
  <a href="https://github.com/gabrielmaialva33/base-acl-api/commits/master">
    <img src="https://img.shields.io/github/last-commit/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub last commit" >
    <img src="https://img.shields.io/badge/made%20by-Maia-15c3d6?style=flat&logo=appveyor" alt="Maia" >  
  </a>
</p>

<br>

<p align="center">
    <a href="README.md">English</a>
    ·
    <a href="README-pt.md">Portuguese</a>
</p>

<p align="center">
  <a href="#bookmark-about">About</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#computer-technologies">Technologies</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#wrench-tools">Tools</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#package-installation">Installation</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-license">License</a>
</p>

<br>

## :bookmark: About

**Base ACL** is a modular access control list API built with AdonisJS v6 that provides a robust foundation for
authentication and role-based access control. The API follows clean architecture principles with clear separation of
concerns and is designed to serve as a base for multiple projects.

### 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Apps]
        MOB[Mobile Apps]
        API[External APIs]
    end

    subgraph "API Gateway - v1"
        ROUTES["/api/v1/*"]
        MW[Middleware Stack]
    end

    subgraph "Modules"
        AUTH[Auth Module<br/>JWT, Sessions]
        USER[User Module<br/>CRUD, Profile]
        ROLE[Role Module<br/>RBAC, Hierarchy]
        PERM[Permission Module<br/>Context-aware, Inheritance]
        FILE[File Module<br/>Upload, Storage]
        AUDIT[Audit Module<br/>Logging, Analytics]
        HEALTH[Health Module<br/>Status, Monitoring]
    end

    subgraph "Core Services"
        JWT[JWT Service]
        HASH[Hash Service]
        VALIDATOR[Validator Service]
        STORAGE[Storage Service]
    end

    subgraph "Data Layer"
        TS[(TimescaleDB<br/>Main Database + Time-series)]
        REDIS[(Redis<br/>Cache & Sessions)]
        PGREST[PostgREST<br/>Auto-generated REST API]
    end

    WEB --> ROUTES
    MOB --> ROUTES
    API --> ROUTES

    ROUTES --> MW
    MW --> AUTH
    MW --> USER
    MW --> ROLE
    MW --> PERM
    MW --> FILE
    MW --> AUDIT
    MW --> HEALTH

    AUTH --> JWT
    AUTH --> HASH
    USER --> VALIDATOR
    FILE --> STORAGE
    PERM --> REDIS
    AUDIT --> TS

    USER --> TS
    ROLE --> TS
    PERM --> TS
    AUTH --> TS
    AUTH --> REDIS
    AUDIT --> TS

    TS --> PGREST

    style ROUTES fill:#4A90E2
    style TS fill:#336791
    style REDIS fill:#DC382D
    style PGREST fill:#008080
```

### 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant AUTH as Auth Module
    participant JWT as JWT Service
    participant DB as TimescaleDB
    participant REDIS as Redis Cache

    C->>API: POST /api/v1/sessions/sign-in
    API->>AUTH: Validate credentials
    AUTH->>DB: Find user by email
    DB-->>AUTH: User data
    AUTH->>AUTH: Verify password hash
    AUTH->>JWT: Generate tokens
    JWT-->>AUTH: Access & Refresh tokens
    AUTH->>REDIS: Store session
    AUTH-->>C: Return tokens + user data

    Note over C,API: Subsequent requests

    C->>API: GET /api/v1/users (Bearer token)
    API->>AUTH: Validate JWT
    AUTH->>REDIS: Check session
    REDIS-->>AUTH: Session valid
    AUTH-->>API: User authenticated
    API-->>C: Return protected resource
```

### 📁 Module Structure

```mermaid
graph TD
    subgraph "Application Structure"
        APP[app/]
        MODULES[modules/]

        subgraph "User Module"
            USER_M[user/]
            USER_CTRL[controllers/]
            USER_SVC[services/]
            USER_REPO[repositories/]
            USER_MODEL[models/]
            USER_VAL[validators/]
            USER_ROUTES[routes/]
        end

        subgraph "Role Module"
            ROLE_M[role/]
            ROLE_CTRL[controllers/]
            ROLE_SVC[services/]
            ROLE_MODEL[models/]
            ROLE_ROUTES[routes/]
        end

        subgraph "File Module"
            FILE_M[file/]
            FILE_CTRL[controllers/]
            FILE_SVC[services/]
            FILE_ROUTES[routes/]
        end

        subgraph "Health Module"
            HEALTH_M[health/]
            HEALTH_CTRL[controllers/]
            HEALTH_ROUTES[routes/]
        end
    end

    APP --> MODULES
    MODULES --> USER_M
    MODULES --> ROLE_M
    MODULES --> FILE_M
    MODULES --> HEALTH_M

    USER_M --> USER_CTRL
    USER_M --> USER_SVC
    USER_M --> USER_REPO
    USER_M --> USER_MODEL
    USER_M --> USER_VAL
    USER_M --> USER_ROUTES

    ROLE_M --> ROLE_CTRL
    ROLE_M --> ROLE_SVC
    ROLE_M --> ROLE_MODEL
    ROLE_M --> ROLE_ROUTES

    FILE_M --> FILE_CTRL
    FILE_M --> FILE_SVC
    FILE_M --> FILE_ROUTES

    HEALTH_M --> HEALTH_CTRL
    HEALTH_M --> HEALTH_ROUTES
```

## 🌟 Key Features

### Core Features

- **🔐 JWT Authentication**: Secure token-based authentication with refresh tokens
- **👥 Role-Based Access Control**: Fine-grained permissions with ROOT, ADMIN, USER, EDITOR, and GUEST roles
- **📁 Modular Architecture**: Clean separation of concerns with feature modules
- **🗄️ TimescaleDB**: PostgreSQL + time-series data capabilities
- **🚀 RESTful API**: Well-structured endpoints following REST principles
- **📤 File Uploads**: Secure file handling with multiple storage drivers
- **🏥 Health Monitoring**: Built-in health check endpoints
- **🔒 Security First**: Password hashing, CORS, rate limiting ready
- **📝 Request Validation**: DTOs with runtime validation
- **🌐 i18n Ready**: Internationalization support built-in
- **🔗 PostgREST Integration**: Auto-generated REST API for direct database access
- **📊 Time-series Support**: Built on TimescaleDB for analytics and metrics

### Advanced ACL Features

- **🎯 Context-Aware Permissions**: Support for `own`, `any`, `team`, and `department` contexts
- **🔄 Permission Inheritance**: Automatic permission inheritance through role hierarchy
- **📋 Comprehensive Audit Trail**: Track all permission checks and access attempts
- **⚡ Redis-Cached Permissions**: High-performance permission checking with intelligent caching
- **🏢 Resource Ownership**: Built-in ownership system supporting team and department contexts
- **🔍 Granular Permission Control**: Resource + Action + Context based permission system

### Database Schema

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : has
    USERS ||--o{ USER_PERMISSIONS : has
    USERS ||--o{ FILES : uploads
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ USER_PERMISSIONS : has
    USERS ||--o{ AUDIT_LOGS : generates

    USERS {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string username UK
        string password
        string avatar_url
        boolean is_online
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        bigint id PK
        string name
        string slug UK
        string description
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        bigint id PK
        string name UK
        string resource
        string action
        string context
        string description
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        bigint id PK
        bigint user_id FK
        bigint role_id FK
        timestamp created_at
        timestamp updated_at
    }

    ROLE_PERMISSIONS {
        bigint id PK
        bigint role_id FK
        bigint permission_id FK
        timestamp created_at
        timestamp updated_at
    }

    USER_PERMISSIONS {
        bigint id PK
        bigint user_id FK
        bigint permission_id FK
        boolean granted
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK
        string resource
        string action
        string context
        bigint resource_id
        string result
        string reason
        string ip_address
        string user_agent
        json metadata
        timestamp created_at
    }

    FILES {
        bigint id PK
        bigint owner_id FK
        string client_name
        string file_name
        bigint file_size
        string file_type
        string file_category
        string url
        timestamp created_at
        timestamp updated_at
    }
```

<br>

## :computer: Technologies

- **[Typescript](https://www.typescriptlang.org/)**
- **[Node.js](https://nodejs.org/)**
- **[AdonisJS](https://adonisjs.com/)**
- **[TimescaleDB](https://www.timescale.com/)** - PostgreSQL for time-series
- **[Redis](https://redis.io/)** - In-memory data store
- **[PostgREST](https://postgrest.org/)** - Auto-generated REST API
- **[Docker](https://www.docker.com/)**

<br>

## :wrench: Tools

- **[WebStorm](https://www.jetbrains.com/webstorm/)**
- **[Insomnia](https://insomnia.rest/)**
- **[DataGrip](https://www.jetbrains.com/datagrip/)**

<br>

## :package: Installation

### :heavy_check_mark: **Prerequisites**

The following software must be installed:

- **[Node.js](https://nodejs.org/en/)**
- **[Git](https://git-scm.com/)**
- **[NPM](https://www.npmjs.com/)** or **[Yarn](https://yarnpkg.com/)**
- **[PostgreSQL](https://www.postgresql.org/download/)** or **[Docker](https://www.docker.com/get-started/)**

<br>

### :arrow_down: **Cloning the repository**

```sh
  $ git clone https://github.com/gabrielmaialva33/base-acl-api.git
```

<br>

### :arrow_forward: **Running the application**

- :package: API

```sh
  $ cd base-acl-api
  # Dependencies install.
  $ yarn # or npm install
  # Config environment system
  $ cp .env.example .env
  # Data base creation.
  $ node ace migration:run # or docker-compose up --build
  # API start
  $ node ace serve --watch # or yarn dev or npm dev
```

<br>

## :twisted_rightwards_arrows: API Routes

The API is versioned and all endpoints are prefixed with `/api/v1/`. Below is the complete route structure:

### 🛣️ Route Organization

```mermaid
graph LR
    subgraph "Public Routes"
        HOME[GET /]
        HEALTH[GET /api/v1/health]
        SIGNIN[POST /api/v1/sessions/sign-in]
        SIGNUP[POST /api/v1/sessions/sign-up]
    end

    subgraph "Protected Routes"
        subgraph "User Routes"
            USER_LIST[GET /api/v1/users]
            USER_GET[GET /api/v1/users/:id]
            USER_CREATE[POST /api/v1/users]
            USER_UPDATE[PUT /api/v1/users/:id]
            USER_DELETE[DELETE /api/v1/users/:id]
        end

        subgraph "Admin Routes"
            ROLE_LIST[GET /api/v1/admin/roles]
            ROLE_ATTACH[PUT /api/v1/admin/roles/attach]
        end

        subgraph "File Routes"
            FILE_UPLOAD[POST /api/v1/files/upload]
        end
    end

    style HOME fill:#90EE90
    style HEALTH fill:#90EE90
    style SIGNIN fill:#90EE90
    style SIGNUP fill:#90EE90
    style ROLE_LIST fill:#FFB6C1
    style ROLE_ATTACH fill:#FFB6C1
```

### 📋 Route Details

| Method     | Endpoint                               | Description                  | Auth Required | Permission/Role     |
| ---------- | -------------------------------------- | ---------------------------- | ------------- | ------------------- |
| **GET**    | `/`                                    | API information              | ❌            | -                   |
| **GET**    | `/api/v1/health`                       | Health check                 | ❌            | -                   |
| **POST**   | `/api/v1/sessions/sign-in`             | User login                   | ❌            | -                   |
| **POST**   | `/api/v1/sessions/sign-up`             | User registration            | ❌            | -                   |
| **GET**    | `/api/v1/me`                           | Get current user profile     | ✅            | -                   |
| **GET**    | `/api/v1/me/permissions`               | Get current user permissions | ✅            | -                   |
| **GET**    | `/api/v1/me/roles`                     | Get current user roles       | ✅            | -                   |
| **GET**    | `/api/v1/users`                        | List users (paginated)       | ✅            | users.list          |
| **GET**    | `/api/v1/users/:id`                    | Get user by ID               | ✅            | users.read          |
| **POST**   | `/api/v1/users`                        | Create user                  | ✅            | users.create        |
| **PUT**    | `/api/v1/users/:id`                    | Update user                  | ✅            | users.update        |
| **DELETE** | `/api/v1/users/:id`                    | Delete user                  | ✅            | users.delete        |
| **GET**    | `/api/v1/admin/roles`                  | List roles                   | ✅            | ROOT, ADMIN         |
| **PUT**    | `/api/v1/admin/roles/attach`           | Attach role to user          | ✅            | ROOT, ADMIN         |
| **GET**    | `/api/v1/admin/permissions`            | List permissions             | ✅            | permissions.list    |
| **POST**   | `/api/v1/admin/permissions`            | Create permission            | ✅            | permissions.create  |
| **PUT**    | `/api/v1/admin/roles/permissions/sync` | Sync role permissions        | ✅            | permissions.update  |
| **POST**   | `/api/v1/files/upload`                 | Upload file                  | ✅            | files.create        |

### 🔄 Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Middleware
    participant Controller
    participant Service
    participant Repository
    participant Database

    Client->>Router: HTTP Request
    Router->>Middleware: Route Match

    alt Protected Route
        Middleware->>Middleware: Auth Check
        Middleware->>Middleware: ACL Check
    end

    Middleware->>Controller: Request Validated
    Controller->>Service: Business Logic
    Service->>Repository: Data Access
    Repository->>Database: Query
    Database-->>Repository: Result
    Repository-->>Service: Entity/DTO
    Service-->>Controller: Response Data
    Controller-->>Client: HTTP Response
```

### 🔐 Permission System

The advanced permission system supports context-aware access control:

```mermaid
graph TD
    subgraph "Permission Structure"
        P[Permission]
        P --> R[Resource]
        P --> A[Action]
        P --> C[Context]
        
        R --> |examples| R1[users]
        R --> |examples| R2[files]
        R --> |examples| R3[permissions]
        
        A --> |examples| A1[create]
        A --> |examples| A2[read]
        A --> |examples| A3[update]
        A --> |examples| A4[delete]
        A --> |examples| A5[list]
        
        C --> |examples| C1[own - Own resources only]
        C --> |examples| C2[any - Any resource]
        C --> |examples| C3[team - Team resources]
        C --> |examples| C4[department - Department resources]
    end
```

#### Role Hierarchy & Inheritance

```
ROOT
├── ADMIN (inherits all ROOT permissions)
│   ├── USER (inherits basic ADMIN permissions)
│   │   └── GUEST (inherits limited USER permissions)
│   └── EDITOR (inherits content ADMIN permissions)
       └── USER (inherits from EDITOR)
```

#### Context Examples

- `users.update.own` - Can only update own profile
- `users.update.any` - Can update any user
- `files.delete.team` - Can delete files from team members
- `reports.read.department` - Can read reports from own department

### 📥 Postman Collection

Get the complete API collection for
Postman: [Download](https://raw.githubusercontent.com/gabrielmaialva33/base-acl-api/master/docs/openapi.yaml)

## :memo: License

This project is under the **MIT** license. [MIT](./LICENSE) ❤️

Liked? Leave a little star to help the project ⭐

<br>

<p align="center">
  <img src="https://raw.githubusercontent.com/gabrielmaialva33/gabrielmaialva33/master/assets/gray0_ctp_on_line.svg?sanitize=true" />
</p>

<p align="center">
  &copy; 2017-present <a href="https://github.com/gabrielmaialva33/" target="_blank">Maia</a>
</p>
