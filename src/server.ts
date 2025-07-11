import express from 'express';
import { Octokit } from '@octokit/rest';

const app = express();
app.use(express.json());

app.post('/rpc', async (req, res) => {
  const { id, jsonrpc, method, params } = req.body;
  if (jsonrpc !== '2.0') {
    return res.status(400).json({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid JSON-RPC version' } });
  }

  if (method === 'echo') {
    return res.json({ jsonrpc: '2.0', id, result: params });
  }

  if (method === 'getRepo') {
    const [owner, repo] = params as [string, string];
    try {
      const octokit = new Octokit();
      const { data } = await octokit.repos.get({ owner, repo });
      return res.json({ jsonrpc: '2.0', id, result: data });
    } catch (err) {
      return res.json({ jsonrpc: '2.0', id, error: { code: -32000, message: 'GitHub API error' } });
    }
  }

  return res.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
