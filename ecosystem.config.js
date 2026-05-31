module.exports = {
  apps: [
    {
      name: 'simka-backend',
      script: 'dist/src/main.js',
      cwd: '/var/www/simka/apps/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
