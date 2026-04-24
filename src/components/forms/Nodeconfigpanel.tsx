import { useEffect, useState } from 'react';
import type { Node } from 'reactflow';
import type { AutomationAction } from '../../types/workflow';
import { getAutomations } from '../../api/workflowApi';

interface Props {
  selectedNode: Node | null;
  onUpdate: (key: string, value: unknown) => void;
}

const label: React.CSSProperties = {
  fontSize: 10,
  color: '#94a3b8',
  fontFamily: 'monospace',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 3,
  marginTop: 10,
  display: 'block',
};

const inp: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  background: '#1a1f2e',
  border: '1px solid #2d3748',
  borderRadius: 6,
  color: '#e2e8f0',
  fontFamily: 'monospace',
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
};

const NODE_ACCENT: Record<string, string> = {
  start: '#4ade80',
  task: '#2196F3',
  approval: '#FF9800',
  automated: '#9c27b0',
  end: '#9e9e9e',
};

export default function NodeConfigPanel({ selectedNode, onUpdate }: Props) {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAutomations()
      .then(setAutomations)
      .finally(() => setLoading(false));
  }, []);

  if (!selectedNode) {
    return (
      <div style={{ padding: 20, color: '#4a5568', fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🖱</div>
        <div>Click a node to configure it</div>
        <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6 }}>
          Drag nodes from the library onto the canvas
        </div>
      </div>
    );
  }

  const data = selectedNode.data as Record<string, unknown>;
  const type = selectedNode.type ?? '';
  const accent = NODE_ACCENT[type] ?? '#4ade80';

  const selectedAction = automations.find((a) => a.id === (data.actionId as string));

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        fontSize: 10,
        color: accent,
        fontFamily: 'monospace',
        letterSpacing: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8,
          borderRadius: '50%', background: accent,
        }} />
        Configure · {type.toUpperCase()}
      </div>

      {/* ── Label (all nodes) ── */}
      <span style={label}>Title *</span>
      <input
        style={inp}
        placeholder="Node title"
        value={(data.label as string) || ''}
        onChange={(e) => onUpdate('label', e.target.value)}
      />

      {/* ── START NODE ── */}
      {type === 'start' && (
        <>
          <span style={label}>Metadata (key-value)</span>
          <MetadataEditor
            value={(data.metadata as { key: string; value: string }[]) || []}
            onChange={(v) => onUpdate('metadata', v)}
          />
        </>
      )}

      {/* ── TASK NODE ── */}
      {type === 'task' && (
        <>
          <span style={label}>Description</span>
          <textarea
            style={{ ...inp, resize: 'vertical', minHeight: 56 }}
            placeholder="Describe the task..."
            value={(data.description as string) || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
          />
          <span style={label}>Assignee</span>
          <input
            style={inp}
            placeholder="e.g. john.doe"
            value={(data.assignee as string) || ''}
            onChange={(e) => onUpdate('assignee', e.target.value)}
          />
          <span style={label}>Due Date</span>
          <input
            type="date"
            style={inp}
            value={(data.dueDate as string) || ''}
            onChange={(e) => onUpdate('dueDate', e.target.value)}
          />
          <span style={label}>Custom Fields</span>
          <MetadataEditor
            value={(data.customFields as { key: string; value: string }[]) || []}
            onChange={(v) => onUpdate('customFields', v)}
          />
        </>
      )}

      {/* ── APPROVAL NODE ── */}
      {type === 'approval' && (
        <>
          <span style={label}>Approver Role</span>
          <select
            style={inp}
            value={(data.approverRole as string) || ''}
            onChange={(e) => onUpdate('approverRole', e.target.value)}
          >
            <option value="">Select role...</option>
            <option value="Manager">Manager</option>
            <option value="HRBP">HRBP</option>
            <option value="Director">Director</option>
            <option value="VP">VP</option>
            <option value="CEO">CEO</option>
          </select>
          <span style={label}>Auto-approve Threshold (%)</span>
          <input
            type="number"
            style={inp}
            placeholder="e.g. 80"
            min={0}
            max={100}
            value={(data.autoApproveThreshold as number) ?? ''}
            onChange={(e) => onUpdate('autoApproveThreshold', Number(e.target.value))}
          />
          <div style={{ fontSize: 10, color: '#4a5568', fontFamily: 'monospace', marginTop: 3 }}>
            Auto-approve if confidence score exceeds this
          </div>
        </>
      )}

      {/* ── AUTOMATED STEP NODE ── */}
      {type === 'automated' && (
        <>
          <span style={label}>Action {loading && <span style={{ color: '#4a5568' }}>(loading...)</span>}</span>
          <select
            style={inp}
            value={(data.actionId as string) || ''}
            onChange={(e) => {
              onUpdate('actionId', e.target.value);
              onUpdate('actionParams', []);
            }}
            disabled={loading}
          >
            <option value="">Select action...</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>

          {selectedAction && selectedAction.params.length > 0 && (
            <>
              <span style={{ ...label, marginTop: 10 }}>Action Parameters</span>
              {selectedAction.params.map((param) => {
                const params = (data.actionParams as Array<{ key: string; value: string }>) || [];
                const paramVal = params.find((p) => p.key === param)?.value || '';
                return (
                  <div key={param} style={{ marginBottom: 6 }}>
                    <span style={{ ...label, marginTop: 4 }}>{param}</span>
                    <input
                      style={inp}
                      placeholder={`Enter ${param}...`}
                      value={paramVal}
                      onChange={(e) => {
                        const existing = (data.actionParams as Array<{ key: string; value: string }>) || [];
                        const updated = existing.filter((p) => p.key !== param);
                        onUpdate('actionParams', [...updated, { key: param, value: e.target.value }]);
                      }}
                    />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {/* ── END NODE ── */}
      {type === 'end' && (
        <>
          <span style={label}>End Message</span>
          <input
            style={inp}
            placeholder="e.g. Onboarding complete!"
            value={(data.endMessage as string) || ''}
            onChange={(e) => onUpdate('endMessage', e.target.value)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <input
              type="checkbox"
              id="showSummary"
              checked={(data.showSummary as boolean) || false}
              onChange={(e) => onUpdate('showSummary', e.target.checked)}
              style={{ accentColor: '#4ade80', width: 14, height: 14 }}
            />
            <label
              htmlFor="showSummary"
              style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer' }}
            >
              Show workflow summary on completion
            </label>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Reusable key-value metadata editor ──────────────────────────────────────

interface MetadataEditorProps {
  value: { key: string; value: string }[];
  onChange: (v: { key: string; value: string }[]) => void;
}

function MetadataEditor({ value, onChange }: MetadataEditorProps) {
  const add = () => onChange([...value, { key: '', value: '' }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', v: string) => {
    const copy = [...value];
    copy[i] = { ...copy[i], [field]: v };
    onChange(copy);
  };

  return (
    <div>
      {value.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <input style={{ ...inp, width: '45%' }} placeholder="key" value={item.key}
            onChange={(e) => update(i, 'key', e.target.value)} />
          <input style={{ ...inp, width: '45%' }} placeholder="value" value={item.value}
            onChange={(e) => update(i, 'value', e.target.value)} />
          <button onClick={() => remove(i)} style={{
            background: '#f8717111', border: '1px solid #f8717133',
            borderRadius: 4, color: '#f87171', cursor: 'pointer', padding: '0 8px', fontSize: 14,
          }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{
        background: '#4ade8011', border: '1px dashed #4ade8044',
        borderRadius: 6, color: '#4ade80', fontFamily: 'monospace',
        fontSize: 11, cursor: 'pointer', padding: '5px 10px', width: '100%', marginTop: 2,
      }}>+ Add field</button>
    </div>
  );
}