import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { EndNodeData } from '../../types/workflow';

export default function EndNode({ data, selected }: NodeProps<EndNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 10,
      background: selected
        ? 'linear-gradient(135deg, #212121, #424242)'
        : 'linear-gradient(135deg, #616161, #9e9e9e)',
      color: 'white',
      textAlign: 'center',
      minWidth: 140,
      boxShadow: data.hasError
        ? '0 0 0 2px #f87171, 0 0 12px #f8717144'
        : selected
        ? '0 0 0 2px #fff, 0 0 0 4px #616161'
        : '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: 'monospace',
      transition: 'box-shadow 0.15s',
      position: 'relative',
    }}>
      <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 2, letterSpacing: 1 }}>END</div>
      <div style={{ fontWeight: 700, fontSize: 13 }}>⏹ {data.label}</div>
      {data.endMessage && (
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>{data.endMessage}</div>
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
      <Handle type="target" position={Position.Left} />
    </div>
  );
}