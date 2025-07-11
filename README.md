# GitHub Copilot MCP Server

This repository contains a lightweight Model Context Protocol (MCP) server that lets Warp Terminal's Agent Mode talk to GitHub Copilot. It exposes Copilot tools over JSON-RPC 2.0 using stdio so Warp can request completions and code analysis directly from the terminal.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```
   See `AGENTS.md` for the complete dependency list and optional installation notes.

2. **Configure GitHub App credentials**

   ```bash
   cp config/github-app.example.json config/github-app.json
   # Edit config/github-app.json with your appId, private key and installationId
   ```
   Guidance on generating tokens and keeping them secure is in the *GitHub App Security* section of `AGENTS.md`.

## Development server

Start the server in development mode with:

```bash
npm run dev
```

The server listens on stdio for MCP requests.

## Warp Terminal integration

Add the server in Warp's *Manage MCP servers* configuration:

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

Once registered, Warp will route completion and review requests through this server to GitHub Copilot.

## Contributing

Please follow the development guidelines in `AGENTS.md` when proposing changes.
