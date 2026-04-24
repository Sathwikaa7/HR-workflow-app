import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ApprovalNodeData } from '../../types/workflow';

export default function ApprovalNode({ data, selected }: NodeProps<ApprovalNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 10,
      background: selected
        ? 'linear-gradient(135deg, #e65100, #f57c00)'
        : 'linear-gradient(135deg, #FF9800, #FFb74d)',
      color: 'white',
      textAlign: 'center',
      minWidth: 160,
      boxShadow: data.hasError
        ? '0 0 0 2px #f87171, 0 0 12px #f8717144'
        : selected
        ? '0 0 0 2px #fff, 0 0 0 4px #FF9800'
        : '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: 'monospace',
      transition: 'box-shadow 0.15s',
      position: 'relative',
    }}>
      <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 2, letterSpacing: 1 }}>APPROVAL</div>
      <div style={{ fontWeight: 700, fontSize: 13 }}>{data.label}</div>
      {data.approverRole && (
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>🔑 {data.approverRole}</div>
      )}
      <div style={{
        position: 'absolute', right: -46, top: '24%',
        fontSize: 10, color: '#4ade80', fontWeight: 700,
      }}>YES</div>
      <div style={{
        position: 'absolute', right: -38, top: '64%',
        fontSize: 10, color: '#f87171', fontWeight: 700,
      }}>NO</div>
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
      <Handle type="source" position={Position.Right} id="yes"
        style={{ top: '30%', background: '#4ade80', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} id="no"
        style={{ top: '70%', background: '#f87171', width: 10, height: 10 }} />
    </div>
  );
}