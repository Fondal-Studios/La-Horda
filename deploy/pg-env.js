"use strict";
// Convierte una dirección postgresql://usuario:clave@host:puerto/base?sslmode=... (variable PG_URL_IN) en variables PG* para
// pg_dump / pg_restore / psql, así la dirección y la clave NO aparecen en la lista de procesos (ps). Imprime líneas "export".
// Uso desde bash:  eval "$(PG_URL_IN="$URL" node deploy/pg-env.js)"
const q = s => "'" + String(s).replace(/'/g, "'\\''") + "'";
let u;
try{ u = new URL(process.env.PG_URL_IN || ""); }catch(e){ console.error("dirección de base inválida"); process.exit(1); }
if(!/^postgres(ql)?:$/.test(u.protocol)){ console.error("la dirección tiene que empezar con postgresql://"); process.exit(1); }
const out = { PGHOST: decodeURIComponent(u.hostname.replace(/^\[|\]$/g, "")), PGPORT: u.port || "5432", PGDATABASE: decodeURIComponent(u.pathname.replace(/^\//, "")) };
if(u.username) out.PGUSER = decodeURIComponent(u.username);
if(u.password) out.PGPASSWORD = decodeURIComponent(u.password);
const ssl = u.searchParams.get("sslmode"); if(ssl) out.PGSSLMODE = ssl;
for(const [k, v] of Object.entries(out)) console.log("export " + k + "=" + q(v));
