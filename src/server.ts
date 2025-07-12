import {
  JSONRPCServer,
  JSONRPCParams,
  JSONRPCErrorResponse,
  createStdioTransport,
  ErrorCodes,
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
  stream?: boolean;
}

// Determine transport mode (stdio or SSE)
const useSSE =
  process.argv.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';

function createSSETransport(port = 7070) {
  const clients = new Set<http.ServerResponse>();
  const handlers: Array<(req: JSONRPCRequest) => void> = [];

  const httpServer = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
      });
      clients.add(res);
      req.on('close', () => {
        clients.delete(res);
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/rpc') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const json = JSON.parse(body);
          handlers.forEach((h) => h(json));
          res.writeHead(204);
          res.end();
        } catch {
          res.writeHead(400);
          res.end();
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  httpServer.listen(port);

  return {
    onMessage(handler: (req: JSONRPCRequest) => void) {
      handlers.push(handler);
    },
    write(message: unknown) {
      const data = `data: ${JSON.stringify(message)}\n\n`;
      clients.forEach((c) => c.write(data));
    },
  };
}

const transport = useSSE
  ? createSSETransport(Number(process.env.PORT) || 7070)
  : createStdioTransport(process.stdin, process.stdout);

const server = new JSONRPCServer(transport);
logger.info('Starting MCP server');

/** Structured error helper */
function toJSONRPCError(message: string, code: number = ErrorCodes.InternalError): JSONRPCErrorResponse {
  return { jsonrpc: '2.0', error: { code, message }, id: null };
}

/** Initialization handshake */
server.addMethod('initialize', async (params: JSONRPCParams<InitializeParams>) => {
  logger.info({ params }, 'initialize');
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

/** Health check */
server.addMethod('health_check', async () => {
  logger.debug('health_check');
  return { status: 'ok' };
});

// Start processing requests from stdio
server.start().catch((err: unknown) => {
  logger.error({ err }, 'server start failure');
  const errorResponse = toJSONRPCError((err as Error).message);
  transport.write(errorResponse);
});
