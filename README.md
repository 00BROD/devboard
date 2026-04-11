# DevBoard

Project management for vibe coders — Kanban boards, todo lists, multi-project support. No backend, no sign-in. Everything lives in your browser's localStorage.

**Live:** [devboard on Vercel](https://devboard.vercel.app)

## Features

- Multi-project support — create, switch, and delete projects
- Drag-and-drop Kanban board (To Do / In Progress / Done)
- Task priority (High / Medium / Low) with color badges
- Due dates with overdue/today/upcoming coloring
- Expandable task descriptions
- Inline task title editing (double-click)
- Global todo list with checkbox, edit, delete, and clear completed
- All data persisted in localStorage — works offline

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |
| Storage | Browser localStorage |
| Runtime | React 19 |

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a full breakdown of components, data flow, and localStorage keys.
