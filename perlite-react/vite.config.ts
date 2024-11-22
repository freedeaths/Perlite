import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const vaultPath = env.VITE_VAULT_PATH || process.env.VITE_VAULT_PATH

  return {
    plugins: [
      react(),
      {
        name: 'vault-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api/files')) {
              try {
                if (!vaultPath) {
                  throw new Error('VITE_VAULT_PATH is not set');
                }

                if (!fs.existsSync(vaultPath)) {
                  throw new Error(`Vault path does not exist: ${vaultPath}`);
                }

                console.log('Reading vault from:', vaultPath);

                function buildFileTree(dir: string) {
                  try {
                    const items = [];
                    const files = fs.readdirSync(dir);
                    
                    for (const file of files) {
                      // 跳过 .DS_Store 文件
                      if (file === '.DS_Store') continue;
                      
                      try {
                        const fullPath = path.join(dir, file);
                        const stat = fs.statSync(fullPath);
                        const relativePath = path.relative(vaultPath, fullPath);
                        
                        if (stat.isDirectory()) {
                          const children = buildFileTree(fullPath);
                          if (children.length > 0) { // 只添加非空目录
                            items.push({
                              name: file,
                              path: relativePath,
                              type: 'directory',
                              children
                            });
                          }
                        } else if (file.endsWith('.md')) {
                          items.push({
                            name: file,
                            path: relativePath,
                            type: 'file'
                          });
                        }
                      } catch (fileError) {
                        console.error(`Error processing file ${file}:`, fileError);
                        // 继续处理其他文件
                        continue;
                      }
                    }
                    
                    return items;
                  } catch (dirError) {
                    console.error(`Error reading directory ${dir}:`, dirError);
                    return [];
                  }
                }

                const fileTree = buildFileTree(vaultPath);
                
                if (!fileTree || fileTree.length === 0) {
                  throw new Error(`No valid files found in vault: ${vaultPath}`);
                }
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(fileTree));
              } catch (error) {
                console.error('Server error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  error: 'Failed to read file tree', 
                  details: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined
                }));
              }
            } else if (req.url?.startsWith('/api/file')) {
              try {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const filePath = url.searchParams.get('path');
                
                if (!filePath) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'File path is required' }));
                  return;
                }

                if (!vaultPath) {
                  throw new Error('VITE_VAULT_PATH is not set');
                }

                const fullPath = path.join(vaultPath, filePath);
                
                // 安全检查：确保请求的文件在 vault 目录内
                const normalizedFullPath = path.normalize(fullPath);
                const normalizedVaultPath = path.normalize(vaultPath);
                
                if (!normalizedFullPath.startsWith(normalizedVaultPath)) {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: 'Access denied' }));
                  return;
                }

                if (!fs.existsSync(fullPath)) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'File not found' }));
                  return;
                }

                // 检查文件类型
                const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
                const isImage = mimeType.startsWith('image/');
                const isMarkdown = mimeType === 'text/markdown' || fullPath.endsWith('.md');

                if (isImage) {
                  // 如果是图片，直接返回图片数据
                  const imageData = fs.readFileSync(fullPath);
                  res.setHeader('Content-Type', mimeType);
                  res.end(imageData);
                } else if (isMarkdown) {
                  // 如果是 Markdown 文件，返回文本内容
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ content }));
                } else {
                  // 其他文件类型
                  res.statusCode = 415;
                  res.end(JSON.stringify({ error: 'Unsupported file type' }));
                }
              } catch (error) {
                console.error('Server error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  error: 'Failed to read file', 
                  details: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined
                }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
