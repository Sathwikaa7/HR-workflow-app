import type { WorkflowNodeType } from '../../types/workflow';

interface NodeDef {
  type: WorkflowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const NODE_DEFS: NodeDef[] = [
  { type: 'start', label: 'Start', icon: '▶', color: '#43e97b', description: 'Entry point' },
  { type: 'task', label: 'Task', icon: '📋', color: '#2196F3', description: 'Human task' },
  { type: 'approval', label: 'Approval', icon: '✅', color: '#FF9800', description: 'Manager approval' },
  { type: 'automated', label: 'Automated', icon: '⚙', color: '#9c27b0', description: 'System action' },
  { type: 'end', label: 'End', icon: '⏹', color: '#616161', description: 'Completion' },
];

export default function NodeSidebar() {
  const onDragStart = (e: React.DragEvent, nodeType: WorkflowNodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{
      width: 180,
      background: '#0f1117',
      borderRight: '1px solid #1e2130',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{
        color: '#4ade80',
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        ⬡ Node Library
      </div>

      {NODE_DEFS.map((node) => (
        <div
          key={node.type}
          draggable
          onDragStart={(e) => onDragStart(e, node.type)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${node.color}44`,
            background: `${node.color}11`,
            color: '#e2e8f0',
            cursor: 'grab',
            fontFamily: 'monospace',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = `${node.color}22`;
            (e.currentTarget as HTMLDivElement).style.borderColor = node.color;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = `${node.color}11`;
            (e.currentTarget as HTMLDivElement).style.borderColor = `${node.color}44`;
          }}
        >
          <span style={{ fontSize: 16 }}>{node.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: node.color }}>{node.label}</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>{node.description}</div>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 'auto',
        fontSize: 10,
        color: '#4a5568',
        fontFamily: 'monospace',
        lineHeight: 1.5,
      }}>
        Drag nodes onto the canvas to build your workflow
      </div>
    </div>
  );
}