# MCP Tools API

This document describes the tools exposed by the GitHub Copilot MCP server. Each tool is defined using JSON Schema for its input and output.

## copilot_complete

Generates code completions from GitHub Copilot based on the provided prompt.

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "prompt": { "type": "string", "description": "Code snippet or question" },
    "language": { "type": "string", "description": "Programming language", "default": "" }
  },
  "required": ["prompt"]
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
    "code": { "type": "string", "description": "Source code to review" },
    "language": { "type": "string", "description": "Programming language" }
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
    "code": { "type": "string", "description": "Code to explain" }
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
