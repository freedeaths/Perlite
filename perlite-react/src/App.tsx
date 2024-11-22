import { MantineProvider } from '@mantine/core';
import { AppShell } from './components/Layout/AppShell';
import { NoteContent } from './components/NoteView/NoteContent';
import { useState, useCallback } from 'react';
import { readMarkdownFile } from './utils/files';
import '@mantine/core/styles.css';

function App() {
  const [content, setContent] = useState<string>("# Welcome to Perlite\n\nThis is a React-based Markdown viewer optimized for Obsidian notes.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);
      const fileContent = await readMarkdownFile(filePath);
      setContent(fileContent);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file');
      setContent('# Error\n\nFailed to load the selected file.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MantineProvider>
      <AppShell onFileSelect={handleFileSelect}>
        <NoteContent content={content} />
      </AppShell>
    </MantineProvider>
  )
}

export default App
