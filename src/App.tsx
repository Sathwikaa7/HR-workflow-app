import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import StartNode from './components/nodes/StartNode';
import TaskNode from './components/nodes/TaskNode';
import ApprovalNode from './components/nodes/ApprovalNode';
import AutomatedStepNode from './components/nodes/AutomatedStepNode';
import EndNode from './components/nodes/EndNode';
import NodeSidebar from './components/sidebar/NodeSideBar';
import NodeConfigPanel from './components/forms/NodeConfigPanel';
import SimulationPanel from './components/simulation/SimulationPanel';

import { simulateWorkflow, validateWorkflow } from './api/workflowApi';
import type { SimulationResult, WorkflowNodeType, WorkflowExport } from './types/workflow';

// ─── Node type registry ───────────────────────────────────────────────────────

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedStepNode,
  end: EndNode,
};

const defaultLabel: Record<WorkflowNodeType, string> = {
  start: 'Start Workflow',
  task: 'New Task',
  approval: 'Approval Step',
  automated: 'Automated Step',
  end: 'End',
};

// ─── Pre-loaded demo: Employee Onboarding Workflow ───────────────────────────

const initialNodes: Node[] = [
  {
    id: '1', type: 'start',
    position: { x: 60, y: 200 },
    data: { label: 'Start Onboarding', metadata: [{ key: 'trigger', value: 'new_hire' }] },
  },
  {
    id: '2', type: 'task',
    position: { x: 280, y: 120 },
    data: { label: 'Collect Documents', assignee: 'hr.team', dueDate: '2025-05-01', description: 'Collect ID proof, address proof, and educational certificates from the new hire.' },
  },
  {
    id: '3', type: 'task',
    position: { x: 280, y: 300 },
    data: { label: 'IT Setup Request', assignee: 'it.support', dueDate: '2025-05-02', description: 'Provision laptop, email account, and system access for the new employee.' },
  },
  {
    id: '4', type: 'approval',
    position: { x: 520, y: 200 },
    data: { label: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 80 },
  },
  {
    id: '5', type: 'automated',
    position: { x: 760, y: 120 },
    data: { label: 'Send Welcome Email', actionId: 'send_email', actionParams: [{ key: 'to', value: 'new.hire@company.com' }, { key: 'subject', value: 'Welcome to the team!' }] },
  },
  {
    id: '6', type: 'automated',
    position: { x: 760, y: 300 },
    data: { label: 'Generate Offer Letter', actionId: 'generate_doc', actionParams: [{ key: 'template', value: 'offer_letter_v2' }, { key: 'recipient', value: 'new.hire@company.com' }] },
  },
  {
    id: '7', type: 'end',
    position: { x: 1020, y: 200 },
    data: { label: 'Onboarding Complete', endMessage: 'Employee successfully onboarded!', showSummary: true },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e4-5', source: '4', target: '5', sourceHandle: 'yes', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e4-6', source: '4', target: '6', sourceHandle: 'yes', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e5-7', source: '5', target: '7', animated: true, style: { stroke: '#4ade8066' } },
  { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#4ade8066' } },
];

let idCounter = 8;
const nextId = () => String(idCounter++);

// ─── Undo/Redo history ────────────────────────────────────────────────────────

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowName, setWorkflowName] = useState('Employee Onboarding Workflow');
  const [editingName, setEditingName] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ─── Undo/Redo ──────────────────────────────────────────────────────────────
  const history = useRef<HistoryEntry[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const historyIndex = useRef(0);

  const pushHistory = useCallback((n: Node[], e: Edge[]) => {
    // Drop future history when new action is taken
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push({ nodes: n, edges: e });
    historyIndex.current = history.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return;
    historyIndex.current--;
    const entry = history.current[historyIndex.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return;
    historyIndex.current++;
    const entry = history.current[historyIndex.current];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // ─── Connection ─────────────────────────────────────────────────────────────

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true, style: { stroke: '#4ade8066' } }, eds);
        pushHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, pushHistory]
  );

  // ─── Node click ─────────────────────────────────────────────────────────────

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  // ─── Update node data ────────────────────────────────────────────────────────

  const updateNodeData = useCallback((key: string, value: unknown) => {
    if (!selectedNode) return;
    setNodes((nds) => {
      const updated = nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: value } } : n
      );
      pushHistory(updated, edges);
      return updated;
    });
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, [key]: value } } : null
    );
  }, [selectedNode, setNodes, edges, pushHistory]);

  // ─── Drag-and-drop ───────────────────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
    if (!type || !rfInstance || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });

    const newNode: Node = {
      id: nextId(),
      type,
      position,
      data: { label: defaultLabel[type] },
    };

    setNodes((nds) => {
      const updated = [...nds, newNode];
      pushHistory(updated, edges);
      return updated;
    });
  }, [rfInstance, setNodes, edges, pushHistory]);

  // ─── Validate and mark nodes with errors ─────────────────────────────────────

  const applyValidationToNodes = useCallback((n: Node[], e: Edge[]) => {
    const { globalErrors, nodeErrors } = validateWorkflow(n, e);

    const errorMap = new Map<string, string>();
    nodeErrors.forEach(({ nodeId, message }) => errorMap.set(nodeId, message));

    const markedNodes = n.map((node) => ({
      ...node,
      data: {
        ...node.data,
        hasError: errorMap.has(node.id),
        errorMessage: errorMap.get(node.id),
      },
    }));

    setNodes(markedNodes);
    return globalErrors;
  }, [setNodes]);

  // ─── Simulation ──────────────────────────────────────────────────────────────

  const runSimulation = useCallback(async () => {
    const globalErrors = applyValidationToNodes(nodes, edges);
    const { nodeErrors } = validateWorkflow(nodes, edges);

    const allErrors = [
      ...globalErrors,
      ...nodeErrors.map(({ message }) => message),
    ];

    setValidationErrors(allErrors);

    if (allErrors.length > 0) {
      setSimResult(null);
      return;
    }

    setIsRunning(true);
    setSimResult(null);
    try {
      const result = await simulateWorkflow(nodes, edges);
      setSimResult(result);
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, applyValidationToNodes]);

  // ─── Export JSON ─────────────────────────────────────────────────────────────

  const exportWorkflow = useCallback(() => {
    const payload: WorkflowExport = {
      version: '1.0',
      name: workflowName,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workflow exported!');
  }, [nodes, edges, workflowName]);

  // ─── Import JSON ─────────────────────────────────────────────────────────────

  const importWorkflow = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as WorkflowExport;
        if (!data.nodes || !data.edges) throw new Error('Invalid format');
        setNodes(data.nodes as Node[]);
        setEdges(data.edges as Edge[]);
        if (data.name) setWorkflowName(data.name);
        pushHistory(data.nodes as Node[], data.edges as Edge[]);
        showToast('Workflow imported!');
      } catch {
        showToast('Failed to import — invalid JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setNodes, setEdges, pushHistory]);

  // ─── Toast ───────────────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ─── Clear canvas ────────────────────────────────────────────────────────────

  const clearCanvas = useCallback(() => {
    const fresh: Node[] = [
      { id: nextId(), position: { x: 220, y: 220 }, data: { label: 'Start Workflow' }, type: 'start' },
    ];
    setNodes(fresh);
    setEdges([]);
    setSelectedNode(null);
    setSimResult(null);
    setValidationErrors([]);
    pushHistory(fresh, []);
  }, [setNodes, setEdges, pushHistory]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); exportWorkflow(); }
  }, [undo, redo, exportWorkflow]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#080b14', fontFamily: 'monospace' }}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importWorkflow} />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#4ade8022', border: '1px solid #4ade80', borderRadius: 8,
          color: '#4ade80', fontFamily: 'monospace', fontSize: 12,
          padding: '8px 20px', zIndex: 99999, pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* ── Left: Node Library ── */}
      <NodeSidebar />

      {/* ── Center: Canvas ── */}
      <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          background: '#0a0d1688', backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1e2130',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#4ade80', fontSize: 11, letterSpacing: 2, opacity: 0.7 }}>⬡</span>
            {editingName ? (
              <input
                autoFocus
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                style={{
                  background: 'transparent', border: 'none', borderBottom: '1px solid #4ade80',
                  color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13, outline: 'none',
                  width: 220, padding: '0 2px',
                }}
              />
            ) : (
              <span
                style={{ color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}
                onClick={() => setEditingName(true)}
                title="Click to rename"
              >
                {workflowName} <span style={{ color: '#4a5568', fontSize: 10 }}>✎</span>
              </span>
            )}
          </div>

          {/* Center: Stats */}
          <span style={{ color: '#4a5568', fontSize: 10 }}>
            {nodes.length} nodes · {edges.length} edges
          </span>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Undo */}
            <button onClick={undo} title="Undo (Ctrl+Z)" style={toolBtn}>↩</button>
            {/* Redo */}
            <button onClick={redo} title="Redo (Ctrl+Y)" style={toolBtn}>↪</button>
            {/* Export */}
            <button onClick={exportWorkflow} title="Export JSON (Ctrl+S)" style={toolBtn}>⬇ Export</button>
            {/* Import */}
            <button onClick={() => fileInputRef.current?.click()} title="Import JSON" style={toolBtn}>⬆ Import</button>
            {/* Clear */}
            <button onClick={clearCanvas} title="Clear canvas" style={{ ...toolBtn, color: '#f8717188' }}>✕ Clear</button>
            {/* Run */}
            <button onClick={runSimulation} disabled={isRunning} style={{
              padding: '6px 16px',
              background: isRunning ? '#1e2130' : '#4ade8022',
              border: `1px solid ${isRunning ? '#2d3748' : '#4ade80'}`,
              borderRadius: 6,
              color: isRunning ? '#4a5568' : '#4ade80',
              fontFamily: 'monospace', fontSize: 11,
              cursor: isRunning ? 'not-allowed' : 'pointer', letterSpacing: 1,
            }}>
              {isRunning ? '⟳ Simulating...' : '▶ Run Workflow'}
            </button>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
          style={{ background: '#080b14' }}
        >
          <Background color="#1a2035" gap={24} size={1} />
          <Controls style={{ background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8 }} />
          <MiniMap
            style={{ background: '#0f1117', border: '1px solid #1e2130' }}
            nodeColor={(n) => {
              const colors: Record<string, string> = {
                start: '#4ade80', task: '#2196F3',
                approval: '#FF9800', automated: '#9c27b0', end: '#616161',
              };
              return colors[n.type ?? ''] ?? '#4a5568';
            }}
          />
        </ReactFlow>
      </div>

      {/* ── Right: Config + Simulation ── */}
      <div style={{
        width: 290, minWidth: 290,
        background: '#0f1117', borderLeft: '1px solid #1e2130',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ borderBottom: '1px solid #1e2130', overflowY: 'auto', maxHeight: '55%' }}>
          <NodeConfigPanel selectedNode={selectedNode} onUpdate={updateNodeData} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <SimulationPanel
            result={simResult}
            validationErrors={validationErrors}
            isRunning={isRunning}
            onRun={runSimulation}
            onClear={() => { setSimResult(null); setValidationErrors([]); }}
          />
        </div>
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  padding: '5px 10px', background: 'transparent',
  border: '1px solid #2d3748', borderRadius: 6,
  color: '#94a3b8', fontFamily: 'monospace', fontSize: 11,
  cursor: 'pointer',
};