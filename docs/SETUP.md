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

The server communicates over stdio by default. When it starts, it registers available tools with Warp.

## Warp Terminal Configuration

In Warp, add this MCP server via **Settings → AI → Manage MCP Servers** and point it to the start command above. Ensure the environment variables for your GitHub App are available when launching the server.

## Troubleshooting

- Check that your GitHub App credentials are valid and have the required permissions.
- Verify network connectivity if requests to GitHub Copilot fail.
- Inspect logs for detailed error messages.
