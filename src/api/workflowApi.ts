import type {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowNodeType,
} from '../types/workflow';
import type { Node, Edge } from 'reactflow';

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary'] },
  { id: 'upload_s3', label: 'Upload to S3', params: ['bucket', 'path'] },
  { id: 'trigger_webhook', label: 'Trigger Webhook', params: ['url', 'payload'] },
];

// ─── Simulate network delay ───────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── GET /automations ─────────────────────────────────────────────────────────

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(200);
  return MOCK_AUTOMATIONS;
}

// ─── POST /simulate ───────────────────────────────────────────────────────────

export async function simulateWorkflow(
  nodes: Node[],
  edges: Edge[]
): Promise<SimulationResult> {
  await delay(600);

  const steps: SimulationStep[] = [];

  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) {
    return { success: false, steps: [], error: 'No Start Node found.' };
  }

  const endNode = nodes.find((n) => n.type === 'end');
  if (!endNode) {
    return { success: false, steps: [], error: 'No End Node found.' };
  }

  let currentId: string | null = startNode.id;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      return { success: false, steps, error: `Cycle detected at node: ${currentId}` };
    }

    visited.add(currentId);
    const currentNode = nodes.find((n) => n.id === currentId);
    if (!currentNode) break;

    const data = currentNode.data as Record<string, unknown>;
    const nodeType = currentNode.type as WorkflowNodeType;
    let detail = '';

    if (nodeType === 'task') {
      detail = `Assignee: ${(data.assignee as string) || 'Unassigned'}${data.dueDate ? ` | Due: ${data.dueDate}` : ''}`;
    } else if (nodeType === 'approval') {
      detail = `Approver Role: ${(data.approverRole as string) || 'N/A'} | Auto-approve threshold: ${data.autoApproveThreshold ?? 'None'}`;
    } else if (nodeType === 'automated') {
      const action = MOCK_AUTOMATIONS.find((a) => a.id === data.actionId);
      const params = (data.actionParams as Array<{ key: string; value: string }> | undefined) ?? [];
      detail = `Action: ${action?.label ?? 'Unknown'} | Params: ${params.map(p => `${p.key}=${p.value}`).join(', ') || 'none'}`;
    } else if (nodeType === 'end') {
      detail = (data.endMessage as string) || 'Workflow complete';
    }

    steps.push({
      nodeId: currentNode.id,
      nodeType,
      label: (data.label as string) || nodeType,
      status: 'success',
      detail,
    });

    let nextEdge: Edge | undefined;
    if (nodeType === 'approval') {
      nextEdge = edges.find((e) => e.source === currentId && e.sourceHandle === 'yes');
    } else {
      nextEdge = edges.find((e) => e.source === currentId);
    }

    currentId = nextEdge?.target ?? null;
  }

  return { success: true, steps };
}

// ─── Client-side validation ───────────────────────────────────────────────────

export interface NodeValidationError {
  nodeId: string;
  message: string;
}

export function validateWorkflow(nodes: Node[], edges: Edge[]): {
  globalErrors: string[];
  nodeErrors: NodeValidationError[];
} {
  const globalErrors: string[] = [];
  const nodeErrors: NodeValidationError[] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) globalErrors.push('Missing Start Node');
  if (startNodes.length > 1) globalErrors.push('Only one Start Node is allowed');
  if (endNodes.length === 0) globalErrors.push('Missing End Node');

  nodes.forEach((node) => {
    const data = node.data as Record<string, unknown>;
    const hasOutgoing = edges.some((e) => e.source === node.id);
    const hasIncoming = edges.some((e) => e.target === node.id);

    if (node.type !== 'start' && !hasIncoming) {
      nodeErrors.push({ nodeId: node.id, message: 'No incoming connection' });
    }
    if (node.type !== 'end' && !hasOutgoing) {
      nodeErrors.push({ nodeId: node.id, message: 'No outgoing connection' });
    }
    if (node.type === 'task' && !data.label) {
      nodeErrors.push({ nodeId: node.id, message: 'Task title is required' });
    }
    if (node.type === 'automated' && !data.actionId) {
      nodeErrors.push({ nodeId: node.id, message: 'No action selected' });
    }
  });

  // Cycle detection via DFS
  const startNode = nodes.find((n) => n.type === 'start');
  if (startNode) {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const dfs = (id: string): boolean => {
      visited.add(id);
      stack.add(id);
      for (const edge of edges.filter((e) => e.source === id)) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) return true;
        } else if (stack.has(edge.target)) {
          return true;
        }
      }
      stack.delete(id);
      return false;
    };
    if (dfs(startNode.id)) {
      globalErrors.push('Cycle detected in workflow — remove circular connections');
    }
  }

  return { globalErrors, nodeErrors };
}