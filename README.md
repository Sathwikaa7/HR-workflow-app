# HR Workflow Designer

A production-grade visual workflow builder for HR processes — built with React, TypeScript, and React Flow.

Demo: drag nodes from the sidebar, connect them, configure each step, then hit **Run Workflow** to simulate execution with a step-by-step log.

---

## How to Run

```bash
npm install
npm run dev
```

Open: http://localhost:5173

> A pre-loaded **Employee Onboarding Workflow** is ready on the canvas — hit **Run Workflow** immediately to see the simulation in action.

---

## Features

### Canvas
- Drag-and-drop node placement from the left sidebar
- Connect nodes by dragging between handles
- Select any node to configure it in the right panel
- Delete nodes/edges with the `Delete` key
- MiniMap and zoom/pan controls

### Node Types
| Type | Purpose | Key Fields |
|------|---------|------------|
| **Start** | Workflow entry point | Title, metadata key-value pairs |
| **Task** | Human task | Title, description, assignee, due date, custom fields |
| **Approval** | Manager/HR approval gate | Title, approver role, auto-approve threshold |
| **Automated Step** | System-triggered action | Title, action (from mock API), dynamic action params |
| **End** | Workflow completion | Title, end message, show summary toggle |

### Dynamic Configuration Forms
Each node type renders a different form in the right panel. Forms use controlled components with real-time canvas updates. The Automated Step node fetches available actions from the mock API layer (`GET /automations`) and renders dynamic parameter inputs based on the selected action.

### Mock API Layer (`src/api/workflowApi.ts`)
Simulates two endpoints with async delay:
- `GET /automations` — returns 6 mock automation actions (Send Email, Generate Document, Notify Slack, etc.) each with their own parameter schemas
- `POST /simulate` — accepts the workflow graph, traverses it from Start → End, returns a step-by-step execution log with per-node detail

### Workflow Simulation
- Validates the workflow structure before running (missing Start/End node, unconnected nodes, cycles)
- Validation errors are shown both globally in the panel and as red error badges directly on the affected nodes
- Successful runs show a numbered timeline log with per-step status and detail

### Undo / Redo
Full undo/redo history across node additions, deletions, configuration changes, and connections.
- `Ctrl+Z` / `Cmd+Z` — undo
- `Ctrl+Y` / `Ctrl+Shift+Z` — redo

### Export / Import
- **Export** (`Ctrl+S`) — downloads the current workflow as a `workflow_name.json` file
- **Import** — loads a previously exported `.json` file back onto the canvas, restoring all nodes, edges, and workflow name

### Workflow Naming
Click the workflow title in the top bar to rename it inline.

---

## Architecture

```
src/
├── api/
│   └── workflowApi.ts       # Mock API layer (getAutomations, simulateWorkflow, validateWorkflow)
├── components/
│   ├── nodes/               # One file per node type, typed with NodeProps<T>
│   │   ├── StartNode.tsx
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedStepNode.tsx
│   │   └── EndNode.tsx
│   ├── forms/
│   │   └── NodeConfigPanel.tsx   # Dynamic form panel — switches fields by node type
│   ├── sidebar/
│   │   └── NodeSidebar.tsx       # Drag-and-drop node library
│   └── simulation/
│       └── SimulationPanel.tsx   # Step-by-step execution log UI
├── types/
│   └── workflow.ts          # All TypeScript interfaces — NodeData, API types, exports
└── App.tsx                  # Canvas, state, drag-drop, undo/redo, export/import
```

### Key Design Decisions

**Separation of concerns** — Canvas state lives in `App.tsx`, API logic in `workflowApi.ts`, node rendering in individual components, form logic in `NodeConfigPanel`, simulation UI in `SimulationPanel`. No cross-cutting concerns.

**Type safety** — All node data uses discriminated union interfaces (`StartNodeData`, `TaskNodeData`, etc.) from `types/workflow.ts`. Node components are typed with `NodeProps<T>`. No `any` usage in the final code.

**Extensibility** — Adding a new node type requires: (1) a new interface in `types/workflow.ts`, (2) a new component in `components/nodes/`, (3) a new form block in `NodeConfigPanel`, (4) registering in `nodeTypes` in `App.tsx`. Nothing else needs to change.

**Generic update pattern** — `updateNodeData(key, value)` is a single function that handles all field updates for any node type, keeping `App.tsx` free of per-type branching.

**Mock API abstraction** — The API layer (`workflowApi.ts`) simulates real async network calls. Replacing mock data with real `fetch()` calls requires only changing that file.

**Undo/Redo** — Implemented as a simple array-based history stack (`useRef`) rather than a library. State snapshots are pushed on every meaningful action (drop, connect, configure).

---

## Validation Rules

| Rule | Scope |
|------|-------|
| Must have exactly one Start node | Global |
| Must have at least one End node | Global |
| Cycle detection (DFS) | Global |
| Every non-start node must have an incoming edge | Per-node badge |
| Every non-end node must have an outgoing edge | Per-node badge |
| Automated Step must have an action selected | Per-node badge |

---

## Trade-offs & Assumptions

- **Simulation is linear** — it follows the `yes` branch for approval nodes. A real implementation would branch and merge paths, requiring a proper graph traversal algorithm (BFS/DFS with fork-join).
- **No backend persistence** — state is in-memory. Export/Import JSON is provided as a substitute.
- **Approval branching** — the `no` handle is wired and visible; simulation currently follows `yes`. The `no` path could trigger a rejection sub-flow with more time.
- **History granularity** — undo/redo snapshots entire node/edge arrays. For very large graphs, a diff-based approach (like `immer` patches) would be more memory-efficient.

---

## What I Would Add With More Time

- Real graph traversal for branching/merging (handle `approval → no` path)
- Node templates (pre-configured workflow starters like "Onboarding", "Leave Approval")
- Auto-layout using `dagre`
- Workflow versioning / history
- Animated execution (highlight active node during simulation)
- Backend persistence with REST API + PostgreSQL

---

## Tech Stack

- **React 19** + **TypeScript**
- **React Flow v11** — canvas, custom nodes, edges
- **Vite** — build tooling

No UI library dependencies. All styling is inline CSS with a consistent dark-theme design system.