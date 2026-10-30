# JazzRoc learning platform (frontend demo)

A clickable demo of Captain Roc's new online piano school: island map, lessons, practice log, parent, tutor and admin views. There is no backend yet. All data is mock data saved in your browser, built so Supabase can replace it later.

## Run it

```
npm install
npm run dev      # start the site at http://localhost:5173
npm run build    # production build into dist/
npm run check    # self-test of the unlock, streak and badge rules
```

## Demo script

Sign in at `/login` (no passwords) and pick a person:

| Who | Try this |
|---|---|
| Oliver (student) | Island map, open Melody Island, Module Two, a lesson. Start the ship's wheel timer, press "I've got it!". Then Practice log, Songbook, Badges. |
| Mia (student) | Taster course only, so several islands are locked. |
| Kim (parent) | Swipe between Oliver and Mia, "Practise as Oliver", Billing: pay for Mia's course, then sign in as Mia to see islands unlock. |
| Captain Roc (tutor) | My crew, open Chloe: set a lesson, write a note, tick the exam checklist. |
| Captain Roc (admin) | The bridge, Students (assign tutors, add courses), Content (edit any lesson), Exam interest, News. |

"Reset demo data" in the portal footer puts everything back.

## Where things live

```
src/
  app/          router, layouts, demo sign-in (AuthContext)
  components/   shared UI: IslandMap, PracticeChart, ShipWheelTimer, CoinBurst
    kokonut/    adapted Kokonut UI components (MIT)
    vengeance/  adapted VengeanceUI component (MIT)
  features/     pages: public, student, parent, tutor, admin, shared
  data/         seed data, one JSON file per future database table
  services/     the only code that reads or writes data (db.js is the storage layer)
  utils/        dates, practice streaks, badge rules, forms
scripts/check.mjs   rule checks run by npm run check
```

Pages only ever call `src/services/`. Swapping the mock layer for Supabase means rewriting the services, not the pages.

## Not real content yet

Anything invented for the demo is marked `placeholder: true` in `src/data/` and shows a dashed "Placeholder" tag on screen:

- Melody Island Modules Two to Eight, Harmony Island, Practice Cave lessons (real content is behind the old site password)
- Every video link, and every Songbook and TV Themes score
- Melody Module One PDF pages: the file for each page is guessed from the booklet naming pattern (`urlVerified: false`)
- Tom and Hugo's bios and all photos
- Demo students, parents, practice logs, notes and exam enquiries
- Which course unlocks which island, the Lesson Membership price, and the exam checklist wording
- The privacy policy is a draft for review

Design notes are in `PRODUCT.md`.
