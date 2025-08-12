import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const app = express();

// CLI引数の解析
const args = process.argv.slice(2);
let jsonlPath = null;
let port = 3001;
let host = 'localhost';
let enableBackup = true;
let verbose = false;
let quiet = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--jsonl-path':
      if (args[i + 1]) {
        jsonlPath = path.resolve(args[i + 1]);
        i++;
      }
      break;
    case '--port':
      if (args[i + 1]) {
        port = parseInt(args[i + 1]);
        i++;
      }
      break;
    case '--host':
      if (args[i + 1]) {
        host = args[i + 1];
        i++;
      }
      break;
    case '--no-backup':
      enableBackup = false;
      break;
    case '--verbose':
      verbose = true;
      break;
    case '--quiet':
      quiet = true;
      break;
  }
}

// Logger utility
const log = {
  info: (msg) => !quiet && console.log(chalk.blue(`[INFO] ${new Date().toISOString()}`), msg),
  warn: (msg) => console.warn(chalk.yellow(`[WARN] ${new Date().toISOString()}`), msg),
  error: (msg) => console.error(chalk.red(`[ERROR] ${new Date().toISOString()}`), msg),
  success: (msg) => !quiet && console.log(chalk.green(`[SUCCESS] ${new Date().toISOString()}`), msg),
  verbose: (msg) => verbose && console.log(chalk.gray(`[VERBOSE] ${new Date().toISOString()}`), msg)
};

log.verbose('Starting CLI argument parsing...');
if (jsonlPath) {
  log.success(`JSONL path configured: ${chalk.cyan(jsonlPath)}`);
} else {
  log.warn('No --jsonl-path specified. Server will operate in limited mode.');
  log.info('Usage: node server.js --jsonl-path <path-to-jsonl-file-or-directory>');
}

if (!enableBackup) {
  log.info('Automatic backup creation disabled');
}

if (host !== 'localhost') {
  log.info(`Host configured: ${chalk.cyan(host)}`);
}

app.use(cors());
app.use(express.json());

// 指定されたパスの情報を取得
async function getPathInfo(targetPath) {
  log.verbose(`Checking path: ${targetPath}`);
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      log.verbose(`Path is directory: ${targetPath}`);
      const files = await fs.readdir(targetPath);
      const jsonlFiles = files
        .filter(file => file.endsWith('.jsonl'))
        .map(file => ({
          name: file,
          path: path.join(targetPath, file),
          isFile: true
        }));
      log.success(`Found ${jsonlFiles.length} JSONL files in directory: ${chalk.cyan(jsonlFiles.map(f => f.name).join(', '))}`);
      return { isDirectory: true, files: jsonlFiles };
    } else {
      log.verbose(`Path is file: ${targetPath}`);
      return { isDirectory: false, filePath: targetPath };
    }
  } catch (error) {
    log.error(`Failed to access path: ${chalk.red(targetPath)} - ${error.message}`);
    throw new Error(`Path not found: ${targetPath}`);
  }
}

// API エンドポイント
app.get('/api/config', async (req, res) => {
  log.info('GET /api/config - Client requesting configuration');
  if (!jsonlPath) {
    log.warn('Config requested but no --jsonl-path specified');
    return res.json({ error: 'No --jsonl-path specified' });
  }
  
  try {
    const pathInfo = await getPathInfo(jsonlPath);
    log.success('Configuration sent to client');
    res.json({ 
      jsonlPath,
      ...pathInfo
    });
  } catch (error) {
    log.error(`Config request failed: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
});

// ファイル一覧取得
app.get('/api/files', async (req, res) => {
  log.info('GET /api/files - Client requesting file list');
  if (!jsonlPath) {
    log.warn('File list requested but no --jsonl-path specified');
    return res.status(400).json({ error: 'No --jsonl-path specified' });
  }
  
  try {
    const pathInfo = await getPathInfo(jsonlPath);
    if (pathInfo.isDirectory) {
      log.success(`Sent file list: ${pathInfo.files.length} files`);
      res.json({ files: pathInfo.files });
    } else {
      const fileName = path.basename(jsonlPath);
      log.success(`Sent single file: ${fileName}`);
      res.json({ files: [{ name: fileName, path: jsonlPath, isFile: true }] });
    }
  } catch (error) {
    log.error(`File list request failed: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
});

// ファイル読み込み
app.get('/api/files/:filename', async (req, res) => {
  const filename = req.params.filename;
  log.info(`GET /api/files/${filename} - Client requesting file content`);
  
  if (!jsonlPath) {
    log.warn(`File read requested for ${filename} but no --jsonl-path specified`);
    return res.status(400).json({ error: 'No --jsonl-path specified' });
  }
  
  try {
    const pathInfo = await getPathInfo(jsonlPath);
    let filePath;
    
    if (pathInfo.isDirectory) {
      filePath = path.join(jsonlPath, filename);
      log.info(`Reading file from directory: ${filePath}`);
    } else {
      filePath = jsonlPath;
      log.info(`Reading single file: ${filePath}`);
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').length - 1;
    log.success(`File read successfully: ${filename} (${content.length} characters, ~${lines} lines)`);
    res.json({ content, filePath });
  } catch (error) {
    log.error(`Failed to read file ${filename}: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
});

// ファイル保存
app.post('/api/files/:filename', async (req, res) => {
  const filename = req.params.filename;
  log.info(`POST /api/files/${filename} - Client requesting file save`);
  
  if (!jsonlPath) {
    log.warn(`File save requested for ${filename} but no --jsonl-path specified`);
    return res.status(400).json({ error: 'No --jsonl-path specified' });
  }
  
  try {
    const { content } = req.body;
    const pathInfo = await getPathInfo(jsonlPath);
    let filePath;
    
    if (pathInfo.isDirectory) {
      filePath = path.join(jsonlPath, filename);
      log.info(`Saving file to directory: ${filePath}`);
    } else {
      filePath = jsonlPath;
      log.info(`Saving to single file: ${filePath}`);
    }
    
    // バックアップ作成（有効な場合のみ）
    if (enableBackup) {
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8');
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.writeFile(backupPath, existingContent, 'utf-8');
        log.verbose(`Backup created: ${chalk.gray(backupPath)}`);
      } catch (backupError) {
        log.warn(`Could not create backup (file may be new): ${backupError.message}`);
      }
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    const lines = content.split('\n').length - 1;
    log.success(`File saved successfully: ${filename} (${content.length} characters, ~${lines} lines)`);
    res.json({ success: true, filePath });
  } catch (error) {
    log.error(`Failed to save file ${filename}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ポート使用可能性チェック
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

// 利用可能ポート検索
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const testPort = startPort + i;
    if (await isPortAvailable(testPort)) {
      return testPort;
    }
  }
  return null;
}

// サーバー起動
async function startServer() {
  try {
    // 指定ポートをチェック
    const isAvailable = await isPortAvailable(port);
    
    if (!isAvailable) {
      log.warn(`Port ${port} is already in use, searching for available port...`);
      
      const availablePort = await findAvailablePort(port);
      if (availablePort) {
        port = availablePort;
        log.info(`Using alternative port: ${chalk.cyan(port)}`);
      } else {
        log.error('No available ports found in range');
        process.exit(1);
      }
    }

    app.listen(port, host, () => {
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      log.success(`Server started on ${chalk.cyan(`http://${displayHost}:${port}`)}`);
      
      if (host === '0.0.0.0') {
        log.info(`Network access enabled - available on all interfaces`);
      } else if (host !== 'localhost') {
        log.info(`Custom host binding: ${chalk.cyan(host)}`);
      }
      
      if (jsonlPath) {
        log.info(`JSONL path configured: ${chalk.cyan(jsonlPath)}`);
        log.info('Server ready to handle file operations');
      } else {
        log.warn('Server started in limited mode - no file path specified');
        log.info('Use --jsonl-path <path> to specify target files');
      }
      log.verbose('Available endpoints: GET /api/config, GET /api/files, GET /api/files/:filename, POST /api/files/:filename');
    });

  } catch (error) {
    log.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();