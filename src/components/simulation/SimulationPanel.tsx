import type { SimulationResult } from '../../types/workflow';

interface Props {
  result: SimulationResult | null;
  validationErrors: string[];
  isRunning: boolean;
  onRun: () => void;
  onClear: () => void;
}

const statusColor = { success: '#4ade80', skipped: '#fbbf24', error: '#f87171' };

const nodeTypeIcon: Record<string, string> = {
  start: '▶', task: '📋', approval: '✅', automated: '⚙', end: '⏹',
};

export default function SimulationPanel({ result, validationErrors, isRunning, onRun, onClear }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #1e2130',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 10, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase' }}>
          ◈ Simulation
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onRun} disabled={isRunning} style={{
            padding: '5px 12px',
            background: isRunning ? '#1e2130' : '#4ade8022',
            border: `1px solid ${isRunning ? '#2d3748' : '#4ade80'}`,
            borderRadius: 6, color: isRunning ? '#4a5568' : '#4ade80',
            fontSize: 11, cursor: isRunning ? 'not-allowed' : 'pointer', letterSpacing: 1,
          }}>
            {isRunning ? '⟳ Running...' : '▶ Run'}
          </button>
          <button onClick={onClear} style={{
            padding: '5px 10px', background: 'transparent',
            border: '1px solid #2d3748', borderRadius: 6,
            color: '#4a5568', fontSize: 11, cursor: 'pointer',
          }}>✕</button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e2130' }}>
          <div style={{ fontSize: 10, color: '#f87171', marginBottom: 6, letterSpacing: 1 }}>
            ⚠ VALIDATION ERRORS
          </div>
          {validationErrors.map((err, i) => (
            <div key={i} style={{
              fontSize: 11, color: '#f87171',
              background: '#f8717111', border: '1px solid #f8717133',
              borderRadius: 4, padding: '4px 8px', marginBottom: 4,
            }}>{err}</div>
          ))}
        </div>
      )}

      {/* Steps */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
        {!result && validationErrors.length === 0 && (
          <div style={{ color: '#4a5568', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.3 }}>⬡</div>
            Press Run to simulate your workflow
          </div>
        )}

        {result?.error && (
          <div style={{
            background: '#f8717111', border: '1px solid #f8717133',
            borderRadius: 6, padding: '8px 12px',
            color: '#f87171', fontSize: 11, marginBottom: 8,
          }}>✗ {result.error}</div>
        )}

        {result?.success && (
          <div style={{
            background: '#4ade8011', border: '1px solid #4ade8033',
            borderRadius: 6, padding: '6px 12px',
            color: '#4ade80', fontSize: 11, marginBottom: 12,
          }}>
            ✓ Completed — {result.steps.length} steps executed
          </div>
        )}

        {result?.steps.map((step, i) => (
          <div key={step.nodeId} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: `${statusColor[step.status]}22`,
                border: `1px solid ${statusColor[step.status]}`,
                color: statusColor[step.status],
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              {i < result.steps.length - 1 && (
                <div style={{ width: 1, flex: 1, background: '#1e2130', minHeight: 14 }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: 2 }}>
              <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>
                {nodeTypeIcon[step.nodeType] || '·'} {step.label}
              </div>
              {step.detail && (
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>
                  {step.detail}
                </div>
              )}
              <div style={{ fontSize: 10, color: statusColor[step.status], marginTop: 2 }}>
                ● {step.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}