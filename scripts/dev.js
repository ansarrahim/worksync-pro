const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

const processes = [
  {
    name: 'backend',
    command: isWindows ? 'cmd.exe' : 'node',
    args: isWindows ? ['/c', 'node server.js'] : [path.join(root, 'backend', 'server.js')],
    cwd: path.join(root, 'backend')
  },
  {
    name: 'frontend',
    command: isWindows ? 'cmd.exe' : 'npm',
    args: isWindows ? ['/c', 'npm.cmd start'] : ['start'],
    cwd: path.join(root, 'frontend'),
    env: { BROWSER: 'none' }
  }
];

const children = processes.map(({ name, command, args, cwd, env }) => {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: false
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] stopped by ${signal}`);
      return;
    }

    if (code !== 0) {
      console.log(`[${name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) child.kill();
  });
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

console.log('WorkSync Pro is starting...');
console.log('Backend:  http://localhost:5000');
console.log('Frontend: http://localhost:3000');
