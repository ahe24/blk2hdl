#!/usr/bin/env node
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

const args = process.argv.slice(2);
const command = args[0] || 'dev';

// Use local next binary
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');

let nextArgs;
if (command === 'dev') {
    nextArgs = ['dev', '-p', port, '-H', host];
} else if (command === 'start') {
    nextArgs = ['start', '-p', port, '-H', host];
} else if (command === 'build') {
    nextArgs = ['build'];
} else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

console.log(`Starting Next.js in ${command} mode on ${host}:${port}`);

const child = spawn(nextBin, nextArgs, {
    stdio: 'inherit',
    env: { ...process.env }
});

child.on('error', (err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code || 0);
});
