import { Handle, Position } from 'reactflow';

export default function EndNode({ data }: any) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: '#555',
      color: 'white',
      textAlign: 'center'
    }}>
      End

      <Handle type="target" position={Position.Left} />
    </div>
  );
}