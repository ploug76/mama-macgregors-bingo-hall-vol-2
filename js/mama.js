/* mama.js — Mama MacGregor, full body with jointed arms (elbows) and legs (knees). Shared by the Mama MacGregor Vol 2 games. */
(function(){
const g=K.g,TAU=Math.PI*2;
const M=window.MAMA={};
const KILT={green:'#1f4a3c',navyV:'rgba(20,28,60,.85)',navyH:'rgba(20,28,60,.6)',blkV:'rgba(0,0,0,.55)',blkH:'rgba(0,0,0,.45)',red:'rgba(190,30,45,.55)'};M.KILT=KILT;
function E(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,TAU);g.fill()}M.E=E;
M.tartan=function(x,y,w,h,sett,base){const u=sett/4;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle=base||KILT.green;g.fillRect(x,y,w,h);
 g.fillStyle=KILT.navyV;for(let i=x;i<x+w;i+=sett)g.fillRect(i,y,1.8*u,h);g.fillStyle=KILT.navyH;for(let j=y;j<y+h;j+=sett)g.fillRect(x,j,w,1.8*u);
 g.fillStyle=KILT.blkV;for(let i=x+2.6*u;i<x+w;i+=sett)g.fillRect(i,y,Math.max(.6,.45*u),h);g.fillStyle=KILT.blkH;for(let j=y+2.6*u;j<y+h;j+=sett)g.fillRect(x,j,w,Math.max(.6,.45*u));
 g.fillStyle=KILT.red;for(let i=x+1.2*u;i<x+w;i+=sett*2)g.fillRect(i,y,Math.max(.6,.3*u),h);g.restore()};
M.tartanBox=function(x,y,w,h,r,sett){g.save();K.rr(x,y,w,h,r);g.clip();M.tartan(x,y,w,h,sett||16);g.restore();g.save();K.rr(x,y,w,h,r);g.lineWidth=Math.max(2,3*K.S);g.strokeStyle='#d9dde2';g.stroke();g.restore()};
/* pose: {mode:'idle'|'wave'|'walk'|'crank'|'call'|'dance'|'clap'|'lever'|'point', ph (walk phase), t, talk, dir, look}
   returns rect */
M.draw=function(x,y,h,o){o=o||{};const u=h/100,t=o.t!=null?o.t:K.t,dir=o.dir||1,mode=o.mode||'idle';
 let G=K.gait(0,0,false),bob=0;if(mode==='walk'){G=K.gait(o.ph||0,1.1,false);bob=G.bob*u*1.2}
 // arm targets: [shoulder, elbow] near (R) & far (L)
 let sN=.15+Math.sin(t*1.8)*.04,eN=.35,sF=-.1,eF=.3;
 if(mode==='walk'){sN=G.shR;eN=G.elR;sF=G.shL;eF=G.elL}
 if(mode==='wave'){sN=1.65;eN=1.2+Math.sin(t*7)*.38}
 if(mode==='crank'){const a=t*4;sN=1.0+Math.sin(a)*.35;eN=1.0+Math.cos(a)*.45}
 if(mode==='call'){sN=2.2+Math.sin(t*3)*.05;eN=.7}
 if(mode==='point'){sN=1.5;eN=.15}
 if(mode==='lever'){const p=o.lever||0;sN=2.3-p*1.5;eN=.5+p*.4}
 if(mode==='clap'){const c=Math.abs(Math.sin(t*9));sN=1.1+c*.3;eN=1.3-c*.5;sF=1.0+c*.35;eF=1.3-c*.5}
 let hipN=G.hipR,kN=G.kneeR,hipF=G.hipL,kF=G.kneeL;
 if(mode==='dance'){const p=t*2.6;sN=2.4+Math.sin(p*TAU)*.5;eN=.8+Math.sin(p*TAU+1)*.5;sF=2.0-Math.sin(p*TAU)*.5;eF=.9-Math.sin(p*TAU+1)*.4;hipN=Math.sin(p*TAU)*.35;kN=Math.max(0,Math.sin(p*TAU))*.7;hipF=-Math.sin(p*TAU)*.35;kF=Math.max(0,-Math.sin(p*TAU))*.7;bob=Math.abs(Math.sin(p*TAU))*4*u}
 g.save();g.translate(x,y-bob);g.scale(dir,1);
 const hipY=-40*u,shY=-68*u,TH=20*u,SH=19*u,UA=15*u,FA=14*u;
 const shoe=(c)=>(fx,fy)=>{g.fillStyle=c;g.beginPath();g.ellipse(fx+3*u,fy+1*u,6.5*u,3*u,0,0,TAU);g.fill()};
 const hand=(fx,fy)=>E(fx,fy,4.2*u,4.2*u,'#f2c8a0');
 // far arm, far leg
 K.limb(-3*u,shY,sF,eF,UA,FA,7*u,'#173a2e',1,-1,hand);
 K.limb(-3*u,hipY,hipF,kF,TH,SH,6.5*u,'#e8d6c0',1,1,shoe('#2a1a10'));
 K.limb(4*u,hipY,hipN,kN,TH,SH,6.5*u,'#f0e0cc',1,1,shoe('#3a2416'));
 // skirt (tartan) swings with the legs
 const sw=(hipN-hipF)*4*u;g.save();g.beginPath();g.moveTo(-14*u,hipY-6*u);g.lineTo(14*u,hipY-6*u);g.lineTo(18*u+sw,hipY+24*u);g.lineTo(-17*u+sw,hipY+24*u);g.closePath();g.clip();M.tartan(-22*u,hipY-8*u,46*u,36*u,9*u);g.restore();
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-17*u+sw,hipY+22*u,35*u,2*u);
 // cardigan torso
 g.fillStyle='#1f4a3c';K.rr(-15*u,shY-4*u,30*u,34*u,9*u);g.fill();
 // shawl
 g.save();g.beginPath();g.moveTo(-17*u,shY-2*u);g.quadraticCurveTo(0,shY-10*u,17*u,shY-2*u);g.lineTo(10*u,shY+20*u);g.lineTo(0,shY+12*u);g.lineTo(-10*u,shY+20*u);g.closePath();g.clip();M.tartan(-20*u,shY-12*u,40*u,34*u,8*u,'#2c6452');g.restore();
 E(0,shY+8*u,3.2*u,3.2*u,'#c9ccd1');E(0,shY+8*u,1.6*u,1.6*u,'#e03131');
 // head
 const hy=shY-16*u;E(0,hy-6*u,15*u,10*u,'#c8541e');for(let i=0;i<8;i++)E(Math.cos(i*.8)*13*u,hy+Math.sin(i*.8)*8*u-2*u,5*u,5*u,i%2?'#d8682a':'#c8541e');
 E(0,hy+2*u,12*u,13*u,'#f6d2b4');E(-7*u,hy+7*u,3.3*u,2.5*u,'rgba(240,120,120,.45)');E(7*u,hy+7*u,3.3*u,2.5*u,'rgba(240,120,120,.45)');
 for(let i=0;i<6;i++)E(-11*u+i*4.4*u,hy-9*u+Math.abs(i-2.5)*.8*u,3.6*u,3.4*u,i%2?'#d8682a':'#c8541e');
 g.strokeStyle='#6a4a2a';g.lineWidth=1.4*u;g.beginPath();g.arc(-4.8*u,hy+1*u,3.8*u,0,TAU);g.moveTo(8.6*u,hy+1*u);g.arc(4.8*u,hy+1*u,3.8*u,0,TAU);g.moveTo(-1*u,hy+1*u);g.lineTo(1*u,hy+1*u);g.stroke();
 const bl=(t%4)>3.85;if(bl){g.beginPath();g.moveTo(-6.5*u,hy+1*u);g.lineTo(-3*u,hy+1*u);g.moveTo(3*u,hy+1*u);g.lineTo(6.5*u,hy+1*u);g.stroke()}else{E(-4.8*u,hy+1*u,1.4*u,1.5*u,'#3a2a1a');E(4.8*u,hy+1*u,1.4*u,1.5*u,'#3a2a1a')}
 if(o.talk&&Math.sin(t*16)>0){E(0,hy+9*u,3*u,2.4*u,'#b8404a')}else{g.strokeStyle='#b8404a';g.lineWidth=1.6*u;g.beginPath();g.arc(0,hy+6.5*u,3.6*u,.3,2.8);g.stroke()}
 // tam o'shanter
 E(0,hy-12*u,16*u,5.5*u,'#1f4a3c');g.save();g.beginPath();g.ellipse(0,hy-14*u,14*u,6*u,0,Math.PI,TAU);g.closePath();g.clip();M.tartan(-15*u,hy-21*u,30*u,8*u,6*u);g.restore();
 E(0,hy-9.5*u,15*u,2*u,'#141c3c');E(2*u,hy-20*u,4*u,4*u,'#d6336c');
 // near arm (drawn last)
 K.limb(3*u,shY,sN,eN,UA,FA,7.5*u,'#1f4a3c',1,-1,(hx,hy2,a)=>{hand(hx,hy2);if(o.hold){o.hold(hx,hy2,a)}});
 g.restore();return{x:x-20*u,y:y-100*u,w:40*u,h:100*u}};
/* Highland coo: 4 jointed legs (knees), shaggy */
M.coo=function(x,y,h,o){o=o||{};const u=h/60,dir=o.dir||1,G=K.gait(o.ph||0,o.moving?1:0,false);g.save();g.translate(x,y);g.scale(dir,1);
 const by=-30*u;const legs=[[-16,G.hipL,G.kneeL,'#6b2d12'],[12,G.hipR,G.kneeR,'#6b2d12'],[-12,G.hipR,G.kneeR,'#8a3a1a'],[16,G.hipL,G.kneeL,'#8a3a1a']];
 legs.slice(0,2).forEach(L=>K.limb(L[0]*u,by+6*u,L[1]*.7,L[2]*.8,11*u,11*u,5*u,L[3],1,1,(fx,fy)=>E(fx,fy+1*u,3.2*u,2*u,'#2a1a10')));
 E(0,by,26*u,15*u,'#b5501f');for(let i=0;i<10;i++)E(-22*u+i*5*u,by+10*u+Math.sin(i)*2*u,3*u,5*u,'#9a4219');
 legs.slice(2).forEach(L=>K.limb(L[0]*u,by+8*u,L[1]*.7,L[2]*.8,11*u,11*u,5.5*u,L[3],1,1,(fx,fy)=>E(fx,fy+1*u,3.4*u,2*u,'#2a1a10')));
 const hx=26*u,hy=by-6*u+Math.sin(K.t*2)*1*u;E(hx,hy,11*u,10*u,'#c25d24');for(let i=0;i<5;i++)E(hx-6*u+i*3*u,hy-6*u,3*u,4*u,'#d8682a');
 g.strokeStyle='#f1e3c8';g.lineWidth=3*u;g.lineCap='round';g.beginPath();g.moveTo(hx-6*u,hy-7*u);g.quadraticCurveTo(hx-16*u,hy-12*u,hx-12*u,hy-20*u);g.moveTo(hx+6*u,hy-7*u);g.quadraticCurveTo(hx+16*u,hy-12*u,hx+12*u,hy-20*u);g.stroke();
 E(hx+3*u,hy+5*u,6*u,4*u,'#f0a080');E(hx+1*u,hy+5*u,1*u,1*u,'#3a2a1a');E(hx+5*u,hy+5*u,1*u,1*u,'#3a2a1a');
 g.restore();return{x:x-28*u,y:y-50*u,w:66*u,h:50*u}};
/* Donkey: 4 jointed legs */
M.donkey=function(x,y,h,o){o=o||{};const u=h/60,dir=o.dir||1,G=K.gait(o.ph||0,o.moving?1:0,false);g.save();g.translate(x,y);g.scale(dir,1);
 const by=-30*u;K.limb(-14*u,by+6*u,G.hipL*.7,G.kneeL*.8,11*u,11*u,4.5*u,'#6c6c7a',1,1,(fx,fy)=>E(fx,fy+1*u,2.6*u,2*u,'#2a2a30'));K.limb(12*u,by+6*u,G.hipR*.7,G.kneeR*.8,11*u,11*u,4.5*u,'#6c6c7a',1,1,(fx,fy)=>E(fx,fy+1*u,2.6*u,2*u,'#2a2a30'));
 E(0,by,22*u,12*u,'#8e8e9c');E(0,by+5*u,14*u,6*u,'#c9c9d2');
 K.limb(-10*u,by+7*u,G.hipR*.7,G.kneeR*.8,11*u,11*u,5*u,'#8e8e9c',1,1,(fx,fy)=>E(fx,fy+1*u,2.8*u,2*u,'#2a2a30'));K.limb(16*u,by+7*u,G.hipL*.7,G.kneeL*.8,11*u,11*u,5*u,'#8e8e9c',1,1,(fx,fy)=>E(fx,fy+1*u,2.8*u,2*u,'#2a2a30'));
 const hx=24*u,hy=by-12*u;g.fillStyle='#8e8e9c';g.beginPath();g.moveTo(14*u,by-6*u);g.lineTo(hx-4*u,hy);g.lineTo(hx+4*u,hy+4*u);g.lineTo(20*u,by);g.fill();
 E(hx,hy,8*u,7*u,'#8e8e9c');E(hx+6*u,hy+3*u,5*u,4*u,'#d8d8e0');E(hx+1*u,hy-2*u,1.3*u,1.3*u,'#222');
 const ear=Math.sin(K.t*3)*.15;g.save();g.translate(hx-3*u,hy-5*u);g.rotate(-.3+ear);E(0,-8*u,2.5*u,8*u,'#8e8e9c');E(0,-8*u,1.2*u,6*u,'#d8a0b0');g.restore();g.save();g.translate(hx+1*u,hy-5*u);g.rotate(.15-ear);E(0,-8*u,2.5*u,8*u,'#7a7a88');g.restore();
 g.restore();return{x:x-24*u,y:y-62*u,w:58*u,h:62*u}};
M.sheep=function(x,y,h,o){o=o||{};const u=h/40,dir=o.dir||1,G=K.gait(o.ph||0,o.moving?1:0,false);g.save();g.translate(x,y);g.scale(dir,1);const by=-18*u;
 [[-8,G.hipL,G.kneeL],[7,G.hipR,G.kneeR],[-5,G.hipR,G.kneeR],[10,G.hipL,G.kneeL]].forEach(L=>K.limb(L[0]*u,by+4*u,L[1]*.7,L[2]*.8,6*u,6*u,2.6*u,'#2a2a30',1,1));
 for(let i=0;i<7;i++)E(-10*u+i*3.5*u,by+Math.sin(i*1.7)*3*u,6*u,6*u,'#f8f9fa');E(14*u,by-3*u,5*u,5*u,'#2a2a30');E(15.5*u,by-4*u,1*u,1*u,'#fff');g.restore();return{x:x-16*u,y:y-30*u,w:36*u,h:30*u}};
})();
