import fs from 'fs/promises';
import { dirname, join, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const DOCUMENTS_DIR = resolve(__dirname, '../../documents');

class FileSystemError extends Error {
    constructor(message, code) {
      super(message);
      this.name = 'FileSystemError';
      this.code = code;
    }
  }

export async function readMarkdownFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new FileSystemError('File not found', 'ENOENT');
    }
    if (error.code === 'EACCES') {
      throw new FileSystemError('Permission denied', 'EACCES');
    }
    throw new FileSystemError(`Error reading file: ${error.message}`, error.code);
  }
}

export async function listMarkdownFiles(baseDir) {
    try {
      const dirents = await fs.readdir(baseDir, { withFileTypes: true });
      return dirents
        .filter(dirent => 
          dirent.isFile() && 
          dirent.name.toLowerCase().endsWith('.md') &&
          !dirent.name.startsWith('.')
        )
        .map(dirent => dirent.name);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError('Directory not found', 'ENOENT');
      }
      if (error.code === 'EACCES') {
        throw new FileSystemError('Permission denied', 'EACCES');
      }
      throw new FileSystemError(`Error listing files: ${error.message}`, error.code);
    }
  }

export async function findMarkdownFile(baseDir, requestedFile) {
  try {
    const normalized = normalize(requestedFile);
    if (normalized.startsWith('..') || normalized.includes('/') || normalized.includes('\\')) {
      throw new FileSystemError('Invalid file path', 'EINVAL');
    }

    const dirents = await fs.readdir(baseDir, { withFileTypes: true });
    const requestedLower = requestedFile.toLowerCase();
    const foundFile = dirents.find(dirent => 
      dirent.isFile() && 
      dirent.name.toLowerCase() === requestedLower
    );
    
    return foundFile ? foundFile.name : null;
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }
    if (error.code === 'ENOENT') {
      throw new FileSystemError('Directory not found', 'ENOENT');
    }
    if (error.code === 'EACCES') {
      throw new FileSystemError('Permission denied', 'EACCES');
    }
    throw new FileSystemError(`Error finding file: ${error.message}`, error.code);
  }
} 