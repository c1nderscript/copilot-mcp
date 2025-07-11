# copilot-mcp

Simple MCP server stub that communicates over stdio using JSON-RPC 2.0.

```
npm install
npx ts-node src/server.ts
```

Send a request like `{"jsonrpc":"2.0","id":1,"method":"ping"}` via stdin to
receive a `pong` response.
