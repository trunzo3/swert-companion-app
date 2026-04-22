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
│   ├── api-server/         # Express API server (sessions, auth, sections, notes, workflows, feedback, admin, files)
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
- After login: redirects to /home landing page with progress bar, facilitator message, and quick links
- Section code system: facilitator announces codes verbally to unlock sections
- 21 content sections across Day 1 (Capability) and Day 2 (Change Leadership)
- Auto-save notes on all text fields (1s debounce, no save button)
- Workflow Configurator — flagship interactive tool for creating multi-step workflow maps
- Sections remain unlocked permanently for returning participants
- "Where Are You on the Path?" — interactive self-assessment of AI skill levels (virtual section)

### Home Page (/home)
- Dynamic facilitator message (editable via admin)
- Progress bar showing sections unlocked
- Quick links: Skill Assessment, Feedback, Talk with Anthony (Calendly)
- "Go to Workshop →" button

### Admin Panel
- Hidden entry: decorative gear icon in login page footer → toggles inline admin form
- Separate admin login page at /admin/login (email + password)
- Credentials: anthony@iqmeeteq.com / 95682 (override via ADMIN_EMAIL/ADMIN_PASSWORD env vars)
- Participant engagement dashboard (email, last login, sections opened, has notes/workflows)
- Section code management (edit codes, toggle active)
- Safari Worksheet management (add/remove/rename tool tabs)
- File management (upload PDFs/docs per section or per tool tab, download links shown to participants)
- Home Message editor (live facilitator message for home page)
- Feedback submissions viewer

### Section Code Defaults (April 2026 cohort)
- VERIFY → Verification Test (LLM error-checking exercise with answer key)
- SAFARI → Tool Safari (PDF download per tool tab)
- RICECO → RICECO Framework + Draft with RICECO
- PEER → LLM Peer Review (two-model critique workflow)
- DISTILL → Distill
- PREPARE → Prepare
- SYNTHESIZE → Synthesize
- POWER → Power Follow-Ups
- AI → What AI Is/Is Not + Persistent Context (was AIREF)
- CONTEXT → Persistent Context (alternative code)
- SAFETY → Red / Yellow / Green
- CAPSTONE → Capstone (6 Ways table + build exercise)
- TONIGHT → Overnight Assignment (workflow diagram example)
- HARVEST → Overnight Harvest
- WORKFLOW → Workflow Configurator
- CHANGE → Status Quo Bias + County Change Framework + County Change Message + Closing

### Section Content Details
- **Verification Test**: LLM links (Gemini, ChatGPT, Claude, Copilot), copyable prompt with stats errors, stop barrier, answer key
- **Tool Safari**: Tab per tool, PDF download button per tab (file uploaded via admin Files tab)
- **LLM Peer Review**: 3-step flow pills, Critique Scaffold + Respond Scaffold with copy buttons
- **Capstone**: Full 6 Ways table with inline notes fields + build exercise + checkboxes
- **Overnight Assignment**: Workflow comparison diagram (Today vs. With AI)
- **Levels (virtual section)**: 6 interactive skill levels (not in DB, sidebar link only)

## Database Schema

- `participants` — email, createdAt, lastLoginAt
- `section_codes` — sectionId, code, codeActive, cohort
- `unlocked_sections` — participantId, sectionId, unlockedAt
- `notes` — participantId, sectionId, fieldKey, content
- `workflow_maps` — participantId, name, frequency, currentSteps[], redesignedSteps[], verificationCheckpoints, stopConditions
- `feedback` — participantId, content
- `safari_worksheets` — name, sortOrder, active
- `section_files` — displayName, sectionId, toolTab, mimeType, fileData (base64), fileSize, uploadedAt
- `home_content` — content (single-row facilitator message)

## API Endpoints

- `POST /api/auth/login` — login or register by email
- `GET /api/auth/me` — get current participant
- `POST /api/auth/logout` — logout
- `GET /api/sections` — all sections with unlock status
- `POST /api/sections/unlock` — unlock sections with a code
- `GET /api/notes/:sectionId` — notes for a section
- `PUT /api/notes/:sectionId` — save a note field
- `GET /api/workflow-maps` — all workflow maps
- `POST /api/workflow-maps` — create workflow map
- `PUT /api/workflow-maps/:id` — update workflow map
- `DELETE /api/workflow-maps/:id` — delete workflow map
- `POST /api/feedback` — save participant feedback
- `GET /api/home-content` — get facilitator home page message (public)
- `GET /api/files/by-section/:sectionId` — list files for a section (public)
- `GET /api/files/:id/download` — download a file (public)
- `POST /api/admin/login` — admin authentication (email + password)
- `GET /api/admin/participants` — participant engagement list
- `GET /api/admin/sections` — sections with codes
- `PUT /api/admin/sections` — update section code
- `GET /api/admin/safari-worksheets` — safari worksheets
- `POST /api/admin/safari-worksheets` — create worksheet
- `PUT /api/admin/safari-worksheets/:id` — update worksheet
- `DELETE /api/admin/safari-worksheets/:id` — delete worksheet
- `GET /api/admin/feedback` — all participant feedback
- `GET /api/admin/stats` — aggregate engagement statistics
- `PUT /api/admin/home-content` — update facilitator home page message
- `POST /api/admin/files` — upload a file (base64 in JSON body: displayName, sectionId, toolTab, mimeType, fileData)
- `DELETE /api/admin/files/:id` — delete a file

## Routing

- `/` — Participant login (email + confirm)
- `/home` — Home landing page (after login)
- `/workshop` — Main workshop view (sidebar + section content)
- `/workshop?section=<id>` — Jump to a specific section
- `/admin/login` — Admin login (email + password)
- `/admin` — Admin dashboard

## Branding

- Navy: #1A2744 (primary)
- Gold: #C8963E (accent)
- Cream: #FAFAF7 (background)
- Fonts: Lora (headings, serif) + Poppins (body)

## Important Notes

- `six-ways-worksheet` section is hidden from sidebar (merged into Capstone)
- `levels` is a virtual section handled by SectionRenderer (not in DB)
- Logo click in TopNav navigates to /home when onLogoClick prop provided
- File uploads stored as base64 text in PostgreSQL; max recommended ~5MB per file
- NotesField accepts `minHeight` and optional `label` (empty string hides label)
