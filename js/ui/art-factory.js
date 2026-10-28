'use strict';
(function(){
 window.GMExt=window.GMExt||{};
 window.GMExt.artFactory=async ctx=>{
  const d=await ctx.api('GET','/art');
  const p=ctx.panel('Fábrica de arte','Dictá la orden con el micrófono del teclado o escribila. El trabajo queda guardado aunque cierres el juego.');
  p.append(ctx.node('p',d.workerOnline?'Motor conectado.':'Motor desconectado: las órdenes se guardan y esperan al proceso de producción.'));
  let pending=null;
  const f=ctx.form(p,'Iniciar producción',async values=>{
   if(!pending||pending.command!==values.command)pending={command:values.command,requestId:crypto.randomUUID()};
   const requestId=pending.requestId;
   const result=await ctx.api('POST','/art/command',{command:values.command,requestId});
   pending=null;
   ctx.say((result.jobs||[]).length+' trabajos guardados.');await ctx.render('Fábrica de arte');
  });
  const input=ctx.field(f.f,'Orden','command','textarea','Reparar los últimos campeones');input.maxLength=2000;input.required=true;input.rows=4;
  p.append(ctx.node('p','Ejemplos: «Reparar Aelith», «Reparar los últimos campeones», «Crear un campeón de hielo con armadura rota y lanza». Crear arte no publica estadísticas ni habilidades nuevas.'));
  f.end();
  const q=ctx.panel('Producción guardada','Un candidato validado aún necesita revisión visual y una versión del juego que pase las pruebas.');
  const labels={QUEUED:'En cola',RUNNING:'Generando',REUSED:'Arte existente reutilizado',REJECTED:'Requiere corrección',FAILED:'Ejecución fallida',BLOCKED_MODEL:'Falta configurar el modelo gráfico',AWAITING_VISUAL_REVIEW:'Esperando revisión visual'};
  ctx.list(q,(d.jobs||[]).slice().reverse().map(j=>j.target+' · '+(labels[j.status]||j.status)+(j.result?.error?' · '+j.result.error:'')));
  ctx.action(q,'Actualizar estado',()=>ctx.render('Fábrica de arte'));
 };
})();
