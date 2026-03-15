#!/usr/bin/env node

/**
 * Dynamischer Starter für den Standalone Server
 * Liest den Pfad automatisch aus required-server-files.json
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = process.cwd();
const requiredServerFiles = path.join(projectRoot, '.next/required-server-files.json');

if (!fs.existsSync(requiredServerFiles)) {
  console.error('❌ Error: .next/required-server-files.json not found');
  console.error('   Run "npm run build" first!');
  process.exit(1);
}

const serverConfig = JSON.parse(fs.readFileSync(requiredServerFiles, 'utf-8'));
const relativeAppDir = serverConfig.relativeAppDir || '';

const serverPath = relativeAppDir
  ? path.join(projectRoot, '.next/standalone', relativeAppDir, 'server.js')
  : path.join(projectRoot, '.next/standalone/server.js');

if (!fs.existsSync(serverPath)) {
  console.error('❌ Error: Server not found at:', serverPath);
  process.exit(1);
}

console.log('🚀 Starting standalone server...');
console.log('📂 Server path:', serverPath);

// Server starten und Ausgabe durchreichen
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('exit', (code) => {
  process.exit(code);
});
