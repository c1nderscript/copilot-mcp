import { startServer } from '../src/server';

describe('MCP server', () => {
  it('starts without throwing', async () => {
    await expect(startServer()).resolves.toBeUndefined();
  });
});
