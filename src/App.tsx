import { useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import StartNode from './components/nodes/StartNode';
import TaskNode from './components/nodes/TaskNode';
import ApprovalNode from './components/nodes/ApprovalNode';
import EndNode from './components/nodes/EndNode';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  end: EndNode,
};

const initialNodes = [
  {
    id: '1',
    position: { x: 200, y: 150 },
    data: { label: 'Start Workflow' },
    type: 'start',
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]); // ✅ NEW

  const onConnect = (params: any) =>
    setEdges((eds) => addEdge(params, eds));

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  // ✅ ADD NODE
  const addNode = (type: string) => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label:
          type === 'task'
            ? 'New Task'
            : type === 'approval'
            ? 'New Approval'
            : type === 'end'
            ? 'End'
            : 'Node',
      },
      type,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // ✅ DELETE SUPPORT
  const onNodesDelete = (deleted: any) => {
    setNodes((nds) =>
      nds.filter((node) => !deleted.some((d: any) => d.id === node.id))
    );
  };

  const onEdgesDelete = (deleted: any) => {
    setEdges((eds) =>
      eds.filter((edge) => !deleted.some((d: any) => d.id === edge.id))
    );
  };

  // ✅ UPDATE NODE DATA
  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, [key]: value } }
          : node
      )
    );

    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, [key]: value },
    });
  };

  // ✅ WORKFLOW SIMULATION WITH BRANCHING
  const simulateWorkflow = () => {
    const startNode = nodes.find((n) => n.type === 'start');

    if (!startNode) {
      setLogs(["❌ No Start Node found"]);
      return;
    }

    let current = startNode;
    let visited = new Set<string>();
    let steps: string[] = [];

    while (current && !visited.has(current.id)) {
      visited.add(current.id);

      const data = current.data as any;
      let extra = "";

      if (current.type === "task") {
        extra = ` (Assignee: ${data.assignee || "N/A"})`;
      }

      if (current.type === "approval") {
        extra = ` (Role: ${data.role || "N/A"})`;
      }

      steps.push(`Step: ${data.label}${extra}`);

      let nextEdge;

      // 🔥 branching logic
      if (current.type === "approval") {
        nextEdge = edges.find(
          (e) => e.source === current.id && e.sourceHandle === "yes"
        );
      } else {
        nextEdge = edges.find((e) => e.source === current.id);
      }

      if (!nextEdge) break;

      const nextNode = nodes.find((n) => n.id === nextEdge.target);
      if (!nextNode) break;

      current = nextNode;
    }

    setLogs(steps); // ✅ instead of alert
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* 🔥 ADD NODE BUTTONS */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 10,
          zIndex: 9999,
          display: 'flex',
          gap: 5,
        }}
      >
        <button onClick={() => addNode('task')}>+ Task</button>
        <button onClick={() => addNode('approval')}>+ Approval</button>
        <button onClick={() => addNode('end')}>+ End</button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: 300,
          minWidth: 300,
          background: '#f5f5f5',
          borderLeft: '1px solid #ccc',
          padding: 12,
          overflowY: 'auto',
        }}
      >
        <h3>Edit Node</h3>

        {selectedNode ? (
          <>
            <input
              type="text"
              placeholder="Title"
              value={selectedNode.data?.label || ''}
              onChange={(e) =>
                updateNodeData('label', e.target.value)
              }
              style={{ width: '100%', marginBottom: 10, padding: 6 }}
            />

            {selectedNode.type === 'task' && (
              <input
                type="text"
                placeholder="Assignee"
                value={selectedNode.data?.assignee || ''}
                onChange={(e) =>
                  updateNodeData('assignee', e.target.value)
                }
                style={{ width: '100%', marginBottom: 10, padding: 6 }}
              />
            )}

            {selectedNode.type === 'approval' && (
              <input
                type="text"
                placeholder="Approver Role"
                value={selectedNode.data?.role || ''}
                onChange={(e) =>
                  updateNodeData('role', e.target.value)
                }
                style={{ width: '100%', marginBottom: 10, padding: 6 }}
              />
            )}
          </>
        ) : (
          <p>Click a node to edit</p>
        )}

        {/* 🔥 EXECUTION LOG PANEL */}
        <hr />

        <h3>Execution Log</h3>

        <div
          style={{
            background: '#111',
            color: '#0f0',
            padding: 10,
            height: 200,
            overflowY: 'auto',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {logs.length === 0 ? (
            <p>No execution yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index}>• {log}</div>
            ))
          )}
        </div>
      </div>

      {/* RUN BUTTON */}
      <button
        onClick={simulateWorkflow}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '8px 12px',
          background: '#000',
          color: '#fff',
          border: 'none',
          zIndex: 9999,
          cursor: 'pointer',
        }}
      >
        Run Workflow
      </button>

    </div>
  );
}

export default App;