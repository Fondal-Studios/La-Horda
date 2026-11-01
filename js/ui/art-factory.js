'use strict';
(function(){
 window.GMExt=window.GMExt||{};
 window.GMExt.artFactory=async ctx=>{
  const d=await ctx.api('GET','/art');
  const p=ctx.panel('Fábrica de arte','Dictá la orden con el micrófono del teclado o escribila. El trabajo queda guardado aunque cierres el juego.');
  const cap=d.worker?.capabilities;
  p.append(ctx.node('p',!d.workerOnline?'Motor desconectado: las órdenes se guardan y esperan al proceso de producción.':cap?.ready?'Proceso conectado · proveedor configurado: '+cap.provider+' · funciones: '+(cap.supports||[]).join(', ')+(cap.provider==='pixrig'?'. Solo recetas nativas; generación IA no configurada.':'. La autenticación y el crédito se verifican al ejecutar.'):'Proceso conectado, pero el generador no está listo: '+(cap?.reason||'configuración no informada')+'. Las recetas nativas pueden funcionar sin IA.'));
  p.append(ctx.node('p','La fábrica organiza referencias, genera o reutiliza imágenes, arma y evalúa candidatos. La IA externa consume crédito; los topes se configuran en el proceso de producción. Nunca publica automáticamente.'));
  let pending=null;
  const f=ctx.form(p,'Iniciar producción',async values=>{
   if(!pending||pending.command!==values.command)pending={command:values.command,requestId:crypto.randomUUID()};
   const requestId=pending.requestId;
   const result=await ctx.api('POST','/art/command',{command:values.command,requestId});
   pending=null;
   ctx.say((result.jobs||[]).length+' trabajos guardados.');await ctx.render('Fábrica de arte');
  });
  const input=ctx.field(f.f,'Orden','command','textarea','Reparar los últimos campeones');input.maxLength=2000;input.required=true;input.rows=4;
  p.append(ctx.node('p','Ejemplos: «Reparar cazadora animación walk_down» (un clip), «Reparar cazadora» (atlas completo), «Reparar cazadora skin cazadora_escarcha animación walk_down» (clip de Manto de Escarcha). Solo esa skin tiene conector; requiere autorización explícita en el perfil del proceso. Runway requiere un campeón con contrato de atlas existente. Crear un campeón nuevo, habilidades o assets sin contrato no está soportado por este conector.'));
  f.end();
  const q=ctx.panel('Producción guardada','Un candidato validado aún necesita revisión visual y una versión del juego que pase las pruebas.');
  const labels={QUEUED:'En cola',RUNNING:'Generando',REUSED:'Arte existente reutilizado',REJECTED:'Requiere corrección',FAILED:'Ejecución fallida',BLOCKED_MODEL:'Falta configurar el modelo gráfico',AWAITING_VISUAL_REVIEW:'Esperando revisión visual',BLOCKED_CREDENTIAL:'Falta credencial del proveedor',BLOCKED_CREDIT:'Sin crédito del proveedor',BLOCKED_CONTRACT:'Contrato de arte no soportado',BLOCKED_BUDGET:'Tope de gasto alcanzado',PROVIDER_PENDING:'Tarea del proveedor pendiente; revisar y reanudar sin reenviar',PROVIDER_UNCERTAIN:'Solicitud incierta; revisar el diario antes de reintentar'};
  ctx.list(q,(d.jobs||[]).slice().reverse().map(j=>j.target+' · '+(labels[j.status]||j.status)+((j.result?.error||j.error)?' · '+(j.result?.error||j.error):'')));
  for(const j of d.jobs||[])if(j.status==='PROVIDER_PENDING'&&j.result?.resumable){
   const requestId=crypto.randomUUID();
   ctx.action(q,'Reanudar consulta: '+j.target,async()=>{await ctx.api('POST','/art/resume',{id:j.id,requestId});ctx.say('Consulta reanudada con el mismo diario; no se crea otro pedido.');await ctx.render('Fábrica de arte');});
  }
  ctx.action(q,'Actualizar estado',()=>ctx.render('Fábrica de arte'));
 };
})();
