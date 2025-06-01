import { z } from "zod";
import { listMarkdownFiles } from '../utils/fileUtils.js';
import path from 'path';

export function registerTools(mcpServer) {
  // Add an addition tool
  mcpServer.tool("add",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }]
    })
  );

  // Add a test tool to verify documents directory
  mcpServer.tool("test_docs_path",
    {},
    async () => {
      const baseDir = '../documents/';
      try {
        const files = await listMarkdownFiles(baseDir);
        return {
          content: [{ 
            type: "text", 
            text: `Directory path: ${path.resolve(baseDir)}\n\nFiles found:\n${files.join('\n')}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error reading directory: ${error.message}\n\nAttempted path: ${path.resolve(baseDir)}` 
          }]
        };
      }
    }
  );
} 