# IQmeetEQ Workshop Companion

## Overview

A full-stack web app that serves as an interactive digital workbook for the IQmeetEQ two-day AI literacy and change leadership workshop. Replaces printed workbooks for ~40 California county HHS managers per cohort.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, wouter, TanStack Query)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Sessions**: cookie-session

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (sessions, auth, sections, notes, workflows, feedback, admin)
│   └── workshop/           # React + Vite frontend (participant workbook + admin panel)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

### Participant Flow
- Email-based authentication (no password) — double-entry with match + format validation
- Section code system: facilitator announces codes verbally to unlock sections
- 21 content sections across Day 1 (Capability) and Day 2 (Change Leadership)
- Auto-save notes on all text fields (1s debounce, no save button)
- Workflow Configurator — flagship interactive tool for creating multi-step workflow maps
- Sections remain unlocked permanently for returning participants

### Admin Panel
- Hidden entry: decorative icon in the footer (no visible "Admin" text)
- Password: `iqmeeteq2026` (set via ADMIN_PASSWORD env var)
- Participant engagement dashboard (email, last login, sections opened, has notes/workflows/feedback)
- Section code management (create, edit, toggle active, assign cohort)
- Safari Worksheet management (add/remove/reorder AI tool tabs)
- Feedback submissions viewer

### Section Code Defaults (April 2026 cohort)
- VERIFY → Verification Test
- SAFARI → Tool Safari
- RICECO → RICECO Framework + Draft with RICECO
- PEER → LLM Peer Review
- DISTILL → Distill
- PREPARE → Prepare
- SYNTHESIZE → Synthesize
- POWER → Power Follow-Ups
- AIREF → What AI Is/Is Not + Persistent Context
- SAFETY → Red / Yellow / Green
- CAPSTONE → Capstone
- TONIGHT → Overnight Assignment + 6 Ways Worksheet
- HARVEST → Overnight Harvest
- WORKFLOW → Workflow Configurator
- CHANGE → Status Quo Bias + County Change Framework + County Change Message + Closing

## Database Schema

- `participants` — email, createdAt, lastLoginAt
- `section_codes` — sectionId, code, codeActive, cohort
- `unlocked_sections` — participantId, sectionId, unlockedAt
- `notes` — participantId, sectionId, fieldKey, content
- `workflow_maps` — participantId, name, frequency, currentSteps[], redesignedSteps[], verificationCheckpoints, stopConditions
- `feedback` — participantId, content (the "What would you like to learn next?" field)
- `safari_worksheets` — name, sortOrder, active

## API Endpoints

- `POST /api/auth/login` — login or register by email
- `GET /api/auth/me` — get current participant
- `POST /api/auth/logout` — logout
- `GET /api/sections` — all sections with unlock status
- `POST /api/sections/unlock` — unlock sections with a code
- `GET /api/notes` — all notes for participant
- `GET /api/notes/:sectionId` — notes for a section
- `PUT /api/notes/:sectionId` — save a note field
- `GET /api/workflow-maps` — all workflow maps
- `POST /api/workflow-maps` — create workflow map
- `GET /api/workflow-maps/:id` — get a workflow map
- `PUT /api/workflow-maps/:id` — update workflow map
- `DELETE /api/workflow-maps/:id` — delete workflow map
- `GET /api/feedback` — get participant feedback
- `PUT /api/feedback` — save participant feedback
- `POST /api/admin/login` — admin authentication
- `GET /api/admin/participants` — participant engagement list
- `GET /api/admin/sections` — sections with codes
- `PUT /api/admin/sections` — update section code
- `GET /api/admin/safari-worksheets` — safari worksheets (public)
- `POST /api/admin/safari-worksheets` — create worksheet
- `PUT /api/admin/safari-worksheets/:id` — update worksheet
- `DELETE /api/admin/safari-worksheets/:id` — delete worksheet
- `GET /api/admin/feedback` — all participant feedback submissions
- `GET /api/admin/stats` — aggregate engagement statistics

## Branding

- Navy: #1A2744 (primary)
- Gold: #C8963E (accent)
- Cream: #FAFAF7 (background)
- Fonts: Lora (headings, serif) + Poppins (body)
