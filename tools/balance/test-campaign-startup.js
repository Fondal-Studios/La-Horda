'use strict';
// A real browser hitting a permanently unavailable URL must terminate, not retry forever.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
test('campaign closes the browser after three failed navigations', { timeout: 25000 }, async () => {
  const child = spawn(process.execPath, [path.join(__dirname, 'campaign_runs.js'), 'ciudad'], {
    env: { ...process.env, GAME_URL: 'http://127.0.0.1:1/', PLAYWRIGHT_MODULE: require.resolve('playwright') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', data => { stdout += data; });
  child.stderr.on('data', data => { stderr += data; });
  const timer = setTimeout(() => child.kill('SIGKILL'), 20000);
  try {
    const [code, signal] = await new Promise((resolve, reject) => {
      child.once('error', reject); child.once('close', (code, signal) => resolve([code, signal]));
    });
    assert.equal(signal, null, stderr);
    assert.equal(code, 1, stderr);
    assert.equal(stdout, '');
    assert.equal((stderr.match(/retrying/g) || []).length, 2, stderr);
    assert.match(stderr, /Campaign navigation failed after 3 attempts for ciudad/);
  } finally { clearTimeout(timer); if (child.exitCode === null) child.kill('SIGKILL'); }
});
