import * as readline from 'readline';
import * as path from 'path';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

/** Placeholder for GitHub App authentication. */
function generateAppJwt(appId: string, privateKeyPath: string): string {
  // TODO: Implement JWT creation using GitHub App credentials
  console.log('generateAppJwt called with appId=%s keyPath=%s', appId, privateKeyPath);
  return 'stub-jwt';
}

/** Basic logger utility */
function log(message: string, ...args: any[]) {
  const formatted = `[${new Date().toISOString()}] ${message}`;
  console.error(formatted, ...args);
}

class McpServer {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    this.rl.on('line', this.handleLine.bind(this));
    this.rl.on('close', () => process.exit(0));
    log('MCP server started');
  }

  private sendResponse(res: JsonRpcResponse) {
    const json = JSON.stringify(res);
    process.stdout.write(json + '\n');
  }

  private handleLine(line: string) {
    let request: JsonRpcRequest | null = null;
    try {
      request = JSON.parse(line);
      if (request.jsonrpc !== '2.0' || !request.method) {
        throw new Error('Invalid JSON-RPC request');
      }
      this.dispatch(request);
    } catch (err: any) {
      log('Failed to process request: %s', err.message);
      const resp: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request && request.id !== undefined ? request.id : null,
        error: { code: -32600, message: err.message },
      };
      this.sendResponse(resp);
    }
  }

  private dispatch(req: JsonRpcRequest) {
    switch (req.method) {
      case 'ping':
        this.sendResponse({ jsonrpc: '2.0', id: req.id ?? null, result: 'pong' });
        break;
      default:
        this.sendResponse({
          jsonrpc: '2.0',
          id: req.id ?? null,
          error: { code: -32601, message: 'Method not found' },
        });
    }
  }
}

function main() {
  const appId = process.env.GITHUB_APP_ID || '';
  const privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH || path.join(__dirname, '..', 'private-key.pem');
  generateAppJwt(appId, privateKeyPath);
  new McpServer();
}

main();
