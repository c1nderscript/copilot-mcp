# Local Development Setup

This project is a Model Context Protocol (MCP) server that bridges Warp Terminal and GitHub Copilot. Follow these steps to get a local environment running.

## Prerequisites

- Node.js or Python 3.8+
- Git
- GitHub App credentials for accessing the Copilot API

## Installation

```bash
# Clone the repository
git clone <your-fork-url>
cd mcp-github-copilot-server

# Install dependencies
npm install    # or: pip install -r requirements.txt

# Copy the example GitHub App config
cp config/github-app.example.json config/github-app.json
# Edit config/github-app.json with your App ID, private key, and installation ID
```

## Running the Server

```bash
# Start the development server
npm run dev    # or: python src/server.py
```
The `npm run dev` script runs `src/server.ts` with **ts-node** for quick iteration.

The server communicates over stdio by default. When it starts, it registers available tools with Warp.

## Warp Terminal Configuration

1. Build the project so Warp can run the compiled server:
   ```bash
   npm run build
   ```
2. Open Warp and navigate to **Settings → AI → Manage MCP Servers**.
3. Click **Add Server** and fill in the fields:
   - **Name:** `github-copilot`
   - **Command:** `node`
   - **Arguments:** `dist/server.js`
   - Provide your GitHub App environment variables (e.g. `GITHUB_APP_ID`).
   - Enable **Start on Launch** if you want Warp to start the server automatically.
4. Save the configuration. Warp will launch the server and register the Copilot tools when it starts.

## Troubleshooting

- Check that your GitHub App credentials are valid and have the required permissions.
- Verify network connectivity if requests to GitHub Copilot fail.
- Inspect logs for detailed error messages.

## Production Deployment

The server can run as a long-lived service once it has been compiled with
`npm run build`.

### systemd

Create `/etc/systemd/system/github-copilot.service` with contents similar to:

```ini
[Unit]
Description=GitHub Copilot MCP server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/copilot-mcp/dist/server.js
WorkingDirectory=/opt/copilot-mcp
Environment=GITHUB_APP_ID=your_app_id
Environment=GITHUB_PRIVATE_KEY_PATH=/opt/copilot-mcp/private-key.pem
Environment=GITHUB_INSTALLATION_ID=your_installation_id
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable --now github-copilot.service
```

Logs can be viewed with `journalctl -u github-copilot.service`.

### Docker

Alternatively build a Docker image and run it with a restart policy:

```Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/server.js"]
```

```bash
docker build -t copilot-mcp .
docker run -d --restart unless-stopped \
  -e GITHUB_APP_ID=your_app_id \
  -e GITHUB_PRIVATE_KEY_PATH=/keys/private.pem \
  -e GITHUB_INSTALLATION_ID=your_installation_id \
  copilot-mcp
```

Monitor the container with `docker logs -f <container_id>`.
