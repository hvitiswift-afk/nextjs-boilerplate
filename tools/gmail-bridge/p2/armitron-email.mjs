#!/usr/bin/env node
import { spawn } from 'node:child_process';

const args = [
  'tools/armitron/v23/armitron-wrap.mjs',
  '--lane', 'email',
  '--clock', process.env.JP_ARMITRON_EMAIL_CLOCK || 'atomic',
  '--',
  process.execPath,
  'tools/gmail-bridge/p2/gmail-dual-account.mjs',
  ...process.argv.slice(2)
];

const child = spawn(process.execPath, args, { stdio: 'inherit', shell: false });
child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
