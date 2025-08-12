#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// パッケージ情報読み込み
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, 'package.json'), 'utf-8')
);

// CLI設定
program
  .name('jsonl-editor')
  .description('Claude Code JSONL Editor - Interactive editor for JSONL conversation files')
  .version(packageJson.version)
  .option('-p, --jsonl-path <path>', 'Path to JSONL file or directory containing JSONL files')
  .option('-P, --port <port>', 'Server port (default: 3001)', '3001')
  .option('--client-port <port>', 'Client port (default: 5173)', '5173')
  .option('--host <host>', 'Host to bind to (default: localhost)', 'localhost')
  .option('--expose', 'Expose server to network (same as --host 0.0.0.0)')
  .option('--no-backup', 'Disable automatic backup creation when saving files')
  .option('--server-only', 'Start only the server (no client)')
  .option('--client-only', 'Start only the client (no server)')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress non-error output')
  .helpOption('-h, --help', 'Display help information')
  .addHelpText('after', `
${chalk.cyan('Examples:')}
  ${chalk.gray('# Start with default samples')}
  ${chalk.green('jsonl-editor')}
  
  ${chalk.gray('# Start with JSONL file')}
  ${chalk.green('jsonl-editor -p ./conversation.jsonl')}
  
  ${chalk.gray('# Start with directory')}
  ${chalk.green('jsonl-editor -p ./jsonl-files')}
  
  ${chalk.gray('# Custom ports')}
  ${chalk.green('jsonl-editor -p ./data --port 4000 --client-port 8080')}
  
  ${chalk.gray('# Network access')}
  ${chalk.green('jsonl-editor -p ./data --expose')}
  ${chalk.green('jsonl-editor -p ./data --host 192.168.1.100')}
  
  ${chalk.gray('# Server only mode')}
  ${chalk.green('jsonl-editor -p ./data --server-only')}

${chalk.cyan('Features:')}
  • Interactive chat-style JSONL editing
  • Real-time file system synchronization
  • Automatic backup creation
  • Multi-file support
  • Edit, copy, delete messages
  • Export functionality
`);

program.parse();

const options = program.opts();

// --expose フラグの処理
if (options.expose) {
  options.host = '0.0.0.0';
}

// ロガー設定
const log = {
  info: (msg) => !options.quiet && console.log(chalk.blue('ℹ'), msg),
  success: (msg) => !options.quiet && console.log(chalk.green('✓'), msg),
  warn: (msg) => console.warn(chalk.yellow('⚠'), msg),
  error: (msg) => console.error(chalk.red('✗'), msg),
  verbose: (msg) => options.verbose && console.log(chalk.gray('→'), msg)
};

// バナー表示
if (!options.quiet) {
  console.log(chalk.cyan.bold('\n📝 Claude Code JSONL Editor'));
  console.log(chalk.gray(`Version ${packageJson.version}\n`));
}

// 設定検証
if (options.jsonlPath) {
  try {
    const resolvedPath = path.resolve(options.jsonlPath);
    await fs.access(resolvedPath);
    log.success(`Target path: ${chalk.cyan(resolvedPath)}`);
  } catch (error) {
    log.error(`Cannot access path: ${chalk.red(options.jsonlPath)}`);
    process.exit(1);
  }
} else {
  // samplesフォルダがある場合はデフォルトで使用
  try {
    const samplesPath = path.resolve('./samples');
    await fs.access(samplesPath);
    const stat = await fs.stat(samplesPath);
    if (stat.isDirectory()) {
      options.jsonlPath = samplesPath;
      log.success(`Using default samples directory: ${chalk.cyan(samplesPath)}`);
    }
  } catch (error) {
    log.warn('No JSONL path specified and no samples/ directory found');
    log.info(`Create a ${chalk.cyan('samples/')} directory or use ${chalk.cyan('--jsonl-path <path>')} to edit files`);
  }
}

// 共有変数
let server = null;
let client = null;
let actualServerPort = options.port;

// サーバー起動
if (!options.clientOnly) {
  log.verbose('Preparing server startup...');
  
  const serverArgs = ['server.js'];
  if (options.jsonlPath) {
    serverArgs.push('--jsonl-path', options.jsonlPath);
  }
  if (options.port !== '3001') {
    serverArgs.push('--port', options.port);
  }
  if (options.noBackup) {
    serverArgs.push('--no-backup');
  }
  if (options.verbose) {
    serverArgs.push('--verbose');
  }
  if (options.quiet) {
    serverArgs.push('--quiet');
  }
  if (options.host !== 'localhost') {
    serverArgs.push('--host', options.host);
  }

  server = spawn('node', serverArgs, {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output.trim());
    
    // ポート変更を検出
    const portMatch = output.match(/Using alternative port: (\d+)/);
    if (portMatch) {
      actualServerPort = portMatch[1];
      log.info(`Server switched to port ${chalk.cyan(actualServerPort)}`);
    }
  });

  server.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(output.trim());
    
    // EADDRINUSE エラーを検出
    if (output.includes('EADDRINUSE')) {
      log.error(`Port ${options.port} is already in use!`);
      log.info('Server will automatically find an available port...');
    }
  });

  server.on('error', (error) => {
    log.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  });
}

// クライアント起動
if (!options.serverOnly) {
  setTimeout(() => {
    log.verbose('Starting client...');
    
    client = spawn('npm', ['run', 'client'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'], // stdin を無視してttyエラーを回避
      env: { 
        ...process.env, 
        PORT: options.clientPort,
        VITE_SERVER_PORT: options.port,
        CI: 'true', // Viteのインタラクティブモードを無効化
        HOST: options.host
      }
    });

    // クライアントの出力を処理
    client.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });

    client.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (!output.includes('setRawMode EIO')) { // ttyエラーを除外
        console.error(output);
      }
    });

    client.on('error', (error) => {
      log.error(`Client failed to start: ${error.message}`);
      process.exit(1);
    });

    // 終了処理
    const cleanup = () => {
      log.info('\nShutting down...');
      if (server) {
        server.kill('SIGTERM');
      }
      if (client) {
        client.kill('SIGTERM');
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    client.on('close', () => {
      if (server) {
        server.kill('SIGTERM');
      }
      process.exit(0);
    });

    if (server) {
      server.on('close', () => {
        if (client) {
          client.kill('SIGTERM');
        }
        process.exit(0);
      });
    }

  }, options.serverOnly ? 0 : 1500);
}

// 起動完了メッセージ
setTimeout(() => {
  if (!options.quiet && !options.serverOnly && !options.clientOnly) {
    console.log(chalk.green('\n🎉 JSONL Editor is ready!'));
    
    const host = options.host === '0.0.0.0' ? 'localhost' : options.host;
    console.log(chalk.gray(`   Server: http://${host}:${actualServerPort || options.port}`));
    console.log(chalk.gray(`   Client: http://${host}:${options.clientPort}`));
    
    if (options.host === '0.0.0.0') {
      console.log(chalk.cyan(`   Network: Available on your network`));
      console.log(chalk.gray(`     Server: http://<your-ip>:${actualServerPort || options.port}`));
      console.log(chalk.gray(`     Client: http://<your-ip>:${options.clientPort}`));
    } else if (options.host !== 'localhost') {
      console.log(chalk.cyan(`   Custom host: ${options.host}`));
    }
    
    if (actualServerPort && actualServerPort !== options.port) {
      console.log(chalk.yellow(`   Note: Server port changed from ${options.port} to ${actualServerPort}`));
    }
    console.log(chalk.gray(`   Press Ctrl+C to stop\n`));
  }
}, 3000);