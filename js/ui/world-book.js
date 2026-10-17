"use strict";
// The world chronicle is separate from the short mission book.
const WORLD_CHAPTERS = [
  {art:0,title:"Antes de las Cicatrices",text:"Hubo un tiempo en que los caminos unían ciudades, bosques y fortalezas. Pero la maldad de ese mundo no desaparecía: se acumulaba. De ella nació la Horda. No era un ejército que pudiera negociar la paz. Era una fuerza que convertía cuanto tocaba en una nueva amenaza."},
  {art:1,title:"La primera guerra",text:"Las ciudades ardieron. Los caminos se llenaron de refugiados y los defensores aprendieron que vencer una batalla no bastaba. Cada noche traía otra oleada. Para salvar a los que quedaban, cuatro Guardianes buscaron una forma de encerrar aquella fuerza fuera del mundo."},
  {art:3,title:"El Sello dividido",text:"El Forjador había creado un Sello del tamaño de un corazón. Lo dividió en cuatro cristales para que nadie pudiera poseer todo su poder. Aquellos fragmentos se convirtieron en la llave de una prisión entre dimensiones. La victoria exigiría custodiarla, incluso después de terminar la guerra."},
  {art:2,title:"Los Cuatro Guardianes",text:"Niebla, Escarcha, Piedra y Juicio unieron sus fuerzas. Sellaron a la Horda en otra dimensión y quedaron ligados a los cristales. Los pueblos los recordaron como salvadores. Con el paso de los siglos, su vigilia se volvió soledad… y la corrupción encontró un camino hacia quienes debían contenerla."},
  {art:4,title:"Un mundo herido",text:"Los antiguos refugios cambiaron. El bosque ocultó una bestia; el hielo encerró a un mago caído; la piedra se volvió laberinto. Fábricas sin descanso, cavernas infectadas, abismos y minas completan hoy el camino. Las Cicatrices atraviesan esos lugares: heridas que conectan nuestro mundo con la Horda."},
  {art:5,title:"La noche del regreso",text:"Las campanas volvieron a sonar. La Horda entró en la Ciudad Maldita y los civiles buscaron refugio entre las ruinas. Una figura de luz apareció para señalar un camino. Pero ni una promesa ni una antigua leyenda pueden pelear por vos. La ciudad necesita nuevos guardianes."},
  {art:5,title:"Ahora te toca a vos",text:"Elegí tus guardianes y defendé la ciudad. Sobreviví las oleadas, rescatá civiles y vencé a los jefes para abrir la siguiente arena. Conseguí equipo y mejorá tus habilidades. Tu campaña te llevará tras los cristales de los Guardianes caídos, hasta enfrentar al Rey de la Horda en la Arena Infernal."},
  {art:2,title:"La próxima página",text:"Cada incursión tiene una misión propia: el libro te la mostrará antes de luchar. No alcanza con matar enemigos; observá el escenario, protegé lo que importa y completá su objetivo. Podés volver al Códice para consultar modos, recompensas y progreso. La historia del mundo sigue adelante con lo que hagas en él."}
];
let worldBookSessionSeen=false, worldBookOpen=false;
function worldBookNeeded(){return !worldBookSessionSeen && !(save.tut && save.tut.worldBookV1);}
function openWorldBook(done,replay=false){
  if(worldBookOpen)return;
  worldBookOpen=true;
  const previousFocus=document.activeElement;
  const book=document.createElement('dialog');book.className='world-book';book.setAttribute('aria-label','Crónicas de la Horda');
  book.innerHTML='<header><span>LA HORDA · CRÓNICAS DEL MUNDO</span><button type="button" data-skip>Saltar historia</button></header><section class="world-spread"><div class="world-art" role="img"></div><article><small data-page></small><h1></h1><p></p></article><div class="world-leaf" aria-hidden="true"></div></section><footer><button data-prev>← Anterior</button><button data-auto>Pausar</button><span data-load role="status"></span><button data-next>Siguiente →</button></footer>';
  document.body.append(book);book.showModal();
  let page=0,turning=false,closed=false,automatic=!matchMedia('(prefers-reduced-motion: reduce)').matches,elapsed=0,last=performance.now();
  const $=s=>book.querySelector(s);
  function ready(){return replay || typeof assetsAllReady!=='function' || assetsAllReady();}
  function load(){const ok=ready();$('[data-load]').textContent=ok?'Listo para continuar':`Preparando el mundo… ${typeof assetsRestPct==='function'?assetsRestPct():0}%`;$('[data-next]').disabled=turning || (page===WORLD_CHAPTERS.length-1&&!ok);$('[data-skip]').disabled=!ok;}
  function render(){const c=WORLD_CHAPTERS[page];$('.world-art').style.backgroundPosition=`${(c.art%3)*50}% ${Math.floor(c.art/3)*100}%`;$('.world-art').setAttribute('aria-label',c.title);$('h1').textContent=c.title;$('article p').textContent=c.text;$('[data-page]').textContent=`CAPÍTULO ${page+1} / ${WORLD_CHAPTERS.length}`;$('[data-prev]').disabled=page===0||turning;$('[data-next]').textContent=page===WORLD_CHAPTERS.length-1?'Entrar al mundo':'Siguiente →';$('[data-auto]').textContent=automatic?'Pausar':'Reproducir';load();}
  function finish(){if(!ready()||closed)return;closed=true;clearInterval(tick);worldBookSessionSeen=true;worldBookOpen=false;if(!replay){save.tut=save.tut||{};save.tut.worldBookV1=true;save.tut.goalBookV1=true;save.storyPrologueSeen=true;persistNow();}book.close();book.remove();if(previousFocus&&previousFocus.isConnected)previousFocus.focus();if(done)done();}
  function turn(delta){if(turning||closed)return;if(page+delta>=WORLD_CHAPTERS.length){finish();return;}if(page+delta<0)return;elapsed=0;turning=true;book.classList.add('turning');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(()=>{if(closed)return;page+=delta;render();},reduced?0:250);setTimeout(()=>{if(closed)return;turning=false;book.classList.remove('turning');render();},reduced?0:650);}
  $('[data-prev]').onclick=()=>turn(-1);$('[data-next]').onclick=()=>turn(1);$('[data-skip]').onclick=finish;$('[data-auto]').onclick=()=>{automatic=!automatic;elapsed=0;render();};book.addEventListener('cancel',e=>{e.preventDefault();finish();});
  book.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}});
  const tick=setInterval(()=>{const now=performance.now();if(automatic&&!document.hidden&&!turning)elapsed+=Math.min(now-last,500);last=now;if(elapsed>18000&&page<WORLD_CHAPTERS.length-1)turn(1);load();},250);render();
}
document.getElementById('world-book-replay')?.addEventListener('click',()=>openWorldBook(null,true));
