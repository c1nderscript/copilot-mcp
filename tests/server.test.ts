import { spawn } from 'child_process';
import path from 'path';
import { once } from 'events';

describe('mcp server startup', () => {
  it('responds to initialize request', async () => {
    const tsNode = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');
    const serverPath = path.resolve(__dirname, '..', 'src', 'server.ts');
    const child = spawn(tsNode, [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });

    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { version: 'test' }
    }) + '\n';

    child.stdin.write(request);
    const [data] = await once(child.stdout, 'data');
    const response = JSON.parse(String(data).trim());
    expect(response.result).toBeDefined();
    child.kill();
  }, 10000);

  it('responds to health_check request', async () => {
    const tsNode = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');
    const serverPath = path.resolve(__dirname, '..', 'src', 'server.ts');
    const child = spawn(tsNode, [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });

    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'health_check',
      params: {}
    }) + '\n';

    child.stdin.write(request);
    const [data] = await once(child.stdout, 'data');
    const response = JSON.parse(String(data).trim());
    expect(response.result).toEqual({ status: 'ok' });
    child.kill();
  }, 10000);
});
