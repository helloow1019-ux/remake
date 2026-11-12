# ReMake — System Architecture & Data Flow

ReMake is an end-to-end full-stack waste-to-value web platform developed for a university sustainability course at the National University of Computer & Emerging Sciences (NUCES).

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (apps/web)"]
        UI["React 18 + Vite + Tailwind UI\n(The Maker's Workbench)"]
        i18n["i18next (EN / UR RTL)"]
        Theme["Theme Context (Light / Dark)"]
        SW["Service Worker (PWA Offline precache)"]
    end

    subgraph Gateway ["HTTP & Security Perimeter"]
        Session["Session Middleware\n(Auto-guest cookie / JWT)"]
        Limiter["Rate Limiter & Daily Quota"]
        Upload["Multer + Sharp (1280px) + Magic Bytes"]
    end

    subgraph Backend ["Backend API (apps/api)"]
        Router["Express Routers"]
        AIModule["Groq AI Wrapper\n(Model fallback, JSON repair)"]
        ImpactEngine["Impact Calculation Engine\n(50% displacement, DB factors)"]
    end

    subgraph Storage ["Persistence Layer"]
        Prisma["Prisma ORM (SQLite / Postgres)"]
        DB[("Database: dev.db\n(17 models & relational indexes)")]
        Uploads[("/uploads directory (Processed images)")]
    end

    subgraph External ["External Services"]
        GroqAPI["Groq Cloud API\n(Vision & Text Models)"]
        WhatsApp["WhatsApp Deep Link (Orders)"]
    end

    UI -->|HTTP / Cookies| Gateway
    Gateway --> Router
    Router --> AIModule
    Router --> ImpactEngine
    Router --> Prisma
    AIModule -->|Server-only Key| GroqAPI
    Prisma --> DB
    Upload --> Uploads
    UI -.-> WhatsApp
```

---

## 2. AI Waste Vision Data Flow

The diagram below details the exact pipeline from camera capture to honest classification:

```mermaid
sequenceDiagram
    autonumber
    actor Maker as User / Visitor
    participant Web as apps/web (React)
    participant API as apps/api (Express)
    participant Sharp as Sharp Pipeline
    participant Groq as Groq Vision API
    participant DB as Prisma (SQLite/Postgres)

    Maker->>Web: Takes or selects waste photo
    Web->>API: POST /api/scans (multipart/form-data)
    Note over API: Session verified / Guest auto-provisioned
    API->>Sharp: Magic byte sniff + resize (max 1280px, auto-rotate)
    Sharp-->>API: Sanitized JPEG buffer + file path
    API->>Groq: Prompt 1: Identify waste streams (Base64 JPEG)
    Note over API,Groq: If model 404/down -> try fallback chain -> mock
    Groq-->>API: Raw JSON response
    API->>API: Zod validation + repair + clamping + banned-word filter
    alt Item is NOT Waste
        API-->>Web: 422 NOT_WASTE (educational guidance)
    else Item is HAZARDOUS (batteries, needles)
        API-->>Web: 200 with safety banner & safe disposal instructions
    else Standard Household Waste
        API->>DB: Save Scan record & detected items
        API->>DB: Query curated TESTED ideas matching waste slugs
        API->>Groq: Prompt 2: Draft 3 untested ideas for detected items
        Groq-->>API: Raw JSON ideas
        API->>DB: Cache AI drafts as status = 'AI_DRAFT'
        API-->>Web: ScanResponse: detected chips + TESTED ideas + AI DRAFTS
    end
    Web->>Maker: Displays chips, tested cards, and honest AI draft cards with '~'
```

---

## 3. Server-Only Key Isolation

A primary security constraint of ReMake is that the Groq API key is strictly server-isolated:
1. **Never Bundled**: Client-side build (`apps/web/dist`) contains zero references to `GROQ_API_KEY` or `gsk_`.
2. **Server Wrapper**: All AI operations pass through `apps/api/src/ai/client.ts` with timeout safeguards (25s), automatic retry with exponential backoff, and catalog fallback.
3. **Graceful Degradation**: If the external Groq service experiences an outage or rate limit (HTTP 429), the platform automatically falls back to curated scenarios without crashing or blocking the user experience.

---

## 4. Impact Calculation Mathematical Architecture

ReMake strictly prevents artificial hallucination of environmental metrics:
- **Server Deterministic Math**: All carbon savings and waste diverted numbers are calculated on the Express server referencing vetted database lifecycle factors.
- **Displacement Factor**: A conservative 0.5 (50%) displacement factor is applied to all estimates:
  $$\text{CO}_2\text{e Saved (kg)} = \text{Waste Weight (kg)} \times (\text{Virgin Factor} - \text{Recycled Factor}) \times 0.5$$
- **Transactional Atomic Writes**: When a maker submits a finished build ("I made this"), the make record, waste diversion log, user streaks, and badge unlock evaluations are executed within a single database transaction (`prisma.$transaction`).

