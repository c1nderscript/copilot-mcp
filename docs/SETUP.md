# Setup Guide

This project uses configuration files under `config/` to control how the MCP server runs and how it authenticates with GitHub.

## `config/warp-config.json`
This file defines how Warp launches the MCP server. The example values mirror those in `AGENTS.md`:

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

Edit the environment variables with your GitHub App details before running the server.

## `config/github-app.json`
Create this file from `config/github-app.example.json` and fill in your GitHub App credentials:

```json
{
  "app_id": "your_app_id",
  "installation_id": "your_installation_id",
  "private_key_path": "/path/to/private-key.pem"
}
```

`private_key_path` should point to the PEM file downloaded from your GitHub App settings.
