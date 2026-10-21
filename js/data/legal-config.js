"use strict";
/* ============================================================
   js/data/legal-config.js
   Datos de la parte legal y de soporte que ve el jugador. PÚBLICO (va al navegador): no pongas acá nada secreto.
   Lo lee el juego (js/ui/legal.js) y el generador de las páginas (node tools/release/build-legal.js → legal/*.html).
   Después de cambiar algo acá: node tools/release/build-legal.js  (regenera legal/*.html) y volvé a publicar.
   Guía: docs/commercial/CHECKLIST_ULTIMA_PRUEBA.md (sección "Legal y soporte").
   ============================================================ */
var HORDA_LEGAL = {
  // true mientras los textos de docs/legal/ sean BORRADOR sin revisar por un abogado. Muestra un aviso bien visible en
  // las páginas legales y una marca "borrador" junto a los enlaces del juego. Ponelo en false SOLO cuando el abogado
  // haya aprobado los textos y hayas completado todos los [CORCHETES] de docs/legal/*.md.
  draft: true,
  // COMPLETAR: correo REAL de soporte (alguien tiene que leerlo y contestar). Vacío = el juego muestra "correo de soporte
  // sin configurar" y el preflight (tools/release/preflight.js) lo marca en rojo antes de cobrar.
  supportEmail: "",
  // Correo para pedidos de privacidad (acceder/corregir/borrar datos). Vacío = se usa supportEmail.
  privacyEmail: "",
  // Horario de atención, texto libre (ej. "lunes a viernes de 10 a 18 h, hora de Argentina"). Opcional.
  supportHours: "",
  // Edad mínima para crear cuenta. PROVISORIO: la define el abogado (el borrador sugiere 13).
  minAge: 13,
  // Cambiá esta versión cuando cambien los términos: se vuelve a pedir la aceptación a quien ya había aceptado.
  termsVersion: "2026-10-borrador-1",
  // Carpeta de las páginas, relativa a la página del juego.
  base: "legal/"
};
