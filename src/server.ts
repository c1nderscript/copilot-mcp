import {
  JSONRPCServer,
  JSONRPCRequest,
  JSONRPCParams,
  JSONRPCErrorResponse,
  createStdioTransport,
  ErrorCodes
} from '@modelcontextprotocol/sdk';

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

/** Stub handler: copilot_complete */
server.addMethod('copilot_complete', async () => {
  return toJSONRPCError('copilot_complete not implemented', ErrorCodes.MethodNotFound);
});

/** Stub handler: copilot_review */
server.addMethod('copilot_review', async () => {
  return toJSONRPCError('copilot_review not implemented', ErrorCodes.MethodNotFound);
});

/** Stub handler: copilot_explain */
server.addMethod('copilot_explain', async () => {
  return toJSONRPCError('copilot_explain not implemented', ErrorCodes.MethodNotFound);
});

// Start processing requests from stdio
server.start().catch((err: unknown) => {
  const errorResponse = toJSONRPCError((err as Error).message);
  transport.write(errorResponse);
});
