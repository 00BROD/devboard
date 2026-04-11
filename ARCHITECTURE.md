# DevBoard — Architecture Documentation

## Overview

A project management tool for vibe coders, built with Next.js 16, Tailwind CSS v4, and TypeScript. Features multi-project support, a drag-and-drop Kanban board per project, and a global Todo list. All data is persisted entirely in the browser via localStorage — no backend, no database, no sign-in required.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |
| Storage | Browser localStorage |
| Runtime | React 19 |

## Project Structure

```
project-manager/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Root page — renders header + ProjectManager
│   │   ├── layout.tsx            # Root layout — sets fonts, title, meta description
│   │   └── globals.css           # Tailwind import + CSS custom properties
│   ├── components/
│   │   ├── ProjectManager.tsx    # Client component — owns project state, renders all sub-components
│   │   ├── ProjectSelector.tsx   # Project tab pills — create, switch, delete projects
│   │   ├── KanbanBoard.tsx       # Drag-and-drop Kanban board (per project)
│   │   └── TodoList.tsx          # Global checklist-style todo list
│   └── types.ts                  # Shared TypeScript interfaces
├── ARCHITECTURE.md               # This file
├── package.json
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

## Core Types (`src/types.ts`)

```typescript
Priority      // 'high' | 'medium' | 'low'
Task          // Kanban card: { id, title, description?, priority?, dueDate? }
KanbanColumn  // Column: { id: 'todo'|'inprogress'|'done', title, tasks: Task[] }
TodoItem      // Todo entry: { id, text, completed }
Project       // Project: { id, name }
```

## Component Details

### `page.tsx` — Root Page

Server component. Renders the full-page layout:
- Dark header with app name ("DevBoard") and subtitle
- `<ProjectManager />` (handles all interactive state)

---

### `ProjectManager` (`src/components/ProjectManager.tsx`)

Client component (`'use client'`) that owns the top-level project state.

**State:**
- `projects: Project[]` — list of all projects, lazy-loaded from localStorage
- `activeId: string` — currently selected project ID, lazy-loaded from localStorage

**Responsibilities:**
- Renders `<ProjectSelector>`, `<KanbanBoard key={activeId}>`, and `<TodoList>`
- `key={activeId}` on KanbanBoard causes remount (fresh state) when switching projects
- Passes project CRUD handlers down to ProjectSelector

**localStorage Keys:**
| Key | Data |
|---|---|
| `pm-projects` | `Project[]` |
| `pm-active` | `string` (active project ID) |

---

### `ProjectSelector` (`src/components/ProjectSelector.tsx`)

Client component (`'use client'`) that renders project tab pills.

**Props:** `projects`, `activeId`, `onSelect`, `onAdd`, `onDelete`

**Interactions:**
| Action | How |
|---|---|
| Switch project | Click a project pill |
| Create project | Click "+ New Project" → type name → Enter or click Add |
| Delete project | Hover pill → click `×` (hidden when only 1 project exists) |

---

### `KanbanBoard` (`src/components/KanbanBoard.tsx`)

Client component (`'use client'`). Receives `projectId: string` as a prop. Each project gets its own isolated Kanban board stored under `kanban-${projectId}`.

**Columns:**
- **To Do** — new tasks land here
- **In Progress** — work underway
- **Done** — finished tasks

**State:**
- `columns: KanbanColumn[]` — lazy-initialized from localStorage at mount
- `newTitle / newDesc / newDue / newPriority / showDetails` — add task form
- `draggedTask` — task being dragged + source column
- `editingTaskId / editingTitle` — inline title edit
- `expandedTaskId` — which card is expanded to show description

**localStorage:**
- Key: `kanban-${projectId}`
- Loaded via lazy `useState` initializer (runs once at mount)
- Saved via `useEffect` on every `columns` change, skipping first render with `useRef` flag

**Interactions:**
| Action | How |
|---|---|
| Add task | Type title, select priority, optionally expand Details (description + due date), press Enter or Add |
| Delete task | Hover card → click `×` |
| Edit task title | Double-click title → inline input, blur or Enter to save |
| Move task | HTML5 drag-and-drop between columns |
| Expand task | Click title → shows description below card |
| Priority badge | Color-coded pill: red=High, yellow=Medium, green=Low |
| Due date badge | Color-coded: red=overdue, yellow=due today, green=upcoming |

---

### `TodoList` (`src/components/TodoList.tsx`)

Client component (`'use client'`). Global todo list shared across all projects.

**State:**
- `todos: TodoItem[]` — lazy-initialized from localStorage
- `newTodo / editingId / editingText` — form and edit state

**localStorage:**
- Key: `todo-list`

**Interactions:**
| Action | How |
|---|---|
| Add todo | Type, press Enter or click Add |
| Complete todo | Click checkbox → strikes through text |
| Edit todo | Double-click text → inline input, blur or Enter to save |
| Delete todo | Hover → click `×` |
| Progress | Header shows `(X/Y completed)` |
| Clear completed | Button appears when ≥1 done → removes all completed items |

---

## Data Flow

```
User action
    │
    ▼
React state update (useState setter)
    │
    ▼
useEffect detects change → localStorage.setItem(key, JSON.stringify(state))
    │
    ▼  (on next page load / project switch)
useState lazy initializer → localStorage.getItem(key) → JSON.parse → initial state
```

No prop-drilling beyond immediate parent. Each component manages its own isolated state and storage key.

## localStorage Keys

| Key | Component | Data Shape |
|---|---|---|
| `pm-projects` | ProjectManager | `Project[]` |
| `pm-active` | ProjectManager | `string` (active project ID) |
| `kanban-${projectId}` | KanbanBoard | `KanbanColumn[]` (3 items) |
| `todo-list` | TodoList | `TodoItem[]` |

## Running the App

```bash
cd project-manager

# Install dependencies
npm install

# Development (http://localhost:3000)
npm run dev

# Production build + start
npm run build
npm start

# Lint
npm run lint
```

## Extending the App

**Add a new Kanban column:** Add the id to `KanbanColumn['id']` union in `types.ts` and push a new entry to `defaultColumns` in `KanbanBoard.tsx`.

**Add task tags/labels:** Extend the `Task` type with a `tags?: string[]` field and add a tag input to the Details form.

**Per-project todos:** Move `<TodoList />` inside the project-scoped section and pass `projectId` as a prop, using `todo-${projectId}` as the localStorage key.
