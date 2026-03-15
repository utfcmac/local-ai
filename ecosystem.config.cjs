const path = require('path');
const fs = require('fs');

// Dynamisch den Projektpfad ermitteln
const projectRoot = __dirname;

// Relativen App-Pfad aus required-server-files.json lesen
const requiredServerFiles = path.join(projectRoot, '.next/required-server-files.json');
let relativeAppDir = '';

if (fs.existsSync(requiredServerFiles)) {
  const serverConfig = JSON.parse(fs.readFileSync(requiredServerFiles, 'utf-8'));
  relativeAppDir = serverConfig.relativeAppDir || '';
}

const standalonePath = relativeAppDir
  ? path.join(projectRoot, '.next/standalone', relativeAppDir)
  : path.join(projectRoot, '.next/standalone');

module.exports = {
  apps: [
    {
      name: "local-ai",
      script: path.join(standalonePath, 'server.js'),
      cwd: projectRoot,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 3100,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
