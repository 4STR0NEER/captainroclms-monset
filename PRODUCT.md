# JazzRoc LMS: product context

> Inferred from the client build brief (2026-10-30), not from a stakeholder interview. Treat anything here as an assumption until confirmed.

## What it is
An online learning platform for **JazzRoc**, a contemporary piano school on Sydney's Northern Beaches run by Roc Koren ("Captain Roc"). It replaces a WordPress site where lessons sit behind one shared password. This repo is a **frontend-only demo**: all data is mocked in `src/data/`, read and written only through `src/services/`, so Supabase can replace the mocks later.

## Who uses it
- **Students:** mostly children aged 5 to 15 practising at a piano with a tablet on the stand, often with a parent alongside. Also adults returning to piano.
- **Parents:** own the account and the child profiles. Want to see progress, practice and tutor notes, and trust that it is a serious music school.
- **Tutors:** Roc, Tom and Hugo. Track students, give feedback and judge exam readiness.
- **Admin:** Roc as owner. Manages students, content, enrolments, exam interest and news.

## Brand world
The curriculum is a pirate and island adventure. Captain Roc guides students across an archipelago (Melody, Harmony, Notation, Fundamentals, Songbook, TV Themes, Practice Cave, Exam Island). Nautical language is used lightly and stays readable for parents.

## Design direction: "sea chart at golden hour"
- The **island map** is the one bold, memorable element. Everything else is calm and highly readable.
- Tokens live in `src/styles/index.css`: deep `#0E2A47`, foam `#EAF4F2`, lagoon `#13716F`, doubloon `#F2B53A` (rewards only), buoy `#D93F4C` (locked, errors, live timer; icons, fills and borders only, never small text), key `#FFFFFF`.
- Islands use only these tokens and their tints (no new hues).
- Type: Young Serif for headings, Atkinson Hyperlegible for everything else.
- Motion only marks a change of state (unlock, complete, streak). anime.js for choreographed sequences, Motion for component state, CSS for hovers. Respect `prefers-reduced-motion`.
- Avoid: generic SaaS card grids, cream with terracotta, all-caps eyebrow labels, arrows on every button, any copyrighted characters or logos.

## Constraints
- WCAG 2.2 AA, generous tap targets (48px minimum), Australian English, prices in AUD.
- Privacy first: child profiles hold minimal data (first name, year group, school, tutor, parent).
- Invented content is always marked `placeholder: true` in the data.

## Access tiers (agreed default, 2026-10-30)
- `free`: Melody Island Module One, with an account.
- `taster` ($45): Melody Book One Modules Two to Four, Practice Cave, Songbook, TV Themes.
- `home` ($85): Melody Book Two, Harmony, Notation, Fundamentals.
- `member` (term, price TBC): everything, including Exam Island.
- Lessons: student marks "practised", then "I've got it" for complete. Unlocks need complete.
