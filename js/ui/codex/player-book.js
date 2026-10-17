"use strict";
// Read-only guide: progress and arena links come from the existing campaign state.
function playerBookHtml(){
  const order=typeof CAMPAIGN_ORDER!=="undefined" ? CAMPAIGN_ORDER : [];
  const next=order.find(a=>!codexArenaCleared(a));
  const completed=order.filter(codexArenaCleared).length;
  const loss=typeof ARENA_FAIL_PENALTY_PCT!=="undefined" ? Math.round(ARENA_FAIL_PENALTY_PCT*100) : 50;
  const forgiven=typeof FAIL_FORGIVE_FIRST!=="undefined" ? FAIL_FORGIVE_FIRST : 3;
  const route=order.map((a,i)=>`<button type="button" data-go="arena:${_cxEsc(a)}" class="pb-stop ${codexArenaCleared(a)?'done':''}"><span>${String(i+1).padStart(2,'0')}</span>${_cxEsc(codexArenaTag(a))}<small>${codexArenaCleared(a)?'Completada':a===next?'Tu próxima meta':'Por explorar'}</small></button>`).join('');
  return `<section class="player-book" aria-label="Libro del nuevo guardián">
    <div class="pb-opening"><img src="assets/ui/codex/grimoire.webp" alt="Grimorio con espadas, runas y un viaje ilustrado desde la ciudad hasta la fortaleza infernal" width="480" height="480">
    <div><span class="pb-kicker">ABRÍ EL LIBRO · ENCONTRÁ TU MISIÓN</span><h2>¿Para qué jugás a La Horda?</h2><p>Para convertir a tu guardián en alguien capaz de detener la invasión. Peleás contra oleadas, conseguís equipo y superás arenas cada vez más difíciles.</p><p class="pb-objective"><b>Tu gran objetivo:</b> atravesar las diez arenas de la campaña, recuperar los cristales de los Guardianes y vencer al Rey de la Horda.</p><p>No necesitás entender todo hoy. Empezá por una victoria.</p></div></div>
    <div class="pb-pages"><section><span class="pb-kicker">I · TU PRIMERA PARTIDA</span><h3>Defendé la Ciudad Maldita</h3><ol><li>Elegí un guardián y aprendé sus habilidades en el entrenamiento.</li><li>Sobreviví a 10 niveles; esquivá las zonas marcadas y protegé las estructuras importantes.</li><li>Rescatá civiles para conseguir oro y experiencia.</li><li>Derrotá al jefe final. Si cae toda la ciudad o todo tu equipo, la incursión termina.</li></ol><p><b>En equipo:</b> acercate a un compañero caído y mantené el botón de revivir.</p></section>
    <section><span class="pb-kicker">II · POR QUÉ VOLVER</span><h3>Prepará un guardián mejor</h3><p><b>Combatí → conseguí recompensas → equipate → avanzá.</b></p><p>La experiencia mejora a tu guardián. El oro y los objetos te permiten preparar tu equipo. Probá habilidades y combinaciones, completá sets y descubrí campeones y apariencias.</p><p><b>Dos progresos distintos:</b> los 10 niveles de una incursión se reinician al entrar. El nivel y los desbloqueos de tu guardián pertenecen a tu perfil.</p><details><summary>¿Qué pasa si pierdo?</summary><p>Reintentás desde el nivel 1 de la arena. La derrota puede quitar el ${loss}% del oro y la experiencia ganados en ese intento; no del total anterior. Las primeras ${forgiven} derrotas y la primera arena en dificultad normal están exentas. El resultado te indica lo que conservaste.</p></details><button type="button" class="cx-btn" data-sec="campeones">VER MIS GUARDIANES Y EQUIPO</button></section></div>
    <section class="pb-route"><span class="pb-kicker">III · TU VIAJE</span><h3>${completed} / ${order.length} arenas completadas</h3><p>${next?'Tu próxima meta: '+_cxEsc(codexArenaTag(next))+'. Abrí su ficha para conocer su objetivo y sus peligros.':'Completaste el recorrido. Volvé por desafíos, colecciones y nuevas combinaciones de equipo.'}</p><div class="pb-route-grid">${route}</div></section>
    <section class="pb-modes"><span class="pb-kicker">IV · ELEGÍ QUÉ QUERÉS LOGRAR</span><h3>Un objetivo para cada modo</h3><div class="pb-mode-grid">
      <article><h4>Campaña · empezá acá</h4><p>Superá arenas y jefes para avanzar en la historia. Conseguí experiencia, oro y equipo.</p></article>
      <article><h4>Horda Infinita</h4><p>Resistí cada vez más oleadas y superá tu récord. Es un desafío de supervivencia, no el siguiente capítulo de la campaña.</p></article>
      <article><h4>Convergencia · cristales</h4><p>Avanzá con tu equipo, derribá las torres y destruí el cristal rival mientras protegés el tuyo.</p></article>
      <article><h4>Coliseo · 2 contra 2</h4><p>Coordiná tus habilidades con un aliado y ganá los duelos hasta alcanzar los puntos de victoria indicados en la partida.</p></article>
    </div><p class="pb-note">El menú de cada modo indica su disponibilidad. Para entender el mundo y aprender a jugar, seguí primero la campaña.</p></section>
    <footer class="pb-footer">Las páginas siguientes guardan el arte, las habilidades, los enemigos, las arenas y las crónicas que vas descubriendo.</footer>
  </section>`;
}
