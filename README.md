# Guttenberg Self-Publishing Platform

> **"Where Perfect Prose Finds Its Audience"**  
> Part of the Master Prose Platform Ecosystem

Guttenberg is a full-service, author-centric self-publishing platform providing professional formatting, distribution, metadata management, ISBN services, royalty tracking, and marketing tools — all deeply integrated with the Master Prose ecosystem.

---

## Features

| Module | Description |
|--------|-------------|
| **Manuscript Management** | Upload (.docx/.pdf/.rtf), 15-point pre-flight validation, version history, Refinery import |
| **Metadata Editor** | Full ONIX 3.0 metadata, AI synopsis generation, per-channel readiness validation |
| **ISBN Services** | Purchase via Bowker block, author-supplied ISBN validation (ISO 2108), multi-format assignment |
| **Interior Formatting** | 8 templates, 7 trim sizes, EPUB/PDF/MOBI output, WYSIWYG preview |
| **Cover Management** | Upload validation (300 DPI), barcode injection, integrated Cover Designer |
| **Distribution** | Amazon KDP, IngramSpark, Apple Books, Kobo, Barnes & Noble, Author Store |
| **Royalty Calculator** | Real-time royalty calculations with per-channel breakdowns |
| **Analytics Dashboard** | Revenue charts, channel breakdown, territory map, top titles |
| **Marketing Hub** | Landing pages, ARC campaigns, press kit generator, Scrybe syndication |
| **Enterprise Features** | Multi-user teams, imprint management, publisher catalog with bulk operations |
| **Publishing Readiness Score** | Composite score: Refinery (60%) + Metadata (20%) + Preflight (20%) |

---

## Architecture

```
guttenberg/
├── backend/          # Node.js + Express + TypeScript API (port 3001)
│   └── src/
│       ├── routes/   # 11 route modules (titles, formats, isbn, distribution, finance, ...)
│       ├── data/     # Mock data (10 titles, sales history, distribution records)
│       └── middleware/
├── frontend/         # React + TypeScript + Tailwind CSS (port 3000)
│   └── src/
│       ├── pages/    # 10 pages (Dashboard, Titles, Analytics, Finance, Marketing, ...)
│       ├── components/  # Shared UI components
│       ├── api/      # Typed API client modules
│       └── context/  # Auth + App context
├── Guttenberg_RDD.docx   # Requirements Definition Document
└── Guttenberg_FDD.docx   # Functional Design Document
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Install Dependencies
```bash
npm run install:all
```

### Development Mode
```bash
# Terminal 1 - Start backend (port 3001)
npm run dev:backend

# Terminal 2 - Start frontend (port 3000)
npm run dev:frontend
```

### Production Build
```bash
npm run build
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Author | `demo@guttenberg.io` | `demo123` |
| Publisher Admin | `publisher@guttenberg.io` | `demo123` |

---

## Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, React Router v6, React Dropzone, Headless UI  
**Backend:** Node.js, Express, TypeScript  
**Infrastructure Target:** AWS (S3, Lambda, RDS, ElastiCache, SQS)

---

## API Overview

All endpoints are under `/api` (base URL: `http://localhost:3001/api`).

| Service | Endpoints |
|---------|-----------|
| Auth | `POST /auth/login`, `GET /auth/verify` |
| Titles | `GET/POST /titles`, `GET/PUT/DELETE /titles/:id` |
| Manuscripts | `POST /manuscripts/upload`, `GET /manuscripts/:id/preflight` |
| Formats | `GET /formats/templates`, `POST /titles/:id/formats` |
| ISBN | `POST /isbn/purchase`, `POST /isbn/validate` |
| Distribution | `GET/POST /titles/:id/distribution`, `GET /channels` |
| Finance | `POST /finance/royalty-calculator`, `GET /finance/earnings` |
| Analytics | `GET /analytics/overview`, `GET /analytics/sales-chart` |
| Marketing | `GET/PUT /titles/:id/landing-page`, `POST /titles/:id/synopsis` |
| Enterprise | `GET /org/catalog`, `GET /org/imprints` |

All errors follow the standard envelope:
```json
{
  "error": {
    "code": "GUT-4001",
    "message": "Cover resolution insufficient for print",
    "detail": "Minimum 300 DPI required; uploaded file is 72 DPI",
    "resolution": "Re-upload cover at 300 DPI or higher",
    "docs_url": "https://docs.guttenberg.io/covers/print-requirements"
  }
}
```

---

*Guttenberg — Master Prose Platform Ecosystem v1.0*
