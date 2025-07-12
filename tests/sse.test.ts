import { spawn } from 'child_process';
import { once } from 'events';
import path from 'path';
import http from 'http';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('sse transport', () => {
  it('responds to initialize over SSE', async () => {
    const tsNode = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');
    const serverPath = path.resolve(__dirname, '..', 'src', 'server.ts');
    const child = spawn(tsNode, [serverPath, '--sse'], {
      env: { ...process.env, PORT: '8090' },
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    await wait(500); // give server time to start

    const events = http.request({ hostname: 'localhost', port: 8090, path: '/events', method: 'GET' });
    let response = '';
    events.on('data', (chunk) => {
      response += String(chunk);
      if (response.includes('\n\n')) {
        events.destroy();
      }
    });

    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { version: 'test' },
    });

    const req = http.request(
      { hostname: 'localhost', port: 8090, path: '/rpc', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      () => {}
    );
    req.write(payload);
    req.end();

    await once(events, 'close');
    child.kill();

    expect(response).toContain('version');
  }, 10000);
});
