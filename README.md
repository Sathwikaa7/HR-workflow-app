# HR Workflow Designer (React + React Flow)

## 📌 Overview

This project is a mini HR Workflow Designer that allows users to visually create and simulate workflows such as onboarding, document collection, and approval processes.

It demonstrates a modular, scalable frontend architecture with dynamic node configuration and workflow simulation.

---

## 🚀 Features

### 🧩 Workflow Canvas

* Drag-and-connect node system using React Flow
* Supports multiple node types
* Interactive graph-based workflow creation

### 🔷 Custom Node Types

* Start Node
* Task Node
* Approval Node

Each node is implemented as a reusable component.

---

### 📝 Dynamic Node Configuration

* Click a node to open configuration panel
* Form fields change based on node type:

  * Task → Title + Assignee
  * Approval → Title + Role
  * Start → Title only
* Real-time updates reflected on canvas

---

### ⚙️ Workflow Simulation

* “Run Workflow” button
* Simulates execution by reading node data
* Displays step-by-step execution output

---

## 🏗️ Architecture

The project follows a clean and modular structure:

* **Components**

  * Custom node components (Start, Task, Approval)
* **State Management**

  * React Flow hooks (`useNodesState`, `useEdgesState`)
* **Dynamic Forms**

  * Configurable panel based on node type
* **Separation of Concerns**

  * Canvas logic, node UI, and form handling are separated

---

## 🧠 Design Decisions

* Used **React Flow** for graph-based UI
* Implemented **custom node types** for scalability
* Used **controlled components** for form state
* Built a **generic update function** for node data handling
* Kept UI simple to prioritize functionality and architecture

---

## ⚖️ Trade-offs

* Simulation is mock-based (no backend integration)
* Workflow execution is linear (not graph traversal optimized)
* Minimal styling to focus on core logic

---

## ▶️ How to Run

```bash
npm install
npm run dev
```

Open:
http://localhost:5173

---

## 🔮 Future Improvements

* Add more node types (Automated, End node)
* Implement real graph traversal for simulation
* Add validation (start node first, no cycles)
* Export/import workflow JSON
* Improve UI/UX design

---

## 📎 Tech Stack

* React + TypeScript
* React Flow
* Vite

---

## 💡 What I Learned

* Building scalable component architecture
* Managing graph-based state
* Designing dynamic forms
* Handling real-time UI updates

---
