#!/usr/bin/env node
require('dotenv').config();
const { spawn } = require('child_process');

const port = process.env.PORT || '3000';
const host = process.env.HOST || '0.0.0.0';

const args = process.argv.slice(2);
const command = args[0] || 'dev';

let nextCommand;
if (command === 'dev') {
    nextCommand = ['next', 'dev', '-p', port, '-H', host];
} else if (command === 'start') {
    nextCommand = ['next', 'start', '-p', port, '-H', host];
} else if (command === 'build') {
    nextCommand = ['next', 'build'];
} else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

const child = spawn('npx', nextCommand, {
    stdio: 'inherit',
    shell: true
});

child.on('exit', (code) => {
    process.exit(code);
});
