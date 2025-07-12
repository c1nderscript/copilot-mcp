# MCP Tools API

This document describes the tools exposed by the GitHub Copilot MCP server. Each tool is defined using JSON Schema for its input and output.

## copilot_complete

Generates code completions from GitHub Copilot based on the provided code context.

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "code": { "type": "string", "description": "Current code context" },
    "language": { "type": "string", "description": "Programming language" },
    "cursor_position": { "type": "number", "description": "Cursor position in code" },
    "max_completions": { "type": "number", "default": 3 }
  },
  "required": ["code", "language"]
}
```

### Output Schema
```json
{
  "type": "object",
  "properties": {
    "completion": { "type": "string", "description": "Generated completion" }
  },
  "required": ["completion"]
}
```

## copilot_review

Provides automated code review comments for a given file or snippet.

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "code": { "type": "string", "description": "Code to review" },
    "context": { "type": "string", "description": "Additional context" },
    "focus_areas": {
      "type": "array",
      "items": { "enum": ["security", "performance", "readability", "bugs"] }
    }
  },
  "required": ["code"]
}
```

### Output Schema
```json
{
  "type": "object",
  "properties": {
    "comments": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of review comments"
    }
  },
  "required": ["comments"]
}
```

## copilot_explain

Explains what a piece of code does in plain language.

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "code": { "type": "string", "description": "Code to explain" },
    "detail_level": { "enum": ["brief", "detailed", "comprehensive"] },
    "include_examples": { "type": "boolean", "default": false }
  },
  "required": ["code"]
}
```

### Output Schema
```json
{
  "type": "object",
  "properties": {
    "explanation": { "type": "string", "description": "Plain language explanation" }
  },
  "required": ["explanation"]
}
```

## Transport Options

The server supports two transport mechanisms:

1. **stdio** - Default communication over stdin/stdout. Suitable for Warp integration.
2. **SSE (Server-Sent Events)** - Start the server with the `--sse` flag or set `MCP_TRANSPORT=sse` to enable HTTP-based SSE streaming on port `7070` (configurable with the `PORT` environment variable).

When using SSE, send JSON-RPC requests with `POST /rpc` and listen for responses on `GET /events`. Include `"stream": true` in request parameters to receive progressive updates.
