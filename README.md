# MCP GitHub Copilot Server

This repository contains a Model Context Protocol (MCP) server that lets Warp Terminal agents query GitHub Copilot. The server bridges Warp's Agent Mode with GitHub Copilot's code intelligence so developers can access AI-powered completions and code review directly from the terminal.

## Setup

The project relies on Node.js (or Python) and requires installing dependencies and configuring GitHub App credentials. The [local development setup](AGENTS.md#L273) in `AGENTS.md` shows the basic workflow:

```bash
# Clone the repository and move into it
git clone <your-mcp-server-repo>
cd mcp-github-copilot-server

# Install dependencies
npm install  # or pip install -r requirements.txt

# Configure GitHub App credentials
cp config/github-app.example.json config/github-app.json
# Edit the new file with your GitHub App ID, private key path and installation ID
```

## Development server

Start the server with:

```bash
npm run dev  # or python src/server.py
```

This runs the MCP server and listens on stdio for Warp integration. See the [Warp Terminal integration section](AGENTS.md#L91) for the configuration snippet to add the server under **Settings → AI → Manage MCP servers**.

## Warp Terminal integration

Warp connects to this MCP server using the configuration shown in `AGENTS.md`. When the server is running, add it to Warp so terminal agents can request code completions, review, and other Copilot features through this server.
