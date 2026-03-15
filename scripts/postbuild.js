#!/usr/bin/env node

/**
 * Post-build script for Next.js standalone deployment
 * Copies static assets and necessary files to standalone build
 */

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 Post-build: Copying assets to standalone build...\n');

const projectRoot = process.cwd();

// Dynamisch den relativen App-Pfad aus required-server-files.json lesen
const requiredServerFiles = path.join(projectRoot, '.next/required-server-files.json');
let relativeAppDir = '';

if (fs.existsSync(requiredServerFiles)) {
  const serverConfig = JSON.parse(fs.readFileSync(requiredServerFiles, 'utf-8'));
  relativeAppDir = serverConfig.relativeAppDir || '';
  console.log(`📍 Detected app directory: ${relativeAppDir || '(root)'}\n`);
}

const standalonePath = relativeAppDir
  ? path.join(projectRoot, '.next/standalone', relativeAppDir)
  : path.join(projectRoot, '.next/standalone');

// Check if standalone build exists
if (!fs.existsSync(standalonePath)) {
  console.error('❌ Error: Standalone build not found at:', standalonePath);
  process.exit(1);
}

// 1. Copy .next/static to standalone
const staticSrc = path.join(projectRoot, '.next/static');
const staticDest = path.join(standalonePath, '.next/static');

if (fs.existsSync(staticSrc)) {
  console.log('📁 Copying .next/static...');
  copyRecursive(staticSrc, staticDest);
  console.log('✅ Static files copied\n');
} else {
  console.warn('⚠️  Warning: .next/static not found\n');
}

// 2. Copy public folder to standalone
const publicSrc = path.join(projectRoot, 'public');
const publicDest = path.join(standalonePath, 'public');

if (fs.existsSync(publicSrc)) {
  console.log('📁 Copying public...');
  copyRecursive(publicSrc, publicDest);
  console.log('✅ Public files copied\n');
} else {
  console.log('ℹ️  No public folder found (optional)\n');
}

// 3. Copy better-sqlite3 native module
const sqliteSrc = path.join(projectRoot, 'node_modules/better-sqlite3/build');
const sqliteDest = path.join(standalonePath, 'node_modules/better-sqlite3/build');

if (fs.existsSync(sqliteSrc)) {
  console.log('📁 Copying better-sqlite3 native module...');
  copyRecursive(sqliteSrc, sqliteDest);
  console.log('✅ SQLite3 module copied\n');
} else {
  console.warn('⚠️  Warning: better-sqlite3 build not found\n');
}

console.log('✨ Post-build complete!\n');
console.log('🚀 Ready for deployment with:');
const serverPath = relativeAppDir
  ? path.join('.next/standalone', relativeAppDir, 'server.js')
  : '.next/standalone/server.js';
console.log(`   node ${serverPath}`);
console.log('   or: pm2 start ecosystem.config.cjs\n');
