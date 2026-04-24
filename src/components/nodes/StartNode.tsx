import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { StartNodeData } from '../../types/workflow';

export default function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 10,
      background: selected
        ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
        : 'linear-gradient(135deg, #43e97b, #38f9d7)',
      color: 'white',
      textAlign: 'center',
      minWidth: 150,
      boxShadow: data.hasError
        ? '0 0 0 2px #f87171, 0 0 12px #f8717144'
        : selected
        ? '0 0 0 2px #fff, 0 0 0 4px #2ecc71'
        : '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: 1,
      transition: 'box-shadow 0.15s',
      position: 'relative',
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>▶</div>
      {data.label}
      {data.metadata && data.metadata.length > 0 && (
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.85 }}>
          {data.metadata.map((m) => `${m.key}: ${m.value}`).join(' · ')}
        </div>
      )}
      {data.hasError && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          background: '#f87171', borderRadius: '50%',
          width: 16, height: 16, fontSize: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, color: '#fff',
        }}>!</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}