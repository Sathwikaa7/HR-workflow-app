import { Handle, Position } from 'reactflow';

export default function TaskNode({ data }: any) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: '#2196F3',
      color: 'white'
    }}>
      {data.label}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}