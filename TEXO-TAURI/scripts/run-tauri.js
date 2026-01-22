import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

const cargoBin = join(homedir(), '.cargo', 'bin');
const env = { ...process.env };
const isWindows = platform() === 'win32';
const existingPath = env.PATH || env.Path || '';
if (!existingPath.includes(cargoBin)) {
  const sep = isWindows ? ';' : ':';
  const nextPath = existingPath ? `${cargoBin}${sep}${existingPath}` : cargoBin;
  env.PATH = nextPath;
  env.Path = nextPath;
}
const cargoExe = isWindows ? join(cargoBin, 'cargo.exe') : join(cargoBin, 'cargo');
if (existsSync(cargoExe)) {
  env.CARGO = cargoExe;
}

const action = process.argv[2] || 'dev';
const localTauri =
  isWindows
    ? join(process.cwd(), 'node_modules', '.bin', 'tauri.cmd')
    : join(process.cwd(), 'node_modules', '.bin', 'tauri');
const command = existsSync(localTauri) ? localTauri : 'tauri';
let child;
if (isWindows) {
  const quoted = command.includes(' ') ? `"${command}"` : command;
  const cmd = env.ComSpec || 'cmd.exe';
  child = spawn(cmd, ['/d', '/s', '/c', `${quoted} ${action}`], {
    stdio: 'inherit',
    env
  });
} else {
  child = spawn(command, [action], {
    stdio: 'inherit',
    env
  });
}

child.on('exit', (code) => process.exit(code ?? 1));
