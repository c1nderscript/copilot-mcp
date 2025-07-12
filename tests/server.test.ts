import { spawn } from 'child_process';
import path from 'path';
import { once } from 'events';

describe('mcp server', () => {
  const tsNode = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');
  const serverPath = path.resolve(__dirname, '..', 'src', 'server.ts');

  function sendRequest(child: any, id: number, method: string, params: any = {}) {
    const req = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    child.stdin.write(req);
  }

  it('handles initialize and tool stubs', async () => {
    const child = spawn(tsNode, [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });

    sendRequest(child, 1, 'initialize', { version: 'test' });
    let [data] = await once(child.stdout, 'data');
    let response = JSON.parse(String(data).trim());
    expect(response.result.capabilities).toBeDefined();

    sendRequest(child, 2, 'copilot_complete', {});
    ;[data] = await once(child.stdout, 'data');
    response = JSON.parse(String(data).trim());
    expect(response.error.message).toMatch('not implemented');

    sendRequest(child, 3, 'copilot_review', {});
    ;[data] = await once(child.stdout, 'data');
    response = JSON.parse(String(data).trim());
    expect(response.error.message).toMatch('not implemented');

    sendRequest(child, 4, 'copilot_explain', {});
    ;[data] = await once(child.stdout, 'data');
    response = JSON.parse(String(data).trim());
    expect(response.error.message).toMatch('not implemented');

    child.kill();
  }, 15000);
});
