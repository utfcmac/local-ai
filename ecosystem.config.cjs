module.exports = {
  apps: [
    {
      name: "local-ai",
      script: ".next/standalone/ij_workspace/local-ai/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 3100,
      },
    },
  ],
};
