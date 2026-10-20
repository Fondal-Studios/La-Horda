"use strict";
// CHEQUEO DE MERCADO PAGO. Dice qué falta cargar en el servidor y hace un ensayo local con un Mercado Pago FALSO.
//   node tools/release/mp-readiness.js              -> chequeo del entorno + ensayo local
//   node tools/release/mp-readiness.js --no-rehearsal  -> solo el chequeo del entorno
//   node tools/release/mp-readiness.js --strict     -> sale con error si falta algo para cobrar (útil antes de prender el interruptor)
// NUNCA imprime valores secretos (solo "cargado" / "falta" / largo mínimo). NUNCA llama a Mercado Pago: el ensayo usa 127.0.0.1.
// Correrlo EN EL SERVIDOR, con las variables de entorno cargadas. No verifica nada contra la cuenta real (eso es la prueba sandbox).
const { spawnSync } = require("child_process");
const path = require("path");
const env = process.env, argv = process.argv.slice(2);
const has = k => (env[k] || "").trim().length > 0;
const rows = [];
const add = (level, name, ok, hint) => rows.push({ level, name, ok: !!ok, hint: ok ? "" : hint });

const live = (env.MP_MODE || "").trim() ? env.MP_MODE.trim().toLowerCase() === "live" : env.MP_LIVE_MODE === "true";
const modeOk = /^(sandbox|live)$/.test((env.MP_MODE || "").trim().toLowerCase()) || (!(env.MP_MODE || "").trim() && /^(true|false)$/.test(env.MP_LIVE_MODE || ""));
const token = (env.MP_ACCESS_TOKEN || "").trim();

add("req", "PAYMENTS_PROVIDER=mercadopago", (env.PAYMENTS_PROVIDER || "").trim().toLowerCase() === "mercadopago", "poné PAYMENTS_PROVIDER=mercadopago");
add("req", "MP_MODE (sandbox o live)", modeOk, "poné MP_MODE=sandbox para probar, MP_MODE=live para cobrar de verdad");
add("req", "MP_ACCESS_TOKEN cargado", token.length >= 16, "copialo de Mercado Pago Developers > Tus integraciones > Credenciales");
if(token) add("warn", "el token es coherente con el modo", live ? !/^TEST-/.test(token) : true, "estás en live con un token que empieza con TEST-: son credenciales de prueba");
add("req", "MP_WEBHOOK_SECRET (mín. 32 caracteres)", (env.MP_WEBHOOK_SECRET || "").length >= 32, "copialo de Tus integraciones > Webhooks > Clave secreta");
add("req", "PAYMENTS_ORDER_SECRET (mín. 32 caracteres)", (env.PAYMENTS_ORDER_SECRET || "").length >= 32, "generalo con: openssl rand -hex 32");
add("req", "MP_COLLECTOR_ID (solo dígitos)", /^\d+$/.test(env.MP_COLLECTOR_ID || ""), "es el número de usuario de la cuenta vendedora");
add("req", "MP_ARS_PER_USD (cotización > 0)", Number(env.MP_ARS_PER_USD) > 0, "pesos por dólar, ej. 1200 (decisión tuya; revisala seguido)");
add("req", "PAYMENTS_NOTIFY_URL (HTTPS)", /^https:\/\//.test(env.PAYMENTS_NOTIFY_URL || ""), "ej. https://fondalstudios.com/la-horda/red/api/payments/webhook");
add("req", "PAYMENTS_SUCCESS_URL (HTTPS)", /^https:\/\//.test(env.PAYMENTS_SUCCESS_URL || ""), "ej. https://fondalstudios.com/la-horda/jugar/");
add("req", "base de datos persistente", has("DATABASE_URL") || (has("DATA_DIR") && env.DATA_PERSISTENT === "1"), "DATABASE_URL, o DATA_DIR + DATA_PERSISTENT=1 con un volumen verificado (sin esto el servidor se niega a cobrar)");
add("warn", "MP_PUBLIC_KEY cargada (hoy el código no la usa)", has("MP_PUBLIC_KEY"), "opcional con Checkout Pro");
add("warn", "MP_API_BASE vacío (solo para ensayos)", !has("MP_API_BASE"), "borrá MP_API_BASE del servidor real");
add("warn", "MP_REQUIRE_EMAIL no desactivado", !/^(0|false)$/i.test((env.MP_REQUIRE_EMAIL || "").trim()), "se recomienda exigir correo para el comprobante");
if(live) add("warn", "PAYMENTS_PACK_IDS definido para el lanzamiento", has("PAYMENTS_PACK_IDS"), "sin esto se ofrecen los packs normales; con 'brasas_inicio,brasas_coleccion' la oferta de lanzamiento");

const sw = /^(1|true)$/i.test((env.MP_ENABLED || "").trim());
const missing = rows.filter(r => r.level === "req" && !r.ok);

console.log("== Mercado Pago: estado del servidor ==");
console.log("Interruptor MP_ENABLED : " + (sw ? "PRENDIDO (1)" : "APAGADO (la tienda dice 'Muy pronto')"));
console.log("Modo                   : " + (modeOk ? (live ? "LIVE (plata real)" : "SANDBOX (pruebas)") : "no definido"));
for(const r of rows) console.log("  " + (r.ok ? "[ok]   " : r.level === "req" ? "[FALTA]" : "[aviso]") + " " + r.name + (r.ok ? "" : "  ->  " + r.hint));
console.log(missing.length ? `\nFaltan ${missing.length} dato(s) obligatorio(s): no se puede cobrar todavía.` : "\nConfiguración obligatoria completa." + (sw ? "" : " Falta prender MP_ENABLED=1 cuando termines la prueba sandbox."));
if(live && !sw && !missing.length) console.log("Estás en LIVE con el interruptor apagado: es lo correcto hasta terminar el checklist final.");

let rehearsalFail = false;
if(!argv.includes("--no-rehearsal")){
  console.log("\n== Ensayo local con Mercado Pago FALSO (sin red externa, sin tus credenciales) ==");
  // entorno limpio: el ensayo no hereda ninguna variable real
  const clean = { PATH: env.PATH || "", HOME: env.HOME || "", TMPDIR: env.TMPDIR || "" };
  const r = spawnSync(process.execPath, [path.join(__dirname, "mp-flow-test.js")], { env: clean, encoding: "utf8", timeout: 120000 });
  const out = (r.stdout || "").split("\n").filter(l => !/^\d{4}-\d{2}-\d{2}T/.test(l)).join("\n").trim();
  console.log(out || (r.stderr || "").slice(0, 800));
  rehearsalFail = r.status !== 0;
}
console.log("\nOJO: esto NO prueba tu cuenta real de Mercado Pago. Para eso hace falta la prueba sandbox con usuarios de prueba (ver docs/commercial/MERCADO_PAGO_PASO_A_PASO.md).");
process.exitCode = rehearsalFail ? 1 : (argv.includes("--strict") && (missing.length || !sw) ? 1 : 0);
