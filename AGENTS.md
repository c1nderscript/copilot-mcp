# AGENTS.md - MCP GitHub Copilot Server for Warp Terminal

## PROJECT OVERVIEW

This is an MCP (Model Context Protocol) server that enables Warp Terminal AI agents to query GitHub Copilot through a controlled GitHub App integration. The server acts as a bridge between Warp's Agent Mode and GitHub Copilot's code intelligence capabilities, providing seamless access to AI-powered code assistance directly within the terminal environment.

**Primary Purpose**: Enable Warp terminal agents to leverage GitHub Copilot for code generation, completion, review, and analysis through standardized MCP protocol communication.

**Key Components**:
- MCP Server implementing JSON-RPC 2.0 protocol
- GitHub App integration for Copilot API access
- Warp Terminal Agent Mode integration
- Real-time code intelligence and assistance

## TECHNOLOGY STACK

**Core Technologies**:
- **Runtime**: Node.js/TypeScript or Python 3.8+
- **Protocol**: Model Context Protocol (MCP) with JSON-RPC 2.0
- **Communication**: stdio transport for Warp integration
- **API Integration**: GitHub Copilot API via GitHub App
- **Schema Validation**: JSON Schema Draft 7+ with Zod/Pydantic
- **Authentication**: GitHub App JWT + Installation tokens

**Dependencies**:
```json
{
  "@modelcontextprotocol/sdk": "^latest",
  "@octokit/rest": "^latest", 
  "zod": "^latest",
  "jsonwebtoken": "^latest"
}
```

## PROJECT STRUCTURE

```
mcp-github-copilot-server/
├── src/
│   ├── server.ts/py           # Main MCP server implementation
│   ├── schemas.ts/py          # JSON schemas for MCP tools
│   ├── github-client.ts/py    # GitHub Copilot API client
│   ├── auth.ts/py            # GitHub App authentication
│   └── types.ts/py           # TypeScript type definitions
├── config/
│   ├── warp-config.json      # Warp MCP server configuration
│   └── github-app.json       # GitHub App credentials
├── tests/
│   ├── server.test.ts/py     # Server functionality tests
│   └── integration.test.ts/py # End-to-end tests
├── docs/
│   ├── API.md               # MCP tools documentation
│   └── SETUP.md            # Installation and setup guide
├── package.json/requirements.txt
└── README.md
```

## DEVELOPMENT GUIDELINES

### MCP Server Implementation Standards

**Protocol Compliance**:
- Implement JSON-RPC 2.0 with proper error handling
- Use progressive schema enhancement for client compatibility
- Support both stdio and SSE transport methods
- Implement proper capability negotiation during initialization

**Code Quality Standards**:
- Follow MCP SDK best practices and patterns
- Implement comprehensive error handling with structured responses
- Use TypeScript strict mode or Python type hints throughout
- Maintain 90%+ test coverage for critical paths
- Document all MCP tools with JSON Schema descriptions

### GitHub Copilot Integration

**Authentication Flow**:
```typescript
// GitHub App JWT authentication
const jwt = generateAppJWT(appId, privateKey);
const installation = await getInstallation(jwt, installationId);
const accessToken = await createInstallationToken(installation);
```

**API Usage Patterns**:
- Implement rate limiting and retry logic for Copilot API calls
- Cache frequently used completions to optimize performance
- Stream responses for real-time code generation
- Handle context window limitations intelligently

### Warp Terminal Integration

**MCP Server Configuration**:
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

## MCP TOOLS SPECIFICATION

### Core Tools for GitHub Copilot Integration

**1. Code Completion Tool**
```typescript
{
  "name": "copilot_complete",
  "description": "Get code completions from GitHub Copilot",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": {"type": "string", "description": "Current code context"},
      "language": {"type": "string", "description": "Programming language"},
      "cursor_position": {"type": "number", "description": "Cursor position in code"},
      "max_completions": {"type": "number", "default": 3}
    },
    "required": ["code", "language"]
  }
}
```

**2. Code Review Tool**
```typescript
{
  "name": "copilot_review",
  "description": "Get code review suggestions from GitHub Copilot",
  "inputSchema": {
    "type": "object", 
    "properties": {
      "code": {"type": "string", "description": "Code to review"},
      "context": {"type": "string", "description": "Additional context"},
      "focus_areas": {
        "type": "array",
        "items": {"enum": ["security", "performance", "readability", "bugs"]}
      }
    },
    "required": ["code"]
  }
}
```

**3. Code Explanation Tool**
```typescript
{
  "name": "copilot_explain",
  "description": "Get explanations for code from GitHub Copilot",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": {"type": "string", "description": "Code to explain"},
      "detail_level": {"enum": ["brief", "detailed", "comprehensive"]},
      "include_examples": {"type": "boolean", "default": false}
    },
    "required": ["code"]
  }
}
```

**4. Code Generation Tool**
```typescript
{
  "name": "copilot_generate",
  "description": "Generate code based on natural language description",
  "inputSchema": {
    "type": "object",
    "properties": {
      "description": {"type": "string", "description": "What to generate"},
      "language": {"type": "string", "description": "Target programming language"},
      "style": {"type": "string", "description": "Coding style preferences"},
      "context": {"type": "string", "description": "Existing codebase context"}
    },
    "required": ["description", "language"]
  }
}
```

## WARP AGENT OPTIMIZATION

### Context Window Management
- Implement intelligent context truncation for large codebases
- Use sliding window approach for maintaining relevant code context
- Prioritize recently modified and currently viewed files
- Implement semantic chunking for better context preservation

### Performance Optimization
- Cache Copilot responses for identical queries
- Implement request batching for multiple completions
- Use streaming responses for real-time feedback
- Optimize JSON payload sizes for faster transmission

### Error Handling and Recovery
```typescript
async function handleCopilotError(error: any): Promise<MCPResponse> {
  if (error.status === 429) {
    // Rate limiting - implement exponential backoff
    await delay(Math.pow(2, retryCount) * 1000);
    return retryRequest();
  } else if (error.status === 401) {
    // Auth error - refresh installation token
    await refreshGitHubAuth();
    return retryRequest();
  }
  
  return {
    error: {
      code: error.status || -1,
      message: `GitHub Copilot API error: ${error.message}`,
      data: { originalError: error }
    }
  };
}
```

## CURRENT DEVELOPMENT PRIORITIES

### Phase 1: Core Functionality (Current Sprint)
- [ ] Implement basic MCP server with stdio transport
- [ ] Set up GitHub App authentication flow
- [ ] Create core Copilot integration tools (complete, review, explain)
- [ ] Configure Warp MCP server integration
- [ ] Implement basic error handling and logging

### Phase 2: Enhanced Features
- [ ] Add code generation and refactoring tools
- [ ] Implement intelligent context management
- [ ] Add support for multiple programming languages
- [ ] Create comprehensive test suite
- [ ] Optimize performance and caching strategies

### Phase 3: Advanced Capabilities
- [ ] Implement streaming responses for real-time feedback
- [ ] Add repository-wide analysis capabilities
- [ ] Create custom Copilot fine-tuning integration
- [ ] Implement collaborative coding features
- [ ] Add metrics and usage analytics

## TESTING STRATEGY

### Unit Testing
- Test all MCP tool implementations independently
- Mock GitHub Copilot API responses for consistent testing
- Validate JSON schema compliance for all inputs/outputs
- Test error handling and edge cases

### Integration Testing
- Test full Warp → MCP Server → GitHub Copilot flow
- Validate authentication and token refresh mechanisms
- Test rate limiting and retry logic
- Verify real-time performance under load

### End-to-End Testing
```bash
# Test MCP server startup and registration
warp_agent_test --mcp-server github-copilot --test-connection

# Test code completion flow
warp_agent_test --tool copilot_complete --input "function fibonacci"

# Test code review capabilities  
warp_agent_test --tool copilot_review --input-file sample_code.js
```

## DEPLOYMENT AND MONITORING

### Local Development Setup
```bash
# Clone and setup
git clone <your-mcp-server-repo>
cd mcp-github-copilot-server

# Install dependencies
npm install  # or pip install -r requirements.txt

# Configure GitHub App credentials
cp config/github-app.example.json config/github-app.json
# Edit with your actual GitHub App credentials

# Start development server
npm run dev  # or python src/server.py

# Configure in Warp
# Settings > AI > Manage MCP servers > Add server
```

### Production Considerations
- Implement proper logging and monitoring
- Set up health check endpoints
- Configure automatic restart on failures
- Monitor GitHub API rate limits and usage
- Implement security best practices for credential management

## SECURITY GUIDELINES

### GitHub App Security
- Store private keys securely (environment variables or secure vaults)
- Implement proper token rotation and refresh mechanisms
- Use minimal required permissions for GitHub App
- Validate all inputs to prevent injection attacks

### MCP Protocol Security
- Validate all JSON-RPC requests against schemas
- Implement request size limits to prevent DoS
- Log security events and suspicious activity
- Use secure transport channels where possible

## CODEX AGENT INSTRUCTIONS

When working with this MCP server codebase:

1. **Always validate MCP protocol compliance** - Use the @modelcontextprotocol/sdk patterns and ensure JSON-RPC 2.0 compatibility

2. **Prioritize GitHub Copilot integration quality** - Focus on providing accurate, contextual, and useful responses from Copilot API

3. **Optimize for Warp Terminal workflows** - Consider how terminal users will interact with the tools and provide appropriate feedback

4. **Implement robust error handling** - GitHub APIs can be unreliable, so implement comprehensive retry and fallback mechanisms

5. **Focus on performance** - Terminal users expect fast responses, so optimize for speed while maintaining quality

6. **Maintain security standards** - Handle GitHub App credentials securely and validate all user inputs

7. **Document everything** - Keep schemas, tools, and APIs well-documented for easy maintenance and updates

Remember: This server is the bridge between Warp's AI agents and GitHub Copilot's intelligence. Every interaction should be fast, reliable, and provide maximum value to developers working in their terminal environment.
