import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readMarkdownFile, listMarkdownFiles, findMarkdownFile, DOCUMENTS_DIR } from '../utils/fileUtils.js';
import { join } from 'path';

export function registerResources(mcpServer) {
  // Add docs resource that can handle multiple markdown files
  const docsTemplate = new ResourceTemplate("docs://{path}", {
    list: async () => {
      try {
        const files = await listMarkdownFiles(DOCUMENTS_DIR);
        
        const resources = files.map(file => ({
          name: file.replace('.md', ''),
          uri: `docs://${file}`,
          type: "text/markdown"
        }));
        
        return { resources };
      } catch (error) {
        console.error('Error listing documents:', error);
        return { resources: [] };
      }
    }
  });

  mcpServer.resource("docs", docsTemplate, async (uri, { path }) => {
    try {
      // Validate path parameter
      if (path.includes('/') || path.includes('\\') || path.includes('..')) {
        return {
          contents: [{
            uri: uri.href,
            text: 'Invalid document path'
          }]
        };
      }

      const actualFile = await findMarkdownFile(DOCUMENTS_DIR, path);
      if (!actualFile) {
        return {
          contents: [{
            uri: uri.href,
            text: 'Document not found'
          }]
        };
      }

      const filePath = join(DOCUMENTS_DIR, actualFile);
      const content = await readMarkdownFile(filePath);
      
      return {
        contents: [{
          uri: uri.href,
          text: content
        }]
      };
    } catch (error) {
      console.error('Error reading document:', error);
      return {
        contents: [{
          uri: uri.href,
          text: 'Unable to load document'
        }]
      };
    }
  });
} 