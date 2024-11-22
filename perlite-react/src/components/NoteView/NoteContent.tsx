import { Paper, Image, Skeleton } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useMemo, useState } from 'react';

interface NoteContentProps {
  content: string;
}

function processObsidianContent(content: string): string {
  // 替换 Obsidian 风格的图片链接
  return content.replace(/!\[\[(.*?)\]\]/g, (match, path) => {
    // 移除路径中的 './' 和 '../'
    const cleanPath = path.replace(/^(\.\.?\/)+/, '');
    // 如果路径包含 '|'，只取第一部分（Obsidian 的图片别名语法）
    const actualPath = cleanPath.split('|')[0].trim();
    return `![](${actualPath})`;
  });
}

function ObsidianImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  if (!src) return null;

  // 构建完整的图片 URL
  const imageUrl = `/api/file?path=${encodeURIComponent(src)}`;

  const handleError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    console.error('Image load failed:', {
      src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      error: img.error
    });

    if (retryCount < 2) {
      // 添加随机参数来避免缓存
      setRetryCount(prev => prev + 1);
      img.src = `${imageUrl}&retry=${retryCount + 1}`;
    } else {
      setLoading(false);
      setError(`Failed to load image: ${src}`);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && <Skeleton height={200} radius="md" animate={true} />}
      <Image
        src={imageUrl}
        alt={alt || ''}
        onLoad={() => {
          setLoading(false);
          setError(null);
        }}
        onError={handleError}
        style={{ 
          display: loading ? 'none' : 'block',
          maxWidth: '100%',
          height: 'auto'
        }}
        fit="contain"
        {...props}
      />
      {error && (
        <div style={{ 
          color: 'red', 
          textAlign: 'center',
          padding: '1rem',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          backgroundColor: '#ffebee',
          marginTop: '0.5rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
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
          img: ObsidianImage
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </Paper>
  );
}
