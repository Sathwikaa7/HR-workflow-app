import { Handle, Position } from 'reactflow';

export default function StartNode({ data }: any) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: '#4CAF50',
      color: 'white',
      textAlign: 'center'
    }}>
      {data.label}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}