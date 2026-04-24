// ─── Node Data Types ──────────────────────────────────────────────────────────

export interface MetadataField {
  key: string;
  value: string;
}

export interface StartNodeData {
  label: string;
  metadata?: MetadataField[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface TaskNodeData {
  label: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: MetadataField[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface ApprovalNodeData {
  label: string;
  approverRole?: string;
  autoApproveThreshold?: number;
  hasError?: boolean;
  errorMessage?: string;
}

export interface AutomationParam {
  key: string;
  value: string;
}

export interface AutomatedStepNodeData {
  label: string;
  actionId?: string;
  actionParams?: AutomationParam[];
  hasError?: boolean;
  errorMessage?: string;
}

export interface EndNodeData {
  label: string;
  endMessage?: string;
  showSummary?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// ─── Node Type Enum ───────────────────────────────────────────────────────────

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

// ─── Mock API Types ───────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  label: string;
  status: 'success' | 'skipped' | 'error';
  detail?: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  error?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── Export/Import ────────────────────────────────────────────────────────────

export interface WorkflowExport {
  version: string;
  name: string;
  exportedAt: string;
  nodes: unknown[];
  edges: unknown[];
}