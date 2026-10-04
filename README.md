# AI Codebase Auditor

**A Static Analysis & Retrieval-Augmented Generation (RAG) Platform for JavaScript and TypeScript Codebases**

---

### Project Metadata

| Field | Detail |
|---|---|
| **Project Name** | AI Codebase Auditor (code-analyzer) |
| **Current Version** | 0.1.0 |
| **Architectural Model** | Full-Stack Next.js Application (Server Actions + Route Handlers + RAG Engine) |
| **Primary Languages** | TypeScript, JavaScript, SQL |
| **Target Runtime** | Node.js 20+ |
| **Last Updated** | October 2026 |

---

### Business Problem Solved
Engineering teams, technical leads, and code reviewers frequently spend hours navigating unfamiliar codebases, assessing structural patterns, spotting potential security issues, and diagnosing quality concerns. Manual repository reviews are time-consuming and lack interactive, line-grounded question answering.

### Target Users
- **Software Engineers & Technical Leads**: Reviewing repository structure, dependencies, and code health signals.
- **Code Reviewers**: Auditing repositories for common vulnerability patterns and code complexity hotspots.
- **Engineering Managers**: Tracking project health scores and onboarding complexity.
- **Developers**: Interactively exploring code with line-grounded conversational AI.

### Business Value
- **Automated Repository Analysis**: Automates repository ingestion, AST-based chunking, local vector embedding, and health report generation.
- **Grounded AI Retrieval (RAG)**: Reduces unsupported AI responses by grounding answers in retrieved repository code chunks and providing file and line references for verification.
- **Multi-Source Ingestion**: Supports direct GitHub repository imports (via OAuth token authorization) and ZIP archive uploads.
- **Tiered SaaS Architecture**: Includes Stripe Checkout, Customer Portal, and plan quota enforcement.

---

### Project Cover Screenshot

```text
[INSERT_PROJECT_COVER_SCREENSHOT]
```

---

## Table of Contents

- [1 Executive Summary](#1-executive-summary)
- [2 Project Overview](#2-project-overview)
- [3 Technology Stack](#3-technology-stack)
- [4 System Architecture](#4-system-architecture)
- [5 Repository Structure](#5-repository-structure)
- [6 Features](#6-features)
- [7 UI Screenshots](#7-ui-screenshots)
- [8 Database Design](#8-database-design)
- [9 Entity Relationship Diagram](#9-entity-relationship-diagram)
- [10 Security](#10-security)
- [11 Authentication](#11-authentication)
- [12 API Documentation](#12-api-documentation)
- [13 Third-party Services](#13-third-party-services)
- [14 Environment Variables](#14-environment-variables)
- [15 Major Dependencies](#15-major-dependencies)
- [16 Installation Guide](#16-installation-guide)
- [17 Deployment](#17-deployment)
- [18 Request Lifecycle](#18-request-lifecycle)
- [19 Performance](#19-performance)
- [20 Security Review](#20-security-review)
- [21 Challenges & Engineering Decisions](#21-challenges--engineering-decisions)
- [22 Future Improvements](#22-future-improvements)
- [23 Developer Notes](#23-developer-notes)

---

## 1 Executive Summary

AI Codebase Auditor is a developer tool built with Next.js 16, React 19, TypeScript, PostgreSQL (`pgvector`), and Prisma. It automates the extraction, AST parsing (Tree-sitter), vector embedding (`@xenova/transformers` all-MiniLM-L6-v2), and LLM-assisted review (Groq) of JavaScript and TypeScript repositories.

The system computes category health scores across architecture, security, performance, code quality, and testing by combining static heuristics with structured LLM review. It surfaces prioritized issue lists and exposes a RAG-backed conversational interface alongside an interactive code explorer. User identity is managed via Auth.js (supporting Google OAuth, GitHub OAuth, and email/password credentials), and subscription billing is handled through Stripe.

---

## 2 Project Overview

### Objective
Provide automated static analysis, structural code chunking, and contextual conversational querying for JavaScript and TypeScript repositories without requiring external embedding APIs or sending unchunked repository archives to LLMs.

### Scope
- Parsing and chunking `.js`, `.jsx`, `.ts`, and `.tsx` source files.
- Filtering build artifacts, dependencies, and binary assets (`node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, lockfiles).
- Local 384-dimensional vector embedding generation.
- Cosine similarity vector search inside PostgreSQL using the `pgvector` extension.
- Structured LLM evaluation for category summaries and prioritized issues.
- Streaming conversational assistant with metadata-linked source citations.

### Primary Modules
1. **Ingestion & Extraction Engine**: GitHub API zipball streaming and JSZip decompression with size constraints.
2. **Parser & Chunking Pipeline**: Tree-sitter-based structural AST parsing and boundary-aware chunking.
3. **Vector & RAG Subsystem**: Local MiniLM embedding pipeline with PostgreSQL vector distance querying (`<=>`).
4. **Health Review Engine**: Deterministic static metric extraction combined with structured LLM review via Groq (`llama-3.3-70b-versatile`).
5. **Subscription & Quota Manager**: Stripe billing integration with daily analysis quotas and rate limiting.

### Target Audience & Use Cases
- **Repository Audits**: Evaluating third-party or legacy codebases prior to refactoring or integration.
- **Developer Onboarding**: Assisting engineers in exploring unfamiliar architectures through grounded chat.
- **Pre-Release Code Reviews**: Identifying file complexity outliers and potential hardcoded secret patterns.

---

## 3 Technology Stack

### Core Platform
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | 16.3.1 | Full-stack routing, Server Actions, API routes |
| **Language** | TypeScript | 5.x | Static typing across server and client |
| **Runtime** | Node.js | 20+ | Backend execution runtime |
| **Frontend UI** | React | 19.2.8 | UI component tree |
| **Styling** | Tailwind CSS / CSS Variables | 4.x | Design tokens, responsive styling |
| **UI Components** | shadcn/ui (Base UI / Radix primitives) | 4.18.0 | Modal dialogs, tabs, progress indicators |
| **Icons** | Lucide React | 1.31.0 | UI icon set |
| **Syntax Highlighting** | react-syntax-highlighter | 16.1.1 | Code explorer syntax display |

### Data & Storage
| Layer | Technology | Purpose |
|---|---|---|
| **Database** | PostgreSQL | Relational data store |
| **Vector Extension** | pgvector | 384-dimensional vector storage and cosine distance (`<=>`) queries |
| **ORM** | Prisma Client & Prisma Pg Adapter | Database schema modeling, migrations, and query execution |
| **Driver** | `pg` (node-postgres) | Connection pool management |

### AI & Analysis
| Layer | Technology | Purpose |
|---|---|---|
| **LLM Inference** | Groq (via `@ai-sdk/groq`) | LLM inference for health review and chat |
| **AI Framework** | Vercel AI SDK (`ai`, `@ai-sdk/react`) | Structured object generation and streaming UI responses |
| **Embeddings** | `@xenova/transformers` (`all-MiniLM-L6-v2`) | Local 384-dimensional vector embeddings |
| **Parsing** | Tree-sitter (`tree-sitter-javascript`, `tree-sitter-typescript`) | Concrete syntax tree parsing and code block boundary extraction |
| **Archive Ingestion** | JSZip | In-memory ZIP archive decompression |

### Authentication & Billing
| Layer | Technology | Purpose |
|---|---|---|
| **Auth** | Auth.js (NextAuth v5 beta) | Session management, JWTs, OAuth, Credentials |
| **Password Hashing** | bcryptjs | Password hashing for email credentials |
| **Token Encryption** | Node.js `crypto` (`aes-256-gcm`) | Symmetric encryption of stored GitHub OAuth access tokens |
| **Billing** | Stripe Node SDK | Checkout sessions, billing portal, webhook handling |

### Testing & Quality Assurance
| Layer | Technology | Purpose |
|---|---|---|
| **Unit & Integration** | Vitest 4.x | Unit tests for metrics, filters, chunking, and billing |
| **End-to-End Testing** | Playwright 1.62.x | Browser smoke tests for landing and authentication pages |
| **Linting** | ESLint 9.x | Static code quality enforcement |

---

## 4 System Architecture

The application is structured as a full-stack Next.js system. Analysis is executed asynchronously within request handlers, writing incremental progress steps to PostgreSQL while the client polls for status updates.

### System Architecture Diagram

```text
+--------------------------------------------------------------------------------------------------+
|                                        Client Browser                                            |
|  +---------------------------+  +---------------------------+  +------------------------------+  |
|  |   Landing & Auth Views    |  |   Dashboard & Projects    |  |   Code Explorer & AI Chat    |  |
|  +-------------+-------------+  +-------------+-------------+  +--------------+---------------+  |
+----------------|------------------------------|-------------------------------|------------------+
                 | HTTPS                        | Server Actions / HTTP         | SSE / AI Stream
                 v                              v                               v
+--------------------------------------------------------------------------------------------------+
|                                    Next.js Application Server                                    |
|                                                                                                  |
|  +------------------------+  +--------------------------+  +----------------------------------+  |
|  |   Auth.js (v5 Beta)    |  |   Server Action Layer    |  |     API Route Handlers           |  |
|  |  - Google / GitHub OAut|  |  - Project CRUD / Retry  |  |  - /api/chat (RAG Stream)        |  |
|  |  - Credentials / JWT   |  |  - Stripe Portal Actions |  |  - /api/projects/:id/analyze     |  |
|  |  - AES-256-GCM Tokens  |  |  - ZIP Upload Actions    |  |  - /api/billing/webhook          |  |
|  +-----------+------------+  +------------+-------------+  +----------------+-----------------+  |
|              |                            |                                 |                    |
|              +----------------------------+---------------------------------+                    |
|                                           |                                                      |
|                                           v                                                      |
|                       +---------------------------------------+                                  |
|                       |       Analysis & Pipeline Core        |                                  |
|                       |  - Tree-sitter JS/TS Parser           |                                  |
|                       |  - JSZip Archive Extraction           |                                  |
|                       |  - MiniLM Embedder (@xenova)          |                                  |
|                       |  - Vercel AI SDK + Groq LLM Driver    |                                  |
|                       +-------------------+-------------------+                                  |
+-------------------------------------------|------------------------------------------------------+
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
+-----------------------------------+     +-----------------------------------+
|     External Cloud Services       |     |   PostgreSQL Database (Neon/pg)   |
|                                   |     |                                   |
|  +-----------------------------+  |     |  +-----------------------------+  |
|  | Groq API (Inference Engine) |  |     |  | Users, Accounts, Sessions   |  |
|  +-----------------------------+  |     |  +-----------------------------+  |
|  | GitHub API (Zipball Stream) |  |     |  | Projects & Reports (JSON)   |  |
|  +-----------------------------+  |     |  +-----------------------------+  |
|  | Stripe API (Checkout/Portal)|  |     |  | CodeChunk (vector(384))     |  |
|  +-----------------------------+  |     |  +-----------------------------+  |
+-----------------------------------+     +-----------------------------------+
```

---

## 5 Repository Structure

```text
AI-Code-Analyzer/
├── prisma/
│   └── schema.prisma            # Prisma schema with pgvector and relation definitions
├── public/                      # Static assets, banner images, icons
├── src/
│   ├── app/
│   │   ├── (app)/               # Authenticated application shell
│   │   │   ├── dashboard/       # Project list, stats, recent analyses
│   │   │   ├── projects/
│   │   │   │   ├── [id]/        # Project workspace views
│   │   │   │   │   ├── chat/    # RAG conversational interface
│   │   │   │   │   ├── explorer/# File tree and file-level AI assistant
│   │   │   │   │   ├── issues/  # Prioritized issues and recommendations
│   │   │   │   │   ├── progress/# Analysis progress tracker
│   │   │   │   │   └── report/  # Health report & category scores
│   │   │   │   └── new/         # Ingestion page (GitHub selector & ZIP upload)
│   │   │   └── settings/        # Account management, GitHub linking, Stripe billing
│   │   ├── (auth)/              # Authentication views (Login / Register)
│   │   ├── api/                 # REST & Streaming route handlers
│   │   │   ├── auth/            # Auth.js NextAuth handler endpoints
│   │   │   ├── billing/         # Stripe webhook endpoint
│   │   │   ├── chat/            # Streaming RAG chat endpoint
│   │   │   ├── explorer/        # Code viewer and file explainer endpoints
│   │   │   ├── github/          # GitHub OAuth connect and callback handlers
│   │   │   └── projects/        # Project analysis trigger endpoint
│   │   ├── globals.css          # Design tokens, CSS variables, typography
│   │   └── layout.tsx           # Root HTML layout with theme providers
│   ├── components/              # UI components (billing, chat, dashboard, ui)
│   ├── generated/               # Generated Prisma client output
│   ├── lib/
│   │   ├── actions/             # Next.js Server Actions (auth, analysis, billing, github)
│   │   ├── ai/                  # Groq client instantiation and model configurations
│   │   ├── analysis/            # Analysis pipeline, chunking, embeddings, metrics, RAG
│   │   ├── billing/             # Stripe utilities, entitlements, plan limit constants
│   │   ├── files/               # Extraction, framework detection, path filtering, storage
│   │   ├── auth.config.ts       # Edge-compatible Auth.js configuration
│   │   ├── auth.ts              # Full Auth.js implementation with PrismaAdapter
│   │   ├── db.ts                # PrismaClient singleton with connection pooling
│   │   ├── encryption.ts        # AES-256-GCM cryptographic token encryption
│   │   ├── github.ts            # GitHub REST API client (repos, zipball streaming)
│   │   ├── limits.ts            # System constraints (file size, analysis limits)
│   │   ├── rate-limit.ts        # Chat rate limiting logic
│   │   └── utils.ts             # Styling and class merging utilities
│   └── types/                   # Shared TypeScript interfaces
├── .env.example                 # Documented environment variable template
├── package.json                 # Package definitions and script commands
├── prisma.config.ts             # Prisma configuration
├── tsconfig.json                # TypeScript compiler configuration
└── vitest.config.ts             # Vitest test runner configuration
```

---

## 6 Features

### 1. Multi-Source Code Ingestion
- **GitHub Ingestion**: Connects to GitHub OAuth to list repositories and stream branch zipballs into memory.
- **ZIP File Upload**: Accepts ZIP archive uploads with file size constraints (max 100 MB archive size, max 500 KB per file, max 1,000 files).
- **Path Filtering**: Filters non-source files and excluded directories (`node_modules`, `.git`, `dist`, `build`, `.next`, lockfiles). Only `.js`, `.jsx`, `.ts`, and `.tsx` files are indexed.
- **Framework Detection**: Inspects file paths and `package.json` to detect frameworks (Next.js, React, Express, Vue, Svelte, Nuxt, Astro, NestJS).

### 2. AST-Aware Code Chunking & Local Embeddings
- **Syntax Parsing**: Uses Tree-sitter (`tree-sitter-javascript`, `tree-sitter-typescript`) to parse ASTs and split source code along logical declarations (functions, classes, methods, type aliases, exports).
- **Chunk Sizing**: Targets 200–400 tokens per chunk with fallback linear splitting for oversized files and merging for small adjacent nodes.
- **Local Embedding**: Generates 384-dimensional vector embeddings using `@xenova/transformers` (`all-MiniLM-L6-v2`) in batches of 16 locally in the Node.js process.
- **PostgreSQL Vector Persistence**: Inserts embeddings into `CodeChunk.embedding` as `vector(384)` for similarity searches.

### 3. Codebase Health Review & Issue Generation
- **Deterministic Signals**:
  - Detects large files (`>=400` lines) and complex functions (`>=80` lines).
  - Scans for regex-based secret patterns (API keys, JWT secret literals, AWS access keys).
  - Computes approximate test coverage by matching test file names to source paths.
- **Structured LLM Review**:
  - Samples up to 24 code chunks and sends them to Groq (`llama-3.3-70b-versatile`) via `generateObject` with a strict Zod schema for architecture, security, and performance findings.
- **Score Calculation**:
  - Computes category scores (0–100) by subtracting severity penalties (`critical: 18`, `high: 10`, `medium: 4`, `low: 1`) from category baselines.
  - Computes overall health score as the arithmetic mean of the five category scores.

### 4. Grounded Conversational AI (RAG)
- **Vector Search**: Embeds user questions with MiniLM and executes a cosine distance search (`1 - (embedding <=> $1::vector)`) filtered by `projectId` (top 8 chunks).
- **Context Injection**: Injects retrieved code chunks with file paths and line ranges into the system prompt.
- **Streaming UI**: Uses Vercel AI SDK `streamText` to deliver tokens over SSE, attaching cited file paths and line numbers as stream metadata.

### 5. Interactive Code Explorer
- **File Navigation**: Displays project file tree hierarchy.
- **Code Viewer**: Renders source files with syntax highlighting.
- **Inline Explanations**: Generates structured file summaries, key functions, dependencies, and potential issues for individual files.

### 6. Subscription & Quota Enforcement
- **Plan Limits**:
  - Free: 5 analyses/day, 5 projects, 20 chat messages/hour.
  - Premium: 50 analyses/day, unlimited projects, 200 chat messages/hour.
- **Stripe Integration**: Supports Stripe Checkout redirection, Customer Portal access, and webhook synchronization.

---

## 7 UI Screenshots

```text
[INSERT_HOME_PAGE_SCREENSHOT]
```

```text
[INSERT_LOGIN_PAGE_SCREENSHOT]
```

```text
[INSERT_DASHBOARD_SCREENSHOT]
```

```text
[INSERT_NEW_PROJECT_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_OVERVIEW_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_PROGRESS_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_REPORT_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_ISSUES_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_CHAT_PAGE_SCREENSHOT]
```

```text
[INSERT_PROJECT_EXPLORER_PAGE_SCREENSHOT]
```

```text
[INSERT_SETTINGS_PAGE_SCREENSHOT]
```

---

## 8 Database Design

The schema is defined in Prisma (`prisma/schema.prisma`) targeting PostgreSQL with `postgresqlExtensions = ["postgresqlExtensions"]` and the `vector` extension.

### 1. `User`
Stores user profile, authentication identity, encrypted access tokens, and Stripe subscription state.
- `id` (String, UUID, PK)
- `name` (String, Nullable)
- `email` (String, Unique, Nullable)
- `emailVerified` (DateTime, Nullable)
- `image` (String, Nullable)
- `passwordHash` (String, Nullable)
- `authProvider` (String, Nullable)
- `githubAccessToken` (String, Nullable - AES-256-GCM Encrypted)
- `githubUsername` (String, Nullable)
- `stripeCustomerId` (String, Unique, Nullable)
- `stripeSubscriptionId` (String, Unique, Nullable)
- `stripePriceId` (String, Nullable)
- `plan` (Enum `Plan`: `free`, `premium`, Default: `free`)
- `planStatus` (Enum `PlanStatus`: `none`, `active`, `past_due`, `canceled`, Default: `none`)
- `createdAt` (DateTime, Default: `now()`)
- `updatedAt` (DateTime, UpdatedAt)

### 2. `Account`
Auth.js account provider links.
- `id` (String, UUID, PK)
- `userId` (String, FK -> `User.id` ON DELETE CASCADE)
- `type` (String)
- `provider` (String)
- `providerAccountId` (String)
- `refresh_token` (Text, Nullable)
- `access_token` (Text, Nullable)
- `expires_at` (Int, Nullable)
- `token_type` (String, Nullable)
- `scope` (String, Nullable)
- `id_token` (Text, Nullable)
- `session_state` (String, Nullable)
- *Constraints*: Unique compound index `[provider, providerAccountId]`.

### 3. `Session`
Auth.js database sessions.
- `id` (String, UUID, PK)
- `sessionToken` (String, Unique)
- `userId` (String, FK -> `User.id` ON DELETE CASCADE)
- `expires` (DateTime)

### 4. `VerificationToken`
Verification tokens for Auth.js.
- `identifier` (String)
- `token` (String, Unique)
- `expires` (DateTime)
- *Constraints*: Unique compound index `[identifier, token]`.

### 5. `Project`
Represents an ingested repository.
- `id` (String, UUID, PK)
- `userId` (String, FK -> `User.id` ON DELETE CASCADE)
- `name` (String)
- `source` (Enum `ProjectSource`: `github`, `upload`)
- `repositoryUrl` (String, Nullable)
- `framework` (String, Nullable)
- `status` (Enum `ProjectStatus`: `queued`, `processing`, `completed`, `failed`, Default: `queued`)
- `errorMessage` (String, Nullable)
- `fileCount` (Int, Default: 0)
- `progressStep` (String, Nullable)
- `progressPercent` (Int)
- `createdAt` (DateTime, Default: `now()`)
- `updatedAt` (DateTime, UpdatedAt)
- *Indexes*: Index on `[userId]`.

### 6. `CodeChunk`
Stores tokenized code chunks and vector embeddings.
- `id` (String, UUID, PK)
- `projectId` (String, FK -> `Project.id` ON DELETE CASCADE)
- `filePath` (String)
- `content` (Text)
- `startLine` (Int, Nullable)
- `endLine` (Int, Nullable)
- `embedding` (Type `Unsupported("vector(384)")`)
- *Indexes*: Index on `[projectId]`.

### 7. `Report`
Stores aggregated health review scores and LLM findings.
- `id` (String, UUID, PK)
- `projectId` (String, Unique, FK -> `Project.id` ON DELETE CASCADE)
- `healthScore` (Int)
- `categoryScores` (Json)
- `issues` (Json)
- `createdAt` (DateTime, Default: `now()`)

### 8. `UsageEvent`
Tracks analysis events for daily quota enforcement.
- `id` (String, UUID, PK)
- `userId` (String, FK -> `User.id` ON DELETE CASCADE)
- `type` (String - `analysis`)
- `createdAt` (DateTime, Default: `now()`)
- *Indexes*: Index on `[userId, type, createdAt]`.

---

## 9 Entity Relationship Diagram

```text
+------------------------------------+
|               User                 |
+------------------------------------+
| id (PK)                            |
| email (UQ)                         |<--------+
| passwordHash                       |         |
| githubAccessToken (Encrypted)      |         |
| stripeCustomerId (UQ)              |         |
| plan, planStatus                   |         |
+-----------------+------------------+         |
                  | 1                          |
                  |                            |
       +----------+----------+                 |
       | 1                   | 1               |
       v N                   v N               |
+---------------+     +---------------+        |
|    Account    |     |    Session    |        |
+---------------+     +---------------+        |
| id (PK)       |     | id (PK)       |        |
| userId (FK)   |     | userId (FK)   |        |
+---------------+     +---------------+        |
       |                                       |
       v 1                                     |
+------------------------------------+         |
|              Project               |         |
+------------------------------------+         |
| id (PK)                            |         |
| userId (FK) -----------------------+         |
| name, source, status               |         |
| progressStep, progressPercent      |         |
+-----------------+------------------+         |
                  | 1                          |
                  |                            |
       +----------+----------+                 |
       | 1                   | 1               |
       v N                   v 1               |
+---------------+     +---------------+        |
|   CodeChunk   |     |    Report     |        |
+---------------+     +---------------+        |
| id (PK)       |     | id (PK)       |        |
| projectId(FK) |     | projectId(FK) |        |
| embedding     |     | healthScore   |        |
|   vector(384) |     | categoryScores|        |
+---------------+     +---------------+        |
                                               |
+------------------------------------+         |
|             UsageEvent             |         |
+------------------------------------+         |
| id (PK)                            |         |
| userId (FK) -----------------------+---------+
| type, createdAt                    |
+------------------------------------+
```

---

## 10 Security

### Implemented Security Controls
1. **Encrypted Token Storage (`AES-256-GCM`)**:
   - GitHub OAuth tokens are encrypted before database insertion using `createCipheriv("aes-256-gcm")` with a key derived from `AUTH_SECRET` using `scryptSync`. Tokens are formatted as `iv:tag:ciphertext`.
2. **Password Security**:
   - User credentials use `bcryptjs` hashing with automatic salting before persistence.
3. **Session & Route Authorization**:
   - Protected routes (`/dashboard`, `/projects`, `/settings`) enforce session verification in NextAuth authorized middleware callbacks.
   - Server Actions and route handlers verify session identity (`auth()`) and enforce project ownership (`where: { id, userId: session.user.id }`).
4. **Archive Ingestion Safeguards**:
   - ZIP extraction enforces size limits (`MAX_REPO_SIZE_BYTES = 100 MB`, `MAX_FILE_SIZE_BYTES = 500 KB`, `MAX_FILE_COUNT = 1000`) and skips binary formats.
5. **Rate Limiting & Quotas**:
   - Daily analysis creation is verified against database usage records (`assertCanRunAnalysis`).
   - Chat requests are rate-limited via an in-memory sliding window bucket (`assertChatRateLimit`).
6. **Webhook Verification**:
   - Stripe webhooks verify request signatures using `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.

---

## 11 Authentication

### Authentication Implementation
Authentication is powered by Auth.js (NextAuth v5 beta) configured with JWT session strategy and Prisma adapter synchronization.

```text
+-----------------------------------------------------------------------------------------+
|                                    Authentication Flow                                  |
|                                                                                         |
|  [ User ] ---> ( Sign In Request: Google / GitHub / Credentials )                       |
|                     |                                                                   |
|                     v                                                                   |
|         [ NextAuth / Auth.js Handler ]                                                  |
|                     |                                                                   |
|         +-----------+-----------+-----------------------+                               |
|         |                       |                       |                               |
|         v (Credentials)         v (OAuth: Google)       v (OAuth: GitHub)               |
|  [ Verify bcrypt hash ]   [ Verify Google ID ]    [ Exchange Code for Token ]           |
|         |                       |                       |                               |
|         |                       |                 [ Encrypt Token: AES-256-GCM ]        |
|         |                       |                       |                               |
|         +-----------------------+-----------------------+                               |
|                                 |                                                       |
|                                 v                                                       |
|                     [ Prisma User Record Upsert ]                                       |
|                                 |                                                       |
|                                 v                                                       |
|                 [ Issue Signed JWT Session Cookie ]                                     |
|                                 |                                                       |
|                                 v                                                       |
|                 [ Authorized Access to /dashboard ]                                     |
+-----------------------------------------------------------------------------------------+
```

---

## 12 API Documentation

### Summary Table

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | No | Auth.js NextAuth handler endpoint |
| `POST` | `/api/chat` | Yes | RAG-based conversational AI stream for a project |
| `POST` | `/api/explorer/explain` | Yes | Generates structured AI explanation for a single file |
| `GET` | `/api/explorer/file` | Yes | Retrieves file content from project storage |
| `GET` | `/api/github/connect` | Yes | Initiates GitHub OAuth authorization flow |
| `GET` | `/api/github/callback` | Yes | Handles GitHub OAuth callback and stores encrypted token |
| `POST` | `/api/projects/[id]/analyze` | Yes | Runs complete analysis pipeline for a project |
| `POST` | `/api/billing/webhook` | No (Stripe Signature) | Stripe webhook event handler |

---

### Endpoint Specifications

#### 1. RAG Chat Stream
- **Endpoint**: `POST /api/chat`
- **Authentication**: Required (`auth()`)
- **Request Body**:
  ```json
  {
    "projectId": "string",
    "messages": [
      { "role": "user", "content": "How does authentication work in this repo?" }
    ]
  }
  ```
- **Response**: Streamed text with message metadata containing cited `ChatSource` references (`filePath`, `startLine`, `endLine`).
- **Error Responses**: `401 Unauthorized`, `400 Bad Request`, `404 Project not found`, `429 Rate limit exceeded`.

#### 2. File Explanation
- **Endpoint**: `POST /api/explorer/explain`
- **Authentication**: Required (`auth()`)
- **Request Body**:
  ```json
  {
    "projectId": "string",
    "filePath": "src/lib/auth.ts"
  }
  ```
- **Response**:
  ```json
  {
    "summary": "String",
    "keyFunctions": ["auth", "signIn"],
    "dependencies": ["@auth/prisma-adapter"],
    "potentialIssues": []
  }
  ```

#### 3. Stripe Webhook Handler
- **Endpoint**: `POST /api/billing/webhook`
- **Authentication**: Verified via `stripe-signature` header and `STRIPE_WEBHOOK_SECRET`
- **Handled Events**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Response**: `200 { "received": true }`

---

## 13 Third-party Services

| Service | Purpose | Implementation Detail |
|---|---|---|
| **PostgreSQL (Neon)** | Database & Vector Store | Connected via `@prisma/adapter-pg` using pg connection pool with `vector` extension. |
| **Groq Cloud** | LLM Inference | `@ai-sdk/groq` using `llama-3.3-70b-versatile` for health review and chat. |
| **Google Cloud OAuth** | User Authentication | Configured in Auth.js Google Provider. |
| **GitHub REST API** | Authentication & Repo Ingestion | OAuth flow and authenticated zipball archive streaming (`https://api.github.com/repos/{owner}/{repo}/zipball`). |
| **Stripe** | Subscription Billing | Node SDK for checkout sessions, portal sessions, and webhook processing. |

---

## 14 Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (prefer session pooler with `?sslmode=require`) |
| `AUTH_SECRET` | Yes | 32-byte secret for session signing and AES token encryption |
| `AUTH_URL` | Yes | Canonical application base URL (`http://localhost:3000` locally) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth Client Secret |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth Application Client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth Application Client Secret |
| `GROQ_API_KEY` | Yes | Groq API Key for LLM chat and report generation |
| `GROQ_MODEL` | No | Model override for chat (Default: `llama-3.3-70b-versatile`) |
| `GROQ_STRUCTURED_MODEL`| No | Model override for structured review (Default: `llama-3.3-70b-versatile`) |
| `STRIPE_SECRET_KEY` | Optional | Stripe Secret API Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe Publishable Key for checkout |
| `STRIPE_PRICE_PREMIUM` | Optional | Stripe Recurring Price ID for Premium plan |
| `STRIPE_WEBHOOK_SECRET`| Optional | Stripe Webhook signing secret |

---

## 15 Major Dependencies

| Package | Purpose |
|---|---|
| `next` | Core App Router framework, SSR, Server Actions, and API routes |
| `react` / `react-dom` | React 19 UI component tree |
| `@prisma/client` & `prisma` | Database schema modeling and ORM queries |
| `@prisma/adapter-pg` & `pg` | PostgreSQL driver adapter with connection pooling |
| `next-auth` (`@auth/prisma-adapter`) | Authentication and session persistence |
| `@ai-sdk/groq` & `ai` | Vercel AI SDK integration for Groq inference and streaming |
| `@xenova/transformers` | Local Node.js pipeline for MiniLM embeddings |
| `tree-sitter`, `tree-sitter-javascript`, `tree-sitter-typescript` | Syntax parsing for code-aware chunking |
| `jszip` | In-memory ZIP archive decompression |
| `stripe` | Payment processing, checkout, and webhook verification |
| `bcryptjs` | Password hashing for local credentials |
| `zod` | Runtime schema validation |

---

## 16 Installation Guide

### Prerequisites
- Node.js 20.x or higher
- npm, yarn, or pnpm
- PostgreSQL database instance with `vector` extension enabled (e.g., Neon or Supabase)

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository-url>
cd AI-Code-Analyzer
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and populate keys:
```bash
cp .env.example .env
```

### Step 3: Enable Vector Extension & Sync Database Schema
In your PostgreSQL query editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
Push the Prisma schema:
```bash
npm run db:push
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 17 Deployment

### Deployment Architecture

```text
+--------------------------------------------------------------------------+
|                            Vercel Cloud Platform                         |
|                                                                          |
|   +------------------------------------------------------------------+   |
|   |                  Next.js App Router Runtime                      |   |
|   |                                                                  |   |
|   |  - Static Assets & SSR Pages                                     |   |
|   |  - Serverless Route Handlers (/api/chat, /api/billing/webhook)   |   |
|   |  - Local MiniLM Embeddings (@xenova/transformers via WASM)       |   |
|   +---------------------------------+--------------------------------+   |
+-------------------------------------|------------------------------------+
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v                                         v
+----------------------------------+     +----------------------------------+
|      Neon Serverless Postgres    |     |          Groq Cloud LLM          |
|  - Relational Models             |     |  - High-Speed Inference Engine   |
|  - pgvector Cosine Query (<=>)   |     |  - llama-3.3-70b-versatile       |
+----------------------------------+     +----------------------------------+
```

---

## 18 Request Lifecycle

### RAG Chat Request Flow

```text
User Question (/projects/:id/chat)
       |
       v
Next.js Route Handler (/api/chat)
       |
       +---> Check Auth Session (Auth.js)
       |
       +---> Check Chat Rate Limit (assertChatRateLimit)
       |
       +---> Generate Query Embedding (embedQuery with MiniLM-L6-v2)
       |
       +---> PostgreSQL Vector Query (pgvector cosine distance <=>)
       |
       +---> Retrieve Top-K Code Chunks
       |
       +---> Construct Grounded System Prompt
       |
       +---> Stream Groq LLM Inference (streamText)
       |
       v
SSE Stream to Client with Cited Sources
```

---

## 19 Performance

### Implemented Architectural Considerations
- **In-Process Embeddings**: Runs MiniLM via `@xenova/transformers` locally in the Node.js runtime, eliminating external embedding API roundtrips.
- **Connection Pooling**: Employs `pg.Pool` with `@prisma/adapter-pg` to reuse connections across server actions and route handlers.
- **Batch Processing**: Chunks are processed in batches (16 for embeddings, 100 for database insertions) during repository indexing.
- **Streaming Responses**: Uses Server-Sent Events (SSE) via the Vercel AI SDK for interactive token streaming.

### Potential Bottlenecks
- Ingesting large repositories with hundreds of files requires sequential batch processing which takes multiple seconds to complete.

---

## 20 Security Review

### Implemented Controls
- **Token Encryption**: Third-party access tokens are encrypted with `AES-256-GCM` using derived keys.
- **Authorization Scoping**: All project-specific database operations enforce user ID scoping to prevent horizontal access violations.
- **Secret Separation**: API keys (`GROQ_API_KEY`, `STRIPE_SECRET_KEY`, `AUTH_SECRET`) are server-only and not exposed to client bundles.

### Operational Recommendations
- Migrate in-memory chat rate limiting to Redis (e.g., Upstash) when scaling across multi-region serverless instances.
- Ensure Stripe webhook secret rotation is scheduled periodically.

---

## 21 Challenges & Engineering Decisions

1. **AST Parsing in Full-Stack Environment**: Tree-sitter integration preserves structural node boundaries (functions, classes) rather than splitting code by arbitrary character limits.
2. **Local vs External Embeddings**: Utilizing `@xenova/transformers` locally in Node.js avoids third-party embedding billing while maintaining 384-dimensional retrieval precision.
3. **Unified Relational & Vector Storage**: Leveraging `pgvector` inside PostgreSQL keeps chunk embeddings alongside relational project and user records without requiring a dedicated vector database service.

---

## 22 Future Improvements

- Expanded parser support for Python, Go, and Rust.
- Dedicated background worker queues (e.g., BullMQ / Inngest) for handling repository indexing decoupled from HTTP requests.
- Multi-region distributed rate limiting via Redis.
- Automated Pull Request review comments via GitHub App integration.

---

## 23 Developer Notes

- **Prisma Output**: Prisma client artifacts are output to `src/generated/prisma` for path alias resolution.
- **Test Suite**: Run unit tests via `npm test` (`vitest run`). E2E smoke tests are configured via `playwright test`.
- **Database Schema Sync**: Use `npm run db:push` for development schema synchronization.

---
Written by Yash Lagare
