import {
  JSONRPCServer,
  JSONRPCParams,
  JSONRPCErrorResponse,
  createStdioTransport,
  ErrorCodes
} from '@modelcontextprotocol/sdk';
import { Octokit } from '@octokit/rest';
import {
  copilotCompleteSchema,
  copilotReviewSchema,
  copilotExplainSchema
} from './schemas';
import { getInstallationToken, refreshGitHubAuth } from './auth';

interface CapabilityMap {
  copilot_complete: boolean;
  copilot_review: boolean;
  copilot_explain: boolean;
  [key: string]: boolean;
}

interface InitializeParams {
  version: string;
  capabilities?: CapabilityMap;
}

// Set up stdio transport and JSON-RPC server
const transport = createStdioTransport(process.stdin, process.stdout);
const server = new JSONRPCServer(transport);

/** Structured error helper */
function toJSONRPCError(message: string, code: number = ErrorCodes.InternalError): JSONRPCErrorResponse {
  return { jsonrpc: '2.0', error: { code, message }, id: null };
}

/** Initialization handshake */
server.addMethod('initialize', async (params: JSONRPCParams<InitializeParams>) => {
  const capabilities: CapabilityMap = {
    copilot_complete: true,
    copilot_review: true,
    copilot_explain: true,
  };
  return { version: '0.1.0', capabilities };
});

/** Handler: copilot_complete */
server.addMethod('copilot_complete', async (params: JSONRPCParams) => {
  const parsed = copilotCompleteSchema.safeParse(params);
  if (!parsed.success) {
    return toJSONRPCError(parsed.error.message, ErrorCodes.InvalidParams);
  }
  const input = parsed.data;
  try {
    const token = await getInstallationToken();
    const octokit = new Octokit({ auth: token });
    const res = await octokit.request('POST /copilot/completions', {
      code: input.code,
      language: input.language,
      cursor_position: input.cursor_position,
      max_completions: input.max_completions,
    });
    const completion = (res.data as any).completion || (res.data as any).choices?.[0]?.text;
    return { completion };
  } catch (err: any) {
    if (err.status === 401) {
      await refreshGitHubAuth();
    }
    return toJSONRPCError(err.message || 'Copilot completion failed');
  }
});

/** Handler: copilot_review */
server.addMethod('copilot_review', async (params: JSONRPCParams) => {
  const parsed = copilotReviewSchema.safeParse(params);
  if (!parsed.success) {
    return toJSONRPCError(parsed.error.message, ErrorCodes.InvalidParams);
  }
  try {
    const token = await getInstallationToken();
    const octokit = new Octokit({ auth: token });
    const res = await octokit.request('POST /copilot/review', parsed.data);
    return { comments: (res.data as any).comments || [] };
  } catch (err: any) {
    if (err.status === 401) {
      await refreshGitHubAuth();
    }
    return toJSONRPCError(err.message || 'Copilot review failed');
  }
});

/** Handler: copilot_explain */
server.addMethod('copilot_explain', async (params: JSONRPCParams) => {
  const parsed = copilotExplainSchema.safeParse(params);
  if (!parsed.success) {
    return toJSONRPCError(parsed.error.message, ErrorCodes.InvalidParams);
  }
  try {
    const token = await getInstallationToken();
    const octokit = new Octokit({ auth: token });
    const res = await octokit.request('POST /copilot/explain', parsed.data);
    return { explanation: (res.data as any).explanation || '' };
  } catch (err: any) {
    if (err.status === 401) {
      await refreshGitHubAuth();
    }
    return toJSONRPCError(err.message || 'Copilot explanation failed');
  }
});

// Start processing requests from stdio
server.start().catch((err: unknown) => {
  const errorResponse = toJSONRPCError((err as Error).message);
  transport.write(errorResponse);
});
