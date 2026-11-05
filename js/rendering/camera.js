"use strict";
/* ============================================================
   js/rendering/camera.js
   Cámara: qué está a la vista y conversión de coordenadas del mundo a la pantalla.
   ============================================================ */

// CAM_LIFT: la cámara se levanta (unidades del mundo) para que entre un jefe enorme que está
// arriba del jugador (La Madre Espora). 0 en el resto del juego: la cámara sigue centrada en `player`.
// CAM_SUBJECT: a quién sigue la cámara. null = al jugador (siempre, salvo cuando un modo con espectador lo cambia: Coliseo).
let CAM_SUBJECT = null;
function camSub(){ return CAM_SUBJECT || player; }
let CAM_LIFT = 0;
let _arenaZoomActive = false;
// An arena may frame a stationary giant without changing any world-space hitbox.
// Run BEFORE the canvas transform; input and HUD use this same camera zoom.
function updateArenaCameraZoom(){
  if(state==="paused") return;
  const has = state==="playing" && player && camSub()===player && !player.duelActive && arenaHas("camZoom");
  if(!has && !_arenaZoomActive) return;
  const normal = computeCamZoom(VW,VH);
  const wanted = has ? arenaHook("camZoom",normal) : normal;
  const target = Number.isFinite(wanted) ? Math.max(normal*0.35,Math.min(normal,wanted)) : normal;
  CAM_ZOOM += (target-CAM_ZOOM)*0.12;
  if(Math.abs(CAM_ZOOM-target)<0.0005) CAM_ZOOM=target;
  CAM_Y_ANCHOR=camFitAnchor(VW,VH,CAM_ZOOM);
  _arenaZoomActive = Math.abs(CAM_ZOOM-normal)>0.0005;
}
function updateCamLift(){
  if(state==="paused" && _arenaZoomActive) return;
  const want = (state==="playing" && !player.duelActive && arenaHas("camLift")) ? (arenaHook("camLift")||0) : 0;
  CAM_LIFT += (want - CAM_LIFT)*0.06;
  if(Math.abs(CAM_LIFT) < 0.5 && want===0) CAM_LIFT = 0;
}
// Centro de la pantalla en el mundo (y): el jugador no está en el medio, está CAM_Y_ANCHOR px arriba
// o abajo (camFitAnchor, canvas.js). Los recortes "qué se ve" se centran acá, no en el jugador.
function camCenterY(){ return camSub().y - CAM_LIFT + CAM_LEAD_Y + CAM_Y_ANCHOR/CAM_ZOOM; }
function inView(x, y, pad){
  pad = pad || 140;
  const hw = VW/2/CAM_ZOOM + pad, hh = VH/2/CAM_ZOOM + pad;
  return Math.abs(x-(camSub().x + CAM_LEAD_X)) < hw && Math.abs(y-camCenterY()) < hh;
}
// (CAM_LEAD_X/Y: adelanto suave de la cámara hacia donde se apunta, ver juice.js; 0 con "Reducir movimiento")
function worldToScreen(x,y){
  return { x: VW/2 + (x-(camSub().x + CAM_LEAD_X))*CAM_ZOOM, y: (VH/2 - CAM_Y_ANCHOR) + (y-(camSub().y - CAM_LIFT + CAM_LEAD_Y))*CAM_ZOOM };
}
