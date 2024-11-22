import { Paper } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useMemo } from 'react';

interface NoteContentProps {
  content: string;
}

function processObsidianContent(content: string): string {
  // 替换 Obsidian 风格的图片链接
  return content.replace(/!\[\[(.*?)\]\]/g, (match, path) => {
    // 移除路径中的 './' 和 '../'
    const cleanPath = path.replace(/^(\.\.?\/)+/, '');
    return `![](${cleanPath})`;
  });
}

export function NoteContent({ content }: NoteContentProps) {
  const processedContent = useMemo(() => processObsidianContent(content), [content]);

  return (
    <Paper p="md" className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={tomorrow}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
          img({ src, alt, ...props }) {
            if (!src) return null;
            // 构建完整的图片 URL
            const imageUrl = `/api/file?path=${encodeURIComponent(src)}`;
            return <img src={imageUrl} alt={alt || ''} {...props} />;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </Paper>
  );
}
