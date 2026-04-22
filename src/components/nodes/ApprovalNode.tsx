import { Handle, Position } from 'reactflow';

export default function ApprovalNode({ data }: any) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: '#FF9800',
      color: 'white',
      textAlign: 'center',
      minWidth: 140,
    }}>
      {data.label}

      {/* INPUT */}
      <Handle type="target" position={Position.Left} />

      {/* YES PATH */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ top: '30%', background: 'green' }}
      />

      {/* NO PATH */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ top: '70%', background: 'red' }}
      />
      <Handle type="source" position={Position.Right} id="yes" />
<Handle type="source" position={Position.Right} id="no" />
    </div>
  );
}