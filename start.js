#!/usr/bin/env node
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

const args = process.argv.slice(2);
const command = args[0] || 'dev';

// Try to find next binary
const nextBinLocal = path.join(__dirname, 'node_modules', '.bin', 'next');
const nextBinExists = fs.existsSync(nextBinLocal);

let nextCommand;
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

if (nextBinExists) {
    console.log(`Using local Next.js binary: ${nextBinLocal}`);
    nextCommand = nextBinLocal;
} else {
    console.log('Local Next.js binary not found, using npx');
    nextCommand = 'npx';
    nextArgs = ['next', ...nextArgs];
}

const child = spawn(nextCommand, nextArgs, {
    stdio: ['inherit', 'inherit', 'pipe'], // Capture stderr
    env: { ...process.env }
});

// Capture and log stderr
child.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data.toString()}`);
});

child.on('error', (err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
});

child.on('exit', (code, signal) => {
    if (code !== 0) {
        console.error(`Next.js exited with code ${code} and signal ${signal}`);
    }
    process.exit(code || 0);
});
