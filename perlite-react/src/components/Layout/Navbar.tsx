import { ScrollArea, NavLink, TextInput, Stack, Text } from '@mantine/core';
import { IconSearch, IconFolder, IconFile } from '@tabler/icons-react';
import { useEffect, useState, useCallback } from 'react';
import { getFileTree, FileNode } from '../../utils/files';

interface NavbarProps {
  onFileSelect?: (filePath: string) => void;
}

export function Navbar({ onFileSelect }: NavbarProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFileTree() {
      try {
        setError(null);
        const tree = await getFileTree();
        setFileTree(tree);
      } catch (error) {
        console.error('Failed to load file tree:', error);
        setError(error instanceof Error ? error.message : 'Failed to load file tree');
        setFileTree([]);
      } finally {
        setLoading(false);
      }
    }

    loadFileTree();
  }, []);

  const handleFileClick = useCallback((node: FileNode) => {
    if (node.type === 'file' && onFileSelect) {
      onFileSelect(node.path);
    }
  }, [onFileSelect]);

  const renderNode = useCallback((node: FileNode) => {
    const icon = node.type === 'directory' ? <IconFolder size={16} /> : <IconFile size={16} />;
    
    return (
      <NavLink
        key={node.path}
        label={node.name}
        leftSection={icon}
        childrenOffset={28}
        onClick={() => handleFileClick(node)}
      >
        {node.children?.map(renderNode)}
      </NavLink>
    );
  }, [handleFileClick]);

  return (
    <Stack h="100%" p="xs">
      <TextInput
        placeholder="Search notes..."
        leftSection={<IconSearch size={16} />}
      />
      
      <ScrollArea>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : fileTree.length === 0 ? (
          <Text>No files found</Text>
        ) : (
          fileTree.map(renderNode)
        )}
      </ScrollArea>
    </Stack>
  );
}
