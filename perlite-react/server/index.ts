import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 从环境变量或配置文件中获取 vault 路径
const VAULT_PATH = process.env.VAULT_PATH || path.join(__dirname, '../vault');

app.use(cors());
app.use(express.json());

// 获取文件树结构
app.get('/api/files', async (req, res) => {
  try {
    const fileTree = await buildFileTree(VAULT_PATH);
    res.json(fileTree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read file tree' });
  }
});

// 读取特定文件内容
app.get('/api/file', async (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  try {
    const fullPath = path.join(VAULT_PATH, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

async function buildFileTree(dir: string) {
  const files = await fs.readdir(dir);
  const tree = [];

  for (const file of files) {
    if (file.startsWith('.')) continue; // 跳过隐藏文件

    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    const relativePath = path.relative(VAULT_PATH, fullPath);

    if (stat.isDirectory()) {
      const children = await buildFileTree(fullPath);
      tree.push({
        name: file,
        path: relativePath,
        type: 'directory',
        children
      });
    } else if (file.endsWith('.md')) {
      tree.push({
        name: file,
        path: relativePath,
        type: 'file'
      });
    }
  }

  return tree;
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
