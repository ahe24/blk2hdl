#!/usr/bin/env node
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

const args = process.argv.slice(2);
const command = args[0] || 'dev';

// Try to find next binary (Windows uses .cmd extension)
const nextBinLocal = path.join(__dirname, 'node_modules', '.bin', 'next');
const nextBinCmd = process.platform === 'win32' ? `${nextBinLocal}.cmd` : nextBinLocal;
const nextBinExists = fs.existsSync(nextBinCmd);

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
    console.log(`Using local Next.js binary: ${nextBinCmd}`);
    nextCommand = nextBinCmd;
} else {
    console.log('Local Next.js binary not found, using npx');
    nextCommand = 'npx';
    nextArgs = ['next', ...nextArgs];
}

const spawnOptions = {
    stdio: ['inherit', 'inherit', 'pipe'], // Capture stderr
    env: { ...process.env }
};

// On Windows, shell is required to execute .cmd files
if (process.platform === 'win32') {
    spawnOptions.shell = true;
}

const child = spawn(nextCommand, nextArgs, spawnOptions);

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
