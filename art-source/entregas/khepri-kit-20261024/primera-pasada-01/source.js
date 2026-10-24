'use strict';
// Native raster VFX candidates. Not registered or loaded by the game.
// Coordinates are pixels; pure rendering, no time, random or game-state access.
(function(root){
const pal=['#091b18','#194f45','#329a74','#90d49b','#e9efbb','#c99d48'];
function poly(c,points,color){c.fillStyle=color;const ys=points.map(p=>p[1]),xs=points.map(p=>p[0]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!=(b[1]>y+.5)&&(x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}if(inside)c.fillRect(x,y,1,1);}}
function plate(c,x,y,s){poly(c,[[x,y],[x+s*10,y-3],[x+s*16,y+4],[x+s*13,y+15],[x+s*3,y+11]],pal[0]);poly(c,[[x+s*2,y+1],[x+s*10,y-1],[x+s*14,y+4],[x+s*11,y+12],[x+s*4,y+9]],pal[2]);poly(c,[[x+s*2,y+1],[x+s*10,y-1],[x+s*13,y+3],[x+s*4,y+4]],pal[3]);c.fillStyle=pal[5];c.fillRect(x+(s<0?-9:7),y+5,2,2);}
const specs={carapace:{id:'A-FX-khepri-h2',w:80,h:72,n:12},elytra:{id:'A-FX-khepri-h3',w:96,h:48,n:12}};
function draw(c,key,f){const q=specs[key];if(!q||!Number.isInteger(f)||f<0||f>=q.n)throw Error('Invalid frame');c.save();c.imageSmoothingEnabled=false;if(key==='carapace'){const spread=Math.round(6*(1-Math.min(1,f/4)))+Math.round(Math.sin(f*Math.PI/6));for(const s of [-1,1]){plate(c,40+s*(13+spread),17,s);plate(c,40+s*(12+spread),34,s);plate(c,40+s*(10+spread),49,s);}c.fillStyle=pal[4];c.fillRect(38,8+Math.round(f/4),4,2);}else if(f<11){const wing=Math.round(3+13*Math.sin(Math.PI*f/11)),x=30+Math.round(f*2);for(const s of [-1,1]){poly(c,[[x,24],[x-14,24+s*wing],[x-26,24+s*(wing-2)],[x-18,24+s*3]],pal[0]);poly(c,[[x-3,24+s],[x-15,24+s*(wing-2)],[x-23,24+s*(wing-3)],[x-16,24+s*4]],pal[2]);poly(c,[[x-4,24+s*2],[x-16,24+s*(wing-3)],[x-19,24+s*(wing-3)]],pal[3]);}c.fillStyle=pal[5];c.fillRect(x-7,22,10,4);c.fillStyle=pal[4];c.fillRect(x,23,4,2);}c.restore();}
root.KHEPRI_CANDIDATE={specs,draw,palette:pal};
})(globalThis);
