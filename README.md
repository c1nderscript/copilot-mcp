# MCP GitHub Copilot Server

This project implements a Model Context Protocol (MCP) server that enables Warp Terminal agents to query GitHub Copilot. It acts as a bridge between Warp's Agent Mode and GitHub Copilot's API, providing code completion and analysis features directly in the terminal.

## Technology Stack

- **Runtime:** Node.js with TypeScript
- **Protocol:** JSON-RPC 2.0 over stdio for Warp integration
- **Dependencies:** `@modelcontextprotocol/sdk`, `@octokit/rest`, `zod`, `jsonwebtoken`

## Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone <this-repo>
   cd copilot-mcp
   npm install
   ```
2. Configure your GitHub App credentials using environment variables:
   ```bash
   export GITHUB_APP_ID=<your_app_id>
   export GITHUB_INSTALLATION_ID=<your_installation_id>
   export GITHUB_PRIVATE_KEY_PATH=/path/to/private-key.pem
   # or set GITHUB_PRIVATE_KEY with the PEM contents
   ```
   You may still provide `config/github-app.json` for `appId` and `installationId`, but **never** commit your private key. See the **Authentication** and **Configuration** specs in `AGENTS.md` for details on generating a JWT and creating installation tokens.
3. Start the development server:
   ```bash
   npm run dev
   ```
   This uses **ts-node** to run `src/server.ts` directly for easier development.

## Using with Warp

1. Build the server so Warp can launch the compiled code:
   ```bash
   npm run build
   ```
2. In Warp open **Settings → AI → Manage MCP Servers** and click **Add Server**.
3. Fill in the configuration as shown below and save it:
   ```json
   {
     "name": "github-copilot",
     "command": "node",
     "args": ["dist/server.js"],
     "env": {
       "GITHUB_APP_ID": "your_app_id",
       "GITHUB_PRIVATE_KEY_PATH": "/path/to/private-key.pem",
       "GITHUB_INSTALLATION_ID": "your_installation_id"
     },
     "start_on_launch": true
   }
   ```
Warp will launch the server and Copilot completions will be available for supported commands.

## Production Deployment

For long-running use you can manage the compiled server with **systemd** or **Docker**.

### systemd

Create `/etc/systemd/system/github-copilot.service` and enable it:

```ini
[Service]
ExecStart=/usr/bin/node /opt/copilot-mcp/dist/server.js
WorkingDirectory=/opt/copilot-mcp
Environment=GITHUB_APP_ID=your_app_id
Environment=GITHUB_PRIVATE_KEY_PATH=/opt/copilot-mcp/private-key.pem
Environment=GITHUB_INSTALLATION_ID=your_installation_id
Restart=on-failure
```

```bash
sudo systemctl enable --now github-copilot.service
```

### Docker

```bash
docker build -t copilot-mcp .
docker run -d --restart unless-stopped \
  -e GITHUB_APP_ID=your_app_id \
  -e GITHUB_PRIVATE_KEY_PATH=/keys/private.pem \
  -e GITHUB_INSTALLATION_ID=your_installation_id \
  copilot-mcp
```

Monitor the process using `journalctl` or `docker logs`.

## Contributing

Contributions are welcome! Please follow the guidelines in `AGENTS.md` regarding MCP protocol compliance, error handling and performance. New features should include accompanying tests and documentation.

## Testing

Unit tests are written with **Jest**. Run the suite with:
```bash
npm test
```
End-to-end tests with Warp can be executed using `warp_agent_test` as described in the **Testing Strategy** section of `AGENTS.md`. Ensure authentication and configuration are valid before running tests.


## License

This project is licensed under the [MIT License](LICENSE).
