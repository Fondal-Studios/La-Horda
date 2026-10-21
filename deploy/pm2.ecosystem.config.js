"use strict";
// ALTERNATIVA a systemd: pm2. Instalación:  npm i -g pm2 && pm2 start deploy/pm2.ecosystem.config.js && pm2 save && pm2 startup
// Lee el MISMO archivo de entorno que la unidad systemd (necesita Node 20.6 o más nuevo para --env-file).
// Ojo: con pm2 el reinicio y los logs cambian: pm2 restart la-horda · pm2 logs la-horda. Los scripts deploy/update.sh y
// deploy/rollback.sh asumen systemd; si usás pm2, ponelos con RESTART_CMD="pm2 restart la-horda".
module.exports = {
  apps: [{
    name: "la-horda",
    script: "/opt/la-horda/server/relay.js",
    cwd: "/opt/la-horda/server",
    node_args: "--env-file=/etc/la-horda/la-horda.env",
    env: { NODE_ENV: "production", DATA_DIR: "/var/lib/la-horda" },
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    max_memory_restart: "1G",
    time: true
  }]
};
