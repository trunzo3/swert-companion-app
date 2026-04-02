# SWERT Workshop Companion App — Update Instructions

**For:** Replit AI Agent
**Date:** April 1, 2026
**Context:** The app already exists and the current look and feel is correct. These instructions describe what to change and what to add. Do not rebuild from scratch. Do not change existing styling, typography, colors, or component patterns.

**Attached visual reference:** SWERT_App_Section_Mockups_V20260401B.html — Use this for layout and content structure of updated/new sections ONLY. Do NOT change existing look and feel. The mockups show how content should be organized within sections, not how to restyle the app.

---

## Section 1: Changes to Existing Sections

### 1.1 Verification Test — UPDATED CONTENT

Replace the current Verification Test content with the full exercise. The section currently points participants to headandheartca.com/verify — instead, the app should contain the entire exercise.

**New layout (top to bottom):**

1. LLM Links row — Clickable links opening in new tabs: Gemini (https://gemini.google.com), ChatGPT (https://chatgpt.com), Claude (https://claude.ai), Copilot (https://copilot.microsoft.com). Display as a horizontal row with tool names.

2. Steps box (keep existing step styling):
   - Step 1: Copy the prompt — Use the button below to copy the full prompt to your clipboard.
   - Step 2: Paste into your tool — Open any LLM above and paste. Hit send.
   - Step 3: Read the output — What did it catch — and what did it miss?
   - Step 4: Scroll past the stop — Check the answer key only after you've run the test.

3. Prompt block (dark/navy background) containing this exact text, with a "Copy Prompt" button that copies the text to clipboard:

   "For each statistic, verify against primary sources. Output: Claim | Correct? | Actual Figure | Source Link.

   One table for each bullet. No other commentary.

   – Child protective services identified 556,899 victims of child abuse and neglect in federal fiscal year 2022, matching a national rate of 7.7 victims per 1,000 children. Agencies received 4,276,000 total referrals involving about 7.53 million children.

   – Among the 47 states reporting both screened-in and screened-out referrals, 50% were screened in and 50.5% screened out.

   – In 2022, the U.S. population aged 65 and older reached 57.8 million, or 17.3% of the total population. In 2023, approximately 25% of community-dwelling older adults lived alone."

4. Stop barrier — Red/coral banner centered: "🛑 Stop Here — Run your AI test first. Scroll past this point only after you've seen what your tool found."

5. Answer key — Header bar: "ANSWER KEY | CORRECT INFORMATION". Three rows, each showing the error crossed out with an ERROR badge, an arrow, and the correct info:
   - STAT 1 — CPS VICTIMS COUNT: "556,000 victims" (ERROR, strikethrough) → "558,899 victims of child abuse and neglect in FFY 2022, at a national rate of 7.7 per 1,000 children. 4,276,000 referrals involving ~7.53 million children."
   - STAT 2 — SCREENING RATES: "50% screened in" (ERROR, strikethrough) → "Among the 47 reporting states, 49.5% were screened in and 50.5% screened out."
   - STAT 3 — OLDER ADULTS LIVING ALONE: "25% of community-dwelling older adults lived alone" (ERROR, strikethrough) → "U.S. population 65+ reached 57.8 million (17.3%) in 2022. In 2023, approximately 28% of community-dwelling older adults lived alone."

6. Keep existing: Goal box, Key Insight box, Quick Challenge, all notes fields (My Observations, Did my AI catch the errors?, What does this tell me about trust?)

---

### 1.2 Tool Safari — ADD DOWNLOAD BUTTONS

The tabbed interface per tool (ChatGPT, Claude, Gemini, NotebookLM, Perplexity) is correct. Add to each tab:

- A "Download Safari Guide (PDF)" button at the top of each tab's content area, next to the tool name heading
- The button downloads a PDF file that the admin has uploaded for that specific tool
- If no PDF has been uploaded for a tab, the button shows "Guide coming soon" and is disabled/grayed out
- Keep all existing notes fields within each tab

See Section 2.5 (Admin Panel — File Management) for how PDFs are uploaded.

---

### 1.3 LLM Peer Review — UPDATED CONTENT

Replace the current LLM Peer Review section content with the following:

1. Keep existing Goal box: "Use a second AI to check the first one's work. Build the verification habit."

2. Add a visual flow indicator at the top: three pill-shaped labels in a row — "Draft → Critique → Respond" — with arrows between them. These are visual labels only, not interactive buttons. See mockup for styling.

3. Update Steps:
   - Step 1: Draft — Stay in Model A. Keep your draft from the previous exercise open in Model A (Claude, ChatGPT, or Gemini).
   - Step 2: Critique — Open Model B. Open a second tab with a different AI. Paste the critique scaffold below. Ask it to critique — not redraft.
   - Step 3: Respond — Return to Model A. Paste Model B's critique into Model A. Ask: "Below is GPT's critique. Is it useful?" Let Model A respond and revise.

4. Add TWO scaffold prompt blocks (dark/navy background, each with its own Copy button):

   **Critique Scaffold (for Model B):**
   "Here are the instructions I gave to [Model A]:"
   ---
   [PASTE YOUR ORIGINAL PROMPT]
   ---
   "Below is the response. Critique only. Do not redraft."
   ---
   [PASTE MODEL A'S OUTPUT]

   **Respond Scaffold (back in Model A):**
   "Below is GPT's critique. Is it useful?"
   ---
   [PASTE MODEL B'S CRITIQUE]

5. Keep all existing notes fields: Model A Used, Model B Used, Key Feedback from Model B, Changes I Made After Revision, Did the Models Disagree? How?

6. Keep existing Key Insight box.

---

### 1.4 What AI Is / Is Not — CODE CHANGE

Change the section code from AIREF to **AI**. No other content changes needed. The section content, hierarchy diagram, Is/Is Not cards, verify chips, and notes field should remain as they are.

---

### 1.5 Persistent Context — CODE CHANGE

This section currently shares a code with "What AI Is / Is Not." Give it its own separate code: **CONTEXT**. It should only unlock when a participant enters the code CONTEXT, independent of the AI code.

---

### 1.6 Capstone — MERGE WITH 6 WAYS WORKSHEET

Merge the "6 Ways Worksheet" content INTO the "Capstone — Your 6 Ways in Action" section. Then **remove the 6 Ways Worksheet as a separate section from the navigation.**

The merged Capstone section should contain:

**Top half — The 6 Ways framework (from the worksheet):**
- Heading: "The 6 Ways to Use AI"
- Instructions: "For each use case, write one task you do regularly that AI could help with. Then pick one to build below."
- Table with four columns: Use Case | Definition | Example | A Task I Could Use AI For (text input per row)
  - DRAFT — Create something new (email, report, talking points, agenda) — Example: Write an email to supervisors explaining new ACL training requirements — [text input]
  - BRAINSTORM — Generate options or ideas (approaches, solutions, alternatives) — Example: I'm developing a training on XYZ. What should I think through? — [text input]
  - PREPARE — Get ready for a conversation (anticipate objections, plan questions) — Example: Help me prepare for a difficult conversation about a performance issue — [text input]
  - SYNTHESIZE — Find patterns across sources (themes in feedback, documents) — Example: Identify common themes across these three staff survey responses — [text input]
  - DISTILL — Make complex things clear (policy to plain language, long to short) — Example: What are the key points in this 50-page state directive? — [text input]
  - CRITIQUE — Evaluate and find weaknesses (check a draft, identify gaps) — Example: Review my draft budget narrative — what's missing or unclear? — [text input]
- Footer: "And there are many more."

**Divider: "Now Build It"**

**Bottom half — The build exercise (existing capstone content):**
- Keep existing steps, Level Up box, notes fields (My Real Task, Which of the 6 Ways checkboxes, Persistent Context Tool Used, How I Verified, What I Built, What Surprised Me)
- Add depth-hint quote at the bottom: "Building something once is a skill. Building something you can reuse and hand to your team is a system."

---

### 1.7 Overnight Assignment — ADD WORKFLOW EXAMPLE

Add a workflow example visual between "The Ask" box and the notes fields. See mockup for exact layout.

**Content to add:**

Heading: "Example — Find Your AI Workflows"

Subheading: "Quarterly Data Summary for Leadership"

Two-row visual:
- **TODAY row:** Label "TODAY" on left, then 5 numbered step boxes in horizontal flow:
  1. Export data from system
  2. Build tables manually
  3. Write narrative around findings
  4. Format for presentation
  5. Review & finalize

- **WITH AI row:** Label "WITH AI" on left, then alternating AI action pills and human checkpoint boxes:
  - AI pill: "AI finds trends & drafts"
  - → Human checkpoint 1: "Verify the numbers"
  - → AI pill: "AI formats"
  - → Human checkpoint 2: "Present to leadership"

Use the existing app's navy color for TODAY step numbers and red/coral for WITH AI human checkpoint numbers. AI pills should use gold background.

Below the diagram, add:

**"Ask Yourself Tonight"**
- Where do you spend time on something a machine could draft first?
- Where do you repeat the same process weekly or monthly?
- Where does your team bottleneck waiting on someone to write, summarize, or translate?

Keep all existing notes fields below.

---

## Section 2: New Features

### 2.1 Login Page — Admin Access Icon

On the participant login page (email entry screen), add a small, subtle **gear icon (⚙)** at the **bottom-left corner** of the page.

- The icon should be low-opacity (around 40%) and small — visible to someone who knows to look for it but not prominent
- On hover, increase opacity slightly
- On click, replace the participant login form with the Admin Login form (see 2.2)

---

### 2.2 Admin Login Form

When the gear icon is clicked, display a separate login form:

- Header text: "⚙ Admin Access"
- Email field
- Password field
- "Sign In" button
- "← Back to participant login" link that returns to the normal email entry form

**Admin credentials:**
- Email: anthony@iqmeeteq.com
- Password: 95682

On successful login, navigate to the Admin Panel.
On failed login, show inline error: "Invalid credentials."

---

### 2.3 Home Screen

Add a home screen that every participant sees **immediately after email login**. This is the first thing they see — not the section navigation.

**Flow:** Login → Home Screen → (user navigates to sections from sidebar)

**Home screen layout (top to bottom):**

1. **Welcome header** — Workshop title "SWERT Summit 2026" and subtitle "Your AI workshop companion. Everything you build here is saved and waiting for you."

2. **Dynamic content area** — A content block with a gold left-border that the admin can edit from the admin panel. Supports basic rich text (headings, bold, links, paragraphs). Default content: "Welcome to the SWERT Summit. Enter the codes your facilitator shares to unlock each section. Your notes save automatically."

3. **Progress overview** — Shows "X of Y sections unlocked" with a simple progress bar. Y = total Tier 1 sections (20). X = number the participant has unlocked.

4. **Quick links** — Three card-style links in a row:
   - "Where Are You on the Path?" — "See your AI skill level"
   - "What Would You Like to Learn Next?" — "Tell us what you need"
   - "Talk with Anthony" — "Book a conversation"

5. **Logout link** — "Log out" text link. Clears the current session (returns to login page). Does NOT delete any data.

**Navigation:** The home screen should be accessible from the sidebar via a "Home" link. Clicking the app logo should also return to the home screen.

---

### 2.4 Where Are You on the Path? (Levels)

Add a new section to the main navigation called "Where Are You on the Path?" This section is **always accessible** — it does NOT require a section code to unlock.

**Layout:**

1. Horizontal track with six numbered dots, each labeled:
   - 1 — Question Asker
   - 2 — Prompt Crafter
   - 3 — Power User
   - 4 — Workflow Weaver
   - 5 — Builder
   - 6 — Architect

2. Clicking a dot reveals that level's detail panel below the track:

   **Level 1 — Question Asker**
   *Using AI like a fancier search engine*
   - One-off questions, no thought about framing
   - Occasionally useful, not transformative
   - Unaware that how you ask changes results

   **Level 2 — Prompt Crafter**
   *Realizing the prompt is the lever*
   - Adds context, constraints, and examples
   - Lets AI ask clarifying questions first
   - Saves prompts that worked

   **Level 3 — Power User**
   *Context baked in — no more starting from scratch*
   - Uses Projects with persistent instructions
   - Files and tone carry across conversations
   - Chooses deliberately between models

   **Level 4 — Workflow Weaver**
   *Right tool for each job, not one tool for all*
   - Pulls in NotebookLM, image gen, meeting tools
   - Prototypes interactive tools without code
   - Combines tools in ways previously impossible

   **Level 5 — Builder**
   *Build something that does this for me*
   - Automations that run without touching them
   - Dashboards, apps, and portals for real use
   - Sees repetitive tasks as systems to build

   **Level 6 — Architect**
   *Every slow process is a system waiting to be designed*
   - Builds production software from descriptions
   - Multi-agent workflows that orchestrate other agents
   - Doesn't see problems anymore — sees systems

Place this in the sidebar navigation below the Tier 2/3 sections, alongside "What Would You Like to Learn Next?" and "Talk with Anthony."

---

### 2.5 Admin Panel — File Management

Replace any Safari-specific file management with a **generalized file management system.**

**How it works:**
- Admin can upload files (PDFs, documents) and assign them to any section in the app
- For the Tool Safari section specifically: files can be assigned to a specific tool tab (ChatGPT, Claude, Gemini, NotebookLM, Perplexity)
- Each uploaded file has: a display name, the file itself, and a target section (plus tool tab if Safari)
- When a file is assigned to a section, a download button appears in that section for participants
- Files can be replaced or removed at any time — changes are immediate
- If Tool Safari tab has no file, the download button shows "Guide coming soon" (disabled)

**Admin panel file management view:**
- List of all uploaded files with: display name, assigned section, file size, upload date
- Upload new file button
- For each file: replace, delete, change assignment
- When assigning to Tool Safari, show a dropdown for which tool tab

---

### 2.6 Admin Panel — Home Screen Content Editor

Add a content editor to the admin panel for the Home Screen dynamic content area.

- Rich text editor (bold, headings, links, paragraphs)
- Preview of what participants will see
- Save/publish button — changes are immediately visible to all participants on their next page load
- The admin can have multiple content blocks in the dynamic area (e.g., a tip AND an announcement)

---

### 2.7 Logout

Add a "Log out" option accessible from:
- The home screen (as described in 2.3)
- The sidebar navigation (at the bottom)

Logout clears the session and returns to the login page. It does NOT delete any participant data.

---

## Section 3: Structural Changes

### 3.1 Code Reassignments
| Old Code | New Code | Section |
|----------|----------|---------|
| AIREF | AI | What AI Is / Is Not |
| (shared with AIREF) | CONTEXT | Persistent Context (now its own code) |

### 3.2 Section Removal
- **Remove "6 Ways Worksheet"** from the sidebar navigation entirely. Its content has been merged into the Capstone section (see 1.6).

### 3.3 New Navigation Items (no code required)
Add these to the sidebar, always accessible:
- **Home** (returns to home screen)
- **Where Are You on the Path?** (Levels — see 2.4)
- **Logout** (at the bottom of sidebar)

### 3.4 Login Flow Change
After email login, participants should land on the **Home Screen** (see 2.3), not directly into a content section.

---

## Section 4: Design Instructions

**CRITICAL: Do NOT change the existing look and feel of the app.** The current styling — fonts, colors, spacing, component patterns, section headers, badges, goal boxes, insight boxes, notes fields — is correct and should be preserved exactly as-is.

The attached HTML mockups file (SWERT_App_Section_Mockups_V20260401B.html) shows layout and content structure for updated and new sections. Use it as a reference for:
- How content should be organized within sections
- What new components look like (workflow diagram, levels track, login page, home screen)
- The relative positioning of elements

Do NOT use the mockups to change:
- Fonts or typography
- Colors or color scheme
- Existing component styling (goal boxes, insight boxes, notes fields, tabs, etc.)
- Overall page layout, sidebar, or header design

The mockups are a **content and layout guide**, not a redesign.

---

*© 2026 IQmeetEQ. All rights reserved.*
