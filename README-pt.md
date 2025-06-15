<h1 align="center">
  <img src=".github/assets/images/img1.png" height="200" alt="acl">
</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/gabrielmaialva33/base-acl-api?color=00b8d3?style=flat&logo=appveyor" alt="License" />
  <img src="https://img.shields.io/github/languages/top/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub top language" >
  <img src="https://img.shields.io/github/languages/count/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub language count" >
  <img src="https://img.shields.io/github/repo-size/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="Repository size" >
  <img src="https://wakatime.com/badge/user/e61842d0-c588-4586-96a3-f0448a434be4/project/b0347a5f-cacf-486d-bd2d-b91d3e6cb570.svg?style=flat&logo=appveyor" alt="Wakatime" >
  <a href="https://github.com/gabrielmaialva33/base-rbac-api/commits/master">
    <img src="https://img.shields.io/github/last-commit/gabrielmaialva33/base-acl-api?style=flat&logo=appveyor" alt="GitHub last commit" >
    <img src="https://img.shields.io/badge/feito%20por-Maia-15c3d6?style=flat&logo=appveyor" alt="Maia" >
  </a>
</p>

<br>

<p align="center">
    <a href="README.md">English</a>
    ·
    <a href="README-pt.md">Portuguese</a>
</p>

<p align="center">
  <a href="#bookmark-about">Sobre</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#computer-technologies">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#wrench-tools">Ferramentas</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#package-installation">Instalação</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-license">Licença</a>
</p>

<br>

## :bookmark: Sobre

**Base ACL** é uma API modular de controle de acesso construída com AdonisJS v6 que fornece uma base robusta para
autenticação e controle de acesso baseado em papéis. A API segue princípios de arquitetura limpa com clara separação de
responsabilidades e foi projetada para servir como base para múltiplos projetos.

### 🏗️ Visão Geral da Arquitetura

```mermaid
graph TB
    subgraph "Camada Cliente"
        WEB[Aplicações Web]
        MOB[Aplicações Mobile]
        API[APIs Externas]
    end
    
    subgraph "Gateway API - v1"
        ROUTES["/api/v1/*"]
        MW[Stack de Middleware]
    end
    
    subgraph "Módulos"
        AUTH[Módulo Auth<br/>JWT, Sessões]
        USER[Módulo Usuário<br/>CRUD, Perfil]
        ROLE[Módulo Papel<br/>RBAC, Permissões]
        FILE[Módulo Arquivo<br/>Upload, Armazenamento]
        HEALTH[Módulo Saúde<br/>Status, Monitoramento]
    end
    
    subgraph "Serviços Core"
        JWT[Serviço JWT]
        HASH[Serviço Hash]
        VALIDATOR[Serviço Validador]
        STORAGE[Serviço Armazenamento]
    end
    
    subgraph "Camada de Dados"
        TS[(TimescaleDB<br/>Banco Principal + Séries Temporais)]
        REDIS[(Redis<br/>Cache & Sessões)]
        PGREST[PostgREST<br/>API REST Auto-gerada]
    end
    
    WEB --> ROUTES
    MOB --> ROUTES
    API --> ROUTES
    
    ROUTES --> MW
    MW --> AUTH
    MW --> USER
    MW --> ROLE
    MW --> FILE
    MW --> HEALTH
    
    AUTH --> JWT
    AUTH --> HASH
    USER --> VALIDATOR
    FILE --> STORAGE
    
    USER --> TS
    ROLE --> TS
    AUTH --> TS
    AUTH --> REDIS
    
    TS --> PGREST
    
    style ROUTES fill:#4A90E2
    style TS fill:#336791
    style REDIS fill:#DC382D
    style PGREST fill:#008080
```

### 🔐 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as Gateway API
    participant AUTH as Módulo Auth
    participant JWT as Serviço JWT
    participant DB as TimescaleDB
    participant REDIS as Cache Redis
    
    C->>API: POST /api/v1/sessions/sign-in
    API->>AUTH: Validar credenciais
    AUTH->>DB: Buscar usuário por email
    DB-->>AUTH: Dados do usuário
    AUTH->>AUTH: Verificar hash da senha
    AUTH->>JWT: Gerar tokens
    JWT-->>AUTH: Tokens de acesso & refresh
    AUTH->>REDIS: Armazenar sessão
    AUTH-->>C: Retornar tokens + dados do usuário
    
    Note over C,API: Requisições subsequentes
    
    C->>API: GET /api/v1/users (Bearer token)
    API->>AUTH: Validar JWT
    AUTH->>REDIS: Verificar sessão
    REDIS-->>AUTH: Sessão válida
    AUTH-->>API: Usuário autenticado
    API-->>C: Retornar recurso protegido
```

### 📁 Estrutura Modular

```mermaid
graph TD
    subgraph "Estrutura da Aplicação"
        APP[app/]
        MODULES[modules/]
        
        subgraph "Módulo Usuário"
            USER_M[user/]
            USER_CTRL[controllers/]
            USER_SVC[services/]
            USER_REPO[repositories/]
            USER_MODEL[models/]
            USER_VAL[validators/]
            USER_ROUTES[routes/]
        end
        
        subgraph "Módulo Papel"
            ROLE_M[role/]
            ROLE_CTRL[controllers/]
            ROLE_SVC[services/]
            ROLE_MODEL[models/]
            ROLE_ROUTES[routes/]
        end
        
        subgraph "Módulo Arquivo"
            FILE_M[file/]
            FILE_CTRL[controllers/]
            FILE_SVC[services/]
            FILE_ROUTES[routes/]
        end
        
        subgraph "Módulo Saúde"
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

## 🌟 Principais Funcionalidades

### Funcionalidades Core

- **🔐 Autenticação JWT**: Autenticação segura baseada em tokens com refresh tokens
- **👥 Controle de Acesso Baseado em Papéis**: Permissões refinadas com papéis ROOT, ADMIN e USER
- **📁 Arquitetura Modular**: Clara separação de responsabilidades com módulos de funcionalidades
- **🗄️ TimescaleDB**: PostgreSQL + capacidades de séries temporais
- **🚀 API RESTful**: Endpoints bem estruturados seguindo princípios REST
- **📤 Upload de Arquivos**: Manipulação segura de arquivos com múltiplos drivers de armazenamento
- **🏥 Monitoramento de Saúde**: Endpoints integrados para verificação de saúde
- **🔒 Segurança em Primeiro Lugar**: Hash de senhas, CORS, rate limiting pronto
- **📝 Validação de Requisições**: DTOs com validação em tempo de execução
- **🌐 Pronto para i18n**: Suporte a internacionalização integrado
- **🔗 Integração PostgREST**: API REST auto-gerada para acesso direto ao banco
- **📊 Suporte a Séries Temporais**: Construído sobre TimescaleDB para análises e métricas

### Esquema do Banco de Dados

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : possui
    ROLES ||--o{ USER_ROLES : possui
    USERS ||--o{ FILES : envia
    
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
    
    USER_ROLES {
        bigint id PK
        bigint user_id FK
        bigint role_id FK
        timestamp created_at
        timestamp updated_at
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

## :computer: Tecnologias

- **[Typescript](https://www.typescriptlang.org/)**
- **[Node.js](https://nodejs.org/)**
- **[AdonisJS](https://adonisjs.com/)**
- **[TimescaleDB](https://www.timescale.com/)** - PostgreSQL para séries temporais
- **[Redis](https://redis.io/)** - Armazenamento de dados em memória
- **[PostgREST](https://postgrest.org/)** - API REST auto-gerada
- **[Docker](https://www.docker.com/)**

<br>

## :wrench: Ferramentas

- **[WebStorm](https://www.jetbrains.com/webstorm/)**
- **[Insomnia](https://insomnia.rest/)**
- **[DataGrip](https://www.jetbrains.com/datagrip/)**

<br>

## :package: Instalação

### :heavy_check_mark: **Pré-requisitos**

Os seguintes softwares devem estar instalados:

- **[Node.js](https://nodejs.org/en/)**
- **[Git](https://git-scm.com/)**
- **[NPM](https://www.npmjs.com/)** or **[Yarn](https://yarnpkg.com/)**
- **[PostgreSQL](https://www.postgresql.org/download/)** or **[Docker](https://www.docker.com/get-started/)**

<br>

### :arrow_down: **Clonando o repositório**

```sh
  $ git clone https://github.com/gabrielmaialva33/base-acl-api.git
```

<br>

### :arrow_forward: **Rodando o backend**

- :package: API

```sh
  $ cd base-acl-api
  # Instalação de dependências.
  $ yarn # ou npm install
  # Configuração ambiente de sistema
  $ cp .env.example .env
  # Criação de banco de dados.
  $ node ace migration:run # ou docker-compose up --build
  # Iniciar API
  $ node ace serve --watch # ou yarn start ou npm dev
```

<br>

## :twisted_rightwards_arrows: Rotas da API

A API é versionada e todos os endpoints são prefixados com `/api/v1/`. Abaixo está a estrutura completa de rotas:

### 🛣️ Organização das Rotas

```mermaid
graph LR
    subgraph "Rotas Públicas"
        HOME[GET /]
        HEALTH[GET /api/v1/health]
        SIGNIN[POST /api/v1/sessions/sign-in]
        SIGNUP[POST /api/v1/sessions/sign-up]
    end
    
    subgraph "Rotas Protegidas"
        subgraph "Rotas de Usuário"
            USER_LIST[GET /api/v1/users]
            USER_GET[GET /api/v1/users/:id]
            USER_CREATE[POST /api/v1/users]
            USER_UPDATE[PUT /api/v1/users/:id]
            USER_DELETE[DELETE /api/v1/users/:id]
        end
        
        subgraph "Rotas Admin"
            ROLE_LIST[GET /api/v1/admin/roles]
            ROLE_ATTACH[PUT /api/v1/admin/roles/attach]
        end
        
        subgraph "Rotas de Arquivo"
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

### 📋 Detalhes das Rotas

| Método     | Endpoint                     | Descrição                  | Auth Obrigatória | Papéis      |
|------------|------------------------------|----------------------------|------------------|-------------|
| **GET**    | `/`                          | Informações da API         | ❌                | -           |
| **GET**    | `/api/v1/health`             | Verificação de saúde       | ❌                | -           |
| **POST**   | `/api/v1/sessions/sign-in`   | Login de usuário           | ❌                | -           |
| **POST**   | `/api/v1/sessions/sign-up`   | Registro de usuário        | ❌                | -           |
| **GET**    | `/api/v1/users`              | Listar usuários (paginado) | ✅                | USER        |
| **GET**    | `/api/v1/users/:id`          | Obter usuário por ID       | ✅                | USER        |
| **POST**   | `/api/v1/users`              | Criar usuário              | ✅                | USER        |
| **PUT**    | `/api/v1/users/:id`          | Atualizar usuário          | ✅                | USER        |
| **DELETE** | `/api/v1/users/:id`          | Deletar usuário            | ✅                | USER        |
| **GET**    | `/api/v1/admin/roles`        | Listar papéis              | ✅                | ROOT, ADMIN |
| **PUT**    | `/api/v1/admin/roles/attach` | Atribuir papel ao usuário  | ✅                | ROOT, ADMIN |
| **POST**   | `/api/v1/files/upload`       | Upload de arquivo          | ✅                | USER        |

### 🔄 Fluxo de Requisição/Resposta

```mermaid
sequenceDiagram
    participant Cliente
    participant Router
    participant Middleware
    participant Controller
    participant Service
    participant Repository
    participant Database
    
    Cliente->>Router: Requisição HTTP
    Router->>Middleware: Match de Rota
    
    alt Rota Protegida
        Middleware->>Middleware: Verificação Auth
        Middleware->>Middleware: Verificação ACL
    end
    
    Middleware->>Controller: Requisição Validada
    Controller->>Service: Lógica de Negócio
    Service->>Repository: Acesso aos Dados
    Repository->>Database: Query
    Database-->>Repository: Resultado
    Repository-->>Service: Entidade/DTO
    Service-->>Controller: Dados de Resposta
    Controller-->>Cliente: Resposta HTTP
```

### 📥 Coleção Insomnia

Obtenha a coleção completa da API para o
Insomnia: [Download](https://raw.githubusercontent.com/gabrielmaialva33/base-acl-api/master/.github/assets/insomnia/Insomnia.json.zip)

## :memo: Licença

O projeto está sobre a licença [MIT](./LICENSE) ❤️

Gostou? Deixe uma estrela para ajudar o projeto ⭐

<br>

<p align="center">
  <img src="https://raw.githubusercontent.com/gabrielmaialva33/gabrielmaialva33/master/assets/gray0_ctp_on_line.svg?sanitize=true" />
</p>

<p align="center">
  &copy; 2017-present <a href="https://github.com/gabrielmaialva33/" target="_blank">Maia</a>
</p>
¬
