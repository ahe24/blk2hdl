module.exports = {
  apps: [{
    name: 'block2hdl',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      HOST: process.env.HOST || '0.0.0.0',
      PORT: process.env.PORT || 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
