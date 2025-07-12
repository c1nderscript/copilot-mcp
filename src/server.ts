import {
  JSONRPCServer,
  JSONRPCRequest,
  JSONRPCParams,
  JSONRPCErrorResponse,
  createStdioTransport,
  ErrorCodes,
} from '@modelcontextprotocol/sdk';
import http from 'http';

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

/** Stub handler: copilot_complete */
server.addMethod('copilot_complete', async (params: JSONRPCParams<{stream?: boolean}>) => {
  if (params && (params as any).stream) {
    transport.write({ jsonrpc: '2.0', method: 'progress', params: 'streaming not implemented' });
  }
  return toJSONRPCError('copilot_complete not implemented', ErrorCodes.MethodNotFound);
});

/** Stub handler: copilot_review */
server.addMethod('copilot_review', async (params: JSONRPCParams<{stream?: boolean}>) => {
  if (params && (params as any).stream) {
    transport.write({ jsonrpc: '2.0', method: 'progress', params: 'streaming not implemented' });
  }
  return toJSONRPCError('copilot_review not implemented', ErrorCodes.MethodNotFound);
});

/** Stub handler: copilot_explain */
server.addMethod('copilot_explain', async (params: JSONRPCParams<{stream?: boolean}>) => {
  if (params && (params as any).stream) {
    transport.write({ jsonrpc: '2.0', method: 'progress', params: 'streaming not implemented' });
  }
  return toJSONRPCError('copilot_explain not implemented', ErrorCodes.MethodNotFound);
});

// Start processing requests from the selected transport
server.start().catch((err: unknown) => {
  const errorResponse = toJSONRPCError((err as Error).message);
  transport.write(errorResponse);
});
