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
2. Configure your GitHub App credentials:
   ```bash
   cp config/github-app.example.json config/github-app.json
   # Edit config/github-app.json with your GITHUB_APP_ID, private key path and installation ID
   ```
   See the **Authentication** and **Configuration** specs in `AGENTS.md` for details on generating a JWT and creating installation tokens.
3. Start the development server:
   ```bash
   npm run dev
   ```
   This uses **ts-node** to run `src/server.ts` directly for easier development.

## Using with Warp

Add the server to Warp's MCP configuration. A minimal entry looks like:
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
Launch Warp and the server will provide Copilot completions for supported commands.

## Contributing

Contributions are welcome! Please follow the guidelines in `AGENTS.md` regarding MCP protocol compliance, error handling and performance. New features should include accompanying tests and documentation.

## Testing

Unit tests are written with **Jest**. Run the suite with:
```bash
npm test
```
End-to-end tests with Warp can be executed using `warp_agent_test` as described in the **Testing Strategy** section of `AGENTS.md`. Ensure authentication and configuration are valid before running tests.

