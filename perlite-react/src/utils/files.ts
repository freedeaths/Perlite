import config from '../config';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export async function getFileTree(): Promise<FileNode[]> {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to fetch file tree');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching file tree:', error);
    throw error; // 让上层组件处理错误
  }
}

export async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to fetch file content');
    }
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error; // 让上层组件处理错误
  }
}
