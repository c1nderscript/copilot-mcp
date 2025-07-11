import request from 'supertest';
import nock from 'nock';
import app from '../src/server';

describe('MCP server', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('responds to echo JSON-RPC request', async () => {
    const res = await request(app)
      .post('/rpc')
      .send({ jsonrpc: '2.0', id: 1, method: 'echo', params: { msg: 'hi' } });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ jsonrpc: '2.0', id: 1, result: { msg: 'hi' } });
  });

  it('fetches repo info via GitHub API', async () => {
    const scope = nock('https://api.github.com')
      .get('/repos/octocat/Hello-World')
      .reply(200, { full_name: 'octocat/Hello-World' });

    const res = await request(app)
      .post('/rpc')
      .send({ jsonrpc: '2.0', id: 2, method: 'getRepo', params: ['octocat', 'Hello-World'] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ jsonrpc: '2.0', id: 2, result: { full_name: 'octocat/Hello-World' } });
    scope.done();
  });
});
