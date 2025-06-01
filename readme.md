# MCP Server for Document Management

A local development server that provides a simple interface for managing and accessing markdown documents using the Model Context Protocol (MCP).

## Features

- Serve markdown documents from a local directory
- List available documents
- Read document contents
- Simple and fast local development setup
- Support for both direct MCP and SSE communication

## Project Structure

```
.
├── documents/         # Directory containing markdown files
├── tools/             # Tool definitions
├── resources/         # Resource templates
├── utils/             # Utility functions
└── server.js          # Main server file
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `documents` directory in the project root and add your markdown files:
```bash
mkdir documents
```

3. Start the server:
```bash
npm start
```

4. In a separate terminal, run the inspector:
```bash
npm run inspect
```

## Usage

The server provides the following functionality:

1. List Documents:
   - Access available markdown files through the inspector
   - Files are listed with their names (without .md extension)

2. Read Documents:
   - Click on any document in the inspector to view its contents
   - Documents are served with proper markdown formatting

3. File Management:
   - Add new markdown files to the `documents` directory
   - Files are automatically detected and made available
   - Only `.md` files are supported

## Development

The server uses:
- Express.js for the web server
- Model Context Protocol (MCP) for communication
- SSE (Server-Sent Events) for real-time updates
- Direct MCP communication for simple requests

## Error Handling

The server includes:
- Automatic port conflict resolution
- Graceful error handling for file operations
- Connection management for SSE
- Proper cleanup of resources

## Notes

- This is a local development server, not intended for production use
- No security measures are implemented as it's meant for local use only
- File operations are optimized for quick access and response


lv.