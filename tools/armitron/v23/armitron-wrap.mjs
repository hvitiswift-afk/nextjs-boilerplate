#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { appendReceipt, Watchdog } from './armitron-clock.mjs';

function parse(argv) {
  const separator = argv.indexOf('--');
  if (separator < 0 || separator === argv.length - 1) {
    throw new Error('Usage: armitron-wrap.mjs --lane browser|email|github [--clock gray] -- command args...');
  }
  const flags = argv.slice(0, separator);
  const command = argv.slice(separator + 1);
  const options = {};
  for (let index = 0; index < flags.length; index += 1) {
    const token = flags[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = flags[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else options[key] = true;
  }
  return { options, command };
}

async function main() {
  const { options, command } = parse(process.argv.slice(2));
  const lane = String(options.lane || 'unknown');
  if (!['browser', 'email', 'github', 'general'].includes(lane)) throw new Error(`Unsupported Armitron lane: ${lane}`);
  const primaryClock = String(options.clock || 'wall');
  const eventId = randomUUID();
  const watchdog = new Watchdog(Number(options['maximum-drift-ms'] || 500));
  const started = process.hrtime.bigint();

  await appendReceipt({
    lane,
    action: 'COMMAND_START',
    status: 'STARTED',
    eventId,
    details: { commandName: command[0], argumentCount: command.length - 1, primaryClock }
  }, { primaryClock });

  const child = spawn(command[0], command.slice(1), { stdio: 'inherit', shell: false });
  const outcome = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  const durationMs = Number(process.hrtime.bigint() - started) / 1000000;
  const health = watchdog.health();
  const status = outcome.code === 0 && health.healthy ? 'SUCCEEDED' : health.healthy ? 'FAILED' : 'FAILED_CLOSED_CLOCK_DRIFT';

  await appendReceipt({
    lane,
    action: 'COMMAND_END',
    status,
    eventId,
    details: {
      commandName: command[0],
      argumentCount: command.length - 1,
      exitCode: outcome.code,
      signal: outcome.signal,
      durationMs,
      watchdog: health,
      primaryClock
    }
  }, { primaryClock });

  if (outcome.signal) process.kill(process.pid, outcome.signal);
  process.exitCode = outcome.code ?? 1;
}

main().catch(async (error) => {
  try {
    await appendReceipt({ lane: 'general', action: 'WRAPPER_ERROR', status: 'FAILED_CLOSED', details: { message: error.message } });
  } catch {}
  console.error(error.message);
  process.exitCode = 1;
});
