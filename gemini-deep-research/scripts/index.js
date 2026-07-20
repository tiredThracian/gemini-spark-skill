#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Target the core gemini-spark index.js
const coreScriptPath = path.resolve(__dirname, '../../gemini-spark/scripts/index.js');

// Parse current process arguments (excluding node and script path)
const originalArgs = process.argv.slice(2);

// Check if --deep or -d is already present, if not add --deep
const args = [...originalArgs];
if (!args.includes('--deep') && !args.includes('-d')) {
  args.push('--deep');
}

// Spawn the core script
const child = spawn('node', [coreScriptPath, ...args], {
  stdio: 'inherit',
  shell: false
});

child.on('close', (code) => {
  process.exit(code);
});
