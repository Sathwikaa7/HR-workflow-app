import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { AutomatedStepNodeData } from '../../types/workflow';
import { MOCK_AUTOMATIONS } from '../../api/workflowApi';

export default function AutomatedStepNode({ data, selected }: NodeProps<AutomatedStepNodeData>) {
  const action = MOCK_AUTOMATIONS.find((a) => a.id === data.actionId);
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 10,
      background: selected
        ? 'linear-gradient(135deg, #6a1b9a, #7b1fa2)'
        : 'linear-gradient(135deg, #9c27b0, #ce93d8)',
      color: 'white',
      minWidth: 160,
      boxShadow: data.hasError
        ? '0 0 0 2px #f87171, 0 0 12px #f8717144'
        : selected
        ? '0 0 0 2px #fff, 0 0 0 4px #9c27b0'
        : '0 4px 12px rgba(0,0,0,0.2)',
      fontFamily: 'monospace',
      transition: 'box-shadow 0.15s',
      position: 'relative',
    }}>
      <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 2, letterSpacing: 1 }}>⚙ AUTOMATED</div>
      <div style={{ fontWeight: 700, fontSize: 13 }}>{data.label}</div>
      {action && (
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9 }}>🤖 {action.label}</div>
      )}
      {!data.actionId && (
        <div style={{ fontSize: 10, marginTop: 4, color: '#fde68a' }}>⚠ No action set</div>
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
      <Handle type="source" position={Position.Right} />
    </div>
  );
}