/* kit.js — shared Vol 2 engine (canvas, real-touch buttons, scenes, audio, saves, jointed rigs, story+skip, gamepad, studio logo).
   Used by the batch-B Vol 2 remakes. Buttons fire on pointerup matched by button id (real finger taps last 80-150 ms). */
(function(){
'use strict';
const K=window.K={};
const cv=document.getElementById('cv'),g=cv.getContext('2d');K.cv=cv;K.g=g;
K.W=0;K.H=0;K.DPR=1;K.S=1;K.t=0;K.dt=0;K.frame=0;K.portrait=true;K.safe={t:0,r:0,b:0,l:0};
const sp=document.getElementById('sp');
function resize(){const d=Math.min(2.5,window.devicePixelRatio||1);K.DPR=d;const w=innerWidth,h=innerHeight;K.W=w;K.H=h;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';
 K.portrait=h>=w;K.S=Math.max(.7,Math.min(1.6,Math.min(w,h)/412));
 if(sp){const cs=getComputedStyle(sp);K.safe={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0}}
 if(K.scene&&K.scene.resize)K.scene.resize()}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,120));resize();
/* ---------- saves */
K.ns='v2';K.save={get(k,d){try{const v=localStorage.getItem(K.ns+':'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(K.ns+':'+k,JSON.stringify(v))}catch(e){}}};
/* ---------- math */
K.clamp=(v,a,b)=>v<a?a:v>b?b:v;K.lerp=(a,b,t)=>a+(b-a)*t;K.rnd=(a,b)=>a+Math.random()*(b-a);K.ri=(a,b)=>Math.floor(K.rnd(a,b+1));K.pick=a=>a[Math.floor(Math.random()*a.length)];
K.ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;K.hit=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
K.overlap=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
/* ---------- drawing helpers */
K.rr=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
K.font=(sz,w)=>(w||800)+' '+Math.round(sz)+'px "Trebuchet MS","Segoe UI",system-ui,sans-serif';
K.text=function(s,x,y,sz,col,o){o=o||{};g.save();g.font=K.font(sz,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';
 if(o.maxW){const m=g.measureText(s).width;if(m>o.maxW){g.font=K.font(sz*o.maxW/m,o.w)}}
 if(o.stroke!==false){g.lineJoin='round';g.lineWidth=o.sw||Math.max(2,sz*.16);g.strokeStyle=o.stroke||'rgba(0,0,0,.75)';g.strokeText(s,x,y)}
 g.fillStyle=col||'#fff';g.fillText(s,x,y);g.restore()};
K.wrap=function(s,maxW,sz,w){g.save();g.font=K.font(sz,w);const out=[];for(const para of String(s).split('\n')){let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>maxW&&line){out.push(line);line=word}else line=t}out.push(line)}g.restore();return out};
K.textBox=function(s,x,y,maxW,sz,col,o){o=o||{};const L=K.wrap(s,maxW,sz,o.w),lh=sz*(o.lh||1.25);const y0=y-(o.vc?(L.length-1)*lh/2:0);L.forEach((l,i)=>K.text(l,x,y0+i*lh,sz,col,o));return L.length*lh};
/* ---------- buttons (re-registered every frame; matched by id across frames) */
K.btns=[];let pressId=null,pressPid=null;K.focusId=null;
K.button=function(b){b.r=b.r==null?14*K.S:b.r;K.btns.push(b);const down=pressId===b.id,foc=K.focusId===b.id&&K.padUsed;
 if(b.hidden)return b;g.save();const sc=down?.95:1;g.translate(b.x+b.w/2,b.y+b.h/2);g.scale(sc,sc);g.translate(-b.w/2,-b.h/2);
 if(b.draw){b.draw(b,down);}else{
 g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=8*K.S;g.shadowOffsetY=3*K.S;
 const c=b.dis?'#7a7a7a':(b.color||'#2f9e44');K.rr(0,0,b.w,b.h,b.r);const gr=g.createLinearGradient(0,0,0,b.h);gr.addColorStop(0,K.tint(c,.25));gr.addColorStop(1,c);g.fillStyle=gr;g.fill();g.shadowColor='transparent';
 g.lineWidth=Math.max(2,3*K.S);g.strokeStyle=b.edge||'rgba(255,255,255,.85)';g.stroke();
 K.rr(4*K.S,3*K.S,b.w-8*K.S,b.h*.42,b.r*.7);g.fillStyle='rgba(255,255,255,.18)';g.fill();
 const fs=b.fs||Math.min(b.h*.42,26*K.S);
 if(b.icon&&b.label){K.text(b.icon+' '+b.label,b.w/2,b.h/2+1,fs,b.tc||'#fff',{maxW:b.w-14*K.S,stroke:'rgba(0,0,0,.45)'})}
 else K.text(b.label||b.icon||'',b.w/2,b.h/2+1,fs,b.tc||'#fff',{maxW:b.w-14*K.S,stroke:'rgba(0,0,0,.45)'});
 if(b.sub)K.text(b.sub,b.w/2,b.h*.82,fs*.5,'#fff',{maxW:b.w-10*K.S,stroke:'rgba(0,0,0,.4)'});}
 if(foc){g.lineWidth=4*K.S;g.strokeStyle='#ffd400';K.rr(-4*K.S,-4*K.S,b.w+8*K.S,b.h+8*K.S,b.r+4*K.S);g.stroke()}
 g.restore();return b};
K.tint=function(hex,a){if(hex[0]!=='#')return hex;let n=parseInt(hex.slice(1),16);let r=n>>16,gg=n>>8&255,bb=n&255;r=Math.round(r+(255-r)*a);gg=Math.round(gg+(255-gg)*a);bb=Math.round(bb+(255-bb)*a);return'rgb('+r+','+gg+','+bb+')'};
function btnAt(p,list){for(let i=list.length-1;i>=0;i--){const b=list[i];if(!b.hidden&&!b.dis&&p.x>=b.x-4&&p.x<=b.x+b.w+4&&p.y>=b.y-4&&p.y<=b.y+b.h+4)return b}return null}
K.lastBtns=[];
/* ---------- pointer input */
K.ptrs={};
function P(e){return{x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now()}}
cv.addEventListener('pointerdown',e=>{e.preventDefault();K.audioUnlock();K.padUsed=false;const p=P(e);p.sx=p.x;p.sy=p.y;p.st=p.t;K.ptrs[p.id]=p;try{cv.setPointerCapture(e.pointerId)}catch(_){}
 const b=btnAt(p,K.lastBtns);if(b){pressId=b.id;pressPid=p.id;p.btn=b.id;if(b.instant){pressId=null;fire(b)}return}
 if(K.scene&&K.scene.down)K.scene.down(p)},{passive:false});
cv.addEventListener('pointermove',e=>{const q=K.ptrs[e.pointerId];if(!q)return;const p=P(e);q.x=p.x;q.y=p.y;if(q.btn)return;if(K.scene&&K.scene.move)K.scene.move(q)},{passive:true});
function up(e,cancel){const q=K.ptrs[e.pointerId];if(!q)return;delete K.ptrs[e.pointerId];q.x=e.clientX;q.y=e.clientY;
 if(q.btn){const id=q.btn;if(pressPid===e.pointerId){pressId=null;pressPid=null}if(cancel)return;const b=K.lastBtns.find(z=>z.id===id);if(b&&!b.dis&&!b.hidden&&q.x>=b.x-12&&q.x<=b.x+b.w+12&&q.y>=b.y-12&&q.y<=b.y+b.h+12)fire(b);return}
 if(K.scene&&K.scene.up)K.scene.up(q,cancel)}
cv.addEventListener('pointerup',e=>up(e,false));cv.addEventListener('pointercancel',e=>up(e,true));
cv.addEventListener('contextmenu',e=>e.preventDefault());
function fire(b){if(K.scene&&K.scene.__locked)return;try{K.sfx.click()}catch(_){}b.cb&&b.cb(b)}
K.fire=fire;
/* keyboard */
K.keys={};
addEventListener('keydown',e=>{K.audioUnlock();const k=e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k))e.preventDefault();const rep=K.keys[k];K.keys[k]=true;
 if(!rep&&K.scene&&K.scene.key&&K.scene.key(k,true)===true)return;
 if(!rep&&(k==='Enter'||k===' ')&&!(K.scene&&K.scene.play)){const b=K.lastBtns.find(z=>z.id===K.focusId)||K.lastBtns.find(z=>z.primary&&!z.dis&&!z.hidden);if(b)fire(b)}
 if(!rep&&(k==='Escape'||k==='p'||k==='P')&&K.scene&&K.scene.pause)K.scene.pause();
 if(!rep&&(k==='m'||k==='M'))K.toggleMute()});
addEventListener('keyup',e=>{K.keys[e.key]=false;if(K.scene&&K.scene.key)K.scene.key(e.key,false)});
addEventListener('blur',()=>{K.keys={};for(const id in K.ptrs){delete K.ptrs[id]}pressId=null;if(K.scene&&K.scene.pause&&K.scene.play)K.scene.pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(K.scene&&K.scene.pause&&K.scene.play)K.scene.pause();K.music.stop()}else K.music.resume()});
/* ---------- scenes */
K.go=function(s,arg){if(K.scene&&K.scene.leave)K.scene.leave();K.scene=s;K.focusId=null;K.fade=1;if(s.enter)s.enter(arg)};
K.fade=0;
/* ---------- audio */
let ac=null,master=null;K.muted=false;
K.audioUnlock=function(){try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=K.muted?0:.6;master.connect(ac.destination)}if(ac.state==='suspended')ac.resume();K.music.resume()}catch(e){}};
K.ac=()=>ac;
K.tone=function(f,d,o){if(!ac||K.muted)return;o=o||{};try{const t=ac.currentTime+(o.at||0),os=ac.createOscillator(),gn=ac.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+d);
 const v=o.v==null?.2:o.v;gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(v,t+Math.min(.02,d/4));gn.gain.exponentialRampToValueAtTime(0.0001,t+d);os.connect(gn);gn.connect(o.dest||master);os.start(t);os.stop(t+d+.05)}catch(e){}};
K.noise=function(d,o){if(!ac||K.muted)return;o=o||{};try{const t=ac.currentTime+(o.at||0),n=Math.floor(ac.sampleRate*d),bf=ac.createBuffer(1,n,ac.sampleRate),ch=bf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
 const s=ac.createBufferSource();s.buffer=bf;const fl=ac.createBiquadFilter();fl.type=o.ft||'lowpass';fl.frequency.value=o.fr||1200;const gn=ac.createGain();gn.gain.value=o.v==null?.2:o.v;s.connect(fl);fl.connect(gn);gn.connect(master);s.start(t)}catch(e){}};
K.sfx={click(){K.tone(660,.06,{type:'triangle',v:.12})},good(){K.tone(660,.1,{type:'triangle',v:.18});K.tone(990,.14,{type:'triangle',v:.16,at:.08})},
 bad(){K.tone(220,.25,{type:'sawtooth',v:.12,f2:110})},win(){[523,659,784,1047].forEach((f,i)=>K.tone(f,.25,{type:'triangle',v:.18,at:i*.11}))},
 coin(){K.tone(988,.06,{type:'square',v:.08});K.tone(1319,.12,{type:'square',v:.08,at:.06})},pop(){K.tone(500,.08,{type:'sine',v:.2,f2:900})},thud(){K.noise(.15,{fr:300,v:.35})}};
K.toggleMute=function(){K.muted=!K.muted;K.save.set('mute',K.muted);if(master)master.gain.value=K.muted?0:.6;if(K.muted)K.music.stop();else K.music.resume()};
K.muted=K.save.get('mute',false);
/* music: tiny step sequencer; song = {bpm, wave, bass:[midi..], lead:[midi or 0..]} */
K.music={song:null,timer:0,step:0,on:false,
 play(song){this.song=song;this.step=0;this.on=true;this.resume()},
 stop(){if(this.timer){clearInterval(this.timer);this.timer=0}},
 resume(){if(!this.on||!this.song||!ac||K.muted||this.timer||document.hidden)return;const S=this.song,me=this;const sp=60/S.bpm/2;
  this.timer=setInterval(()=>{if(!ac||K.muted)return;const i=me.step++;const m2f=m=>440*Math.pow(2,(m-69)/12);
   const b=S.bass[i%S.bass.length];if(b)K.tone(m2f(b),sp*1.6,{type:S.bw||'triangle',v:S.bv||.07});
   const l=S.lead[i%S.lead.length];if(l)K.tone(m2f(l),sp*.9,{type:S.wave||'square',v:S.lv||.035});
   if(S.drum&&i%4===0)K.noise(.05,{fr:180,v:.12});if(S.drum&&i%4===2)K.noise(.04,{fr:4000,ft:'highpass',v:.04})},sp*1000)},
 halt(){this.on=false;this.stop()}};
/* ---------- particles / shake / floaters */
K.parts=[];K.shake=0;
K.burst=function(x,y,n,o){o=o||{};for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(o.sp||3)*(0.4+Math.random())*K.S;K.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(o.up||1)*K.S,life:o.life||40,max:o.life||40,col:o.col?(Array.isArray(o.col)?K.pick(o.col):o.col):'hsl('+K.ri(0,360)+',90%,65%)',r:(o.r||4)*K.S*(0.5+Math.random()),grav:o.grav==null?.12:o.grav,txt:o.txt,shape:o.shape})}};
K.float=function(txt,x,y,col,sz){K.parts.push({x,y,vx:0,vy:-1.1*K.S,life:60,max:60,txt,col:col||'#fff',sz:sz||22,grav:0})};
K.drawParts=function(){for(let i=K.parts.length-1;i>=0;i--){const p=K.parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav*K.S;p.life--;if(p.life<=0){K.parts.splice(i,1);continue}
 const a=Math.min(1,p.life/(p.max*.4));g.globalAlpha=a;if(p.txt){K.text(p.txt,p.x,p.y,(p.sz||20)*K.S,p.col)}else if(p.shape==='star'){K.star(p.x,p.y,p.r,p.col)}else{g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}g.globalAlpha=1}};
K.star=function(x,y,r,c){g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()};
/* ---------- jointed limb rig ----------
   Angles in radians; 0 = hanging straight down, + = swung forward (toward facing direction).
   K.gait(phase, amt, run) -> {hipL,kneeL,hipR,kneeR,shL,elL,shR,elR,bob} ; phase in cycles (1 cycle = 2 steps).
   Arms swing opposite the legs; knees bend back during swing, elbows always bend forward. */
K.gait=function(ph,amt,run){const T=Math.PI*2,a=K.clamp(amt,0,1.6),r=run?1:0;
 const hipA=(.42+.25*r)*a,knA=(.75+.75*r)*a,shA=(.38+.35*r)*a,elB=.35+(.25+.9*r)*a;
 function leg(p){const hip=Math.sin(p*T)*hipA;const kn=Math.max(0,Math.cos(p*T))*knA+(.08+.18*r)*a;return[hip,kn]}
 const L=leg(ph),R=leg(ph+.5);
 const shL=-Math.sin(ph*T)*shA,shR=-Math.sin((ph+.5)*T)*shA;
 return{hipL:L[0],kneeL:L[1],hipR:R[0],kneeR:R[1],shL,shR,elL:elB+Math.max(0,shL)*.5,elR:elB+Math.max(0,shR)*.5,bob:(Math.cos(ph*T*2)*.5+.5)*a*(1.5+2.5*r)};
};
/* draw a 2-segment limb from (x,y). dir=+1 facing right. bend: +1 knee (bends back), -1 elbow (bends forward). Returns end point. */
K.limb=function(x,y,a1,a2,l1,l2,w,col,dir,bend,end){dir=dir||1;const k=bend>0?-1:1;
 const ax=x+Math.sin(a1)*l1*dir,ay=y+Math.cos(a1)*l1;const a2a=a1+k*a2;const bx=ax+Math.sin(a2a)*l2*dir,by=ay+Math.cos(a2a)*l2;
 g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(ax,ay);g.lineTo(bx,by);g.stroke();
 if(end)end(bx,by,a2a,ax,ay);g.restore();return{kx:ax,ky:ay,x:bx,y:by,a:a2a}};
/* stride phase helper: advance phase from ground speed so feet don't slide. stride = distance per step (px). */
K.stepPhase=function(ph,dist,stride){return ph+Math.abs(dist)/(2*stride)};
/* ---------- studio logo (tiny, title-screen corner) */
K.logoImg=null;K.loadLogo=function(src){const i=new Image();i.src=src;K.logoImg=i};
/* draws the logo in a corner if a box of width w fits in the corner without touching any rect in 'avoid'. Returns the rect or null. */
K.drawLogo=function(corner,w,avoid){const i=K.logoImg;if(!i||!i.complete||!i.naturalWidth)return null;w=Math.round(w);const h=Math.round(w*i.naturalHeight/i.naturalWidth),m=8*K.S;
 let x=corner.includes('r')?K.W-w-m-K.safe.r:m+K.safe.l,y=corner.includes('b')?K.H-h-m-K.safe.b:m+K.safe.t;const r={x,y,w,h};
 if(avoid&&avoid.some(a=>K.overlap(r,a)))return null;g.save();g.globalAlpha=.92;K.rr(x-2,y-2,w+4,h+4,5*K.S);g.fillStyle='rgba(0,0,0,.55)';g.fill();g.drawImage(i,x,y,w,h);g.restore();K.logoRect=r;return r};
/* ---------- story with SKIP. pages: [{text, draw(t)}] ; K.story(pages,done) returns a scene */
K.storyScene=function(pages,done,o){o=o||{};let i=0,t0=0,typed=0;const S={play:false,
 enter(){i=0;t0=0;typed=0},
 next(){const L=pages[i].text.length;if(typed<L){typed=L;return}i++;t0=0;typed=0;if(i>=pages.length)done()},
 update(){t0++;typed=Math.min(pages[i]?pages[i].text.length:0,typed+1.2)},
 draw(){const pg=pages[i];if(!pg)return;(pg.draw||o.bg||(()=>{g.fillStyle='#111';g.fillRect(0,0,K.W,K.H)}))(t0);
  const bw=Math.min(K.W-24*K.S,620*K.S),pad=16*K.S,fs=(o.fs||20)*K.S;const txt=pg.text.slice(0,Math.floor(typed));const lines=K.wrap(pg.text,bw-pad*2,fs,700);const bh=lines.length*fs*1.3+pad*2+26*K.S;
  const bx=(K.W-bw)/2,by=K.H-bh-14*K.S-K.safe.b;g.save();K.rr(bx,by,bw,bh,16*K.S);g.fillStyle='rgba(255,250,235,.95)';g.fill();g.lineWidth=3*K.S;g.strokeStyle=o.edge||'#7a4a1c';g.stroke();g.restore();
  K.wrap(txt,bw-pad*2,fs,700).forEach((l,j)=>K.text(l,bx+pad,by+pad+fs*.6+j*fs*1.3,fs,'#3a2410',{al:'left',w:700,stroke:false}));
  if(pg.who)K.text(pg.who,bx+pad,by-2*K.S,fs*.9,'#ffd166',{al:'left'});
  if(typed>=pg.text.length&&K.frame%60<40)K.text('Tap ▶',bx+bw-pad,by+bh-14*K.S,fs*.75,'#7a4a1c',{al:'right',stroke:false});
  const sw=110*K.S,sh=50*K.S;K.button({id:'skip',x:K.W-sw-12*K.S-K.safe.r,y:12*K.S+K.safe.t,w:sw,h:sh,label:'SKIP ⏭',color:'#c92a2a',fs:20*K.S,cb:()=>{done()}});
  K.text((i+1)+' / '+pages.length,12*K.S+K.safe.l,24*K.S+K.safe.t,14*K.S,'#fff',{al:'left'})},
 down(){},up(p,c){if(!c)S.next()},key(k,d){if(d&&(k==='Enter'||k===' '||k==='ArrowRight')){S.next();return true}if(d&&k==='Escape'){done();return true}}};return S};
/* ---------- gamepad (house gamepad.js) */
K.padUsed=false;K.pad={x:0,y:0};
K.initPad=function(o){if(!window.GamepadSupport)return;const sc=()=>K.scene||{};
 const fwd=(name)=>function(p){K.padUsed=true;const s=sc();if(s.padBtn&&s.padBtn(name,p)===true)return;if(!p)return;
  if(name==='a'&&!s.play){const b=K.lastBtns.find(z=>z.id===K.focusId&&!z.dis&&!z.hidden)||K.lastBtns.find(z=>z.primary&&!z.dis&&!z.hidden)||K.lastBtns.find(z=>!z.dis&&!z.hidden);if(b){K.focusId=b.id;fire(b)}}
  if(name==='b'&&!s.play){if(s.back)s.back()}
  if(name==='start'){if(s.paused&&s.resume)s.resume();else if(s.play&&s.pause)s.pause()}
  if(name==='back')K.toggleMute()};
 const nav=(dx,dy)=>function(p){K.padUsed=true;const s=sc();if(s.padDir&&s.padDir(dx,dy,p)===true)return;if(!p||s.play)return;moveFocus(dx,dy)};
 GamepadSupport.init({keys:{a:fwd('a'),b:fwd('b'),x:fwd('x'),y:fwd('y'),lb:fwd('lb'),rb:fwd('rb'),lt:fwd('lt'),rt:fwd('rt'),start:fwd('start'),back:fwd('back'),up:nav(0,-1),down:nav(0,1),left:nav(-1,0),right:nav(1,0)},
  noRepeat:['a','b','x','y','start','back','lb','rb'],repeat:false,menu:function(){return false},items:function(){return[]},
  isPaused:function(){return !!(sc().paused)},pause:function(){const s=sc();if(s.play&&s.pause)s.pause()},back:function(){const s=sc();if(s.back){s.back();return true}return true},
  onFrame:function(r){const ax=r&&r.ax?r.ax:{x:0,y:0};K.pad={x:Math.abs(ax.x)>.25?ax.x:0,y:Math.abs(ax.y)>.25?ax.y:0};if(K.pad.x||K.pad.y)K.padUsed=true;
   const s=sc();if(!s.play&&(K.pad.x||K.pad.y)){const n=performance.now();if(!K._nt||n-K._nt>260){K._nt=n;moveFocus(Math.abs(K.pad.x)>Math.abs(K.pad.y)?Math.sign(K.pad.x):0,Math.abs(K.pad.y)>=Math.abs(K.pad.x)?Math.sign(K.pad.y):0)}}},
  help:o&&o.help,hint:false})};
function moveFocus(dx,dy){const L=K.lastBtns.filter(b=>!b.dis&&!b.hidden);if(!L.length)return;let cur=L.find(b=>b.id===K.focusId);if(!cur){K.focusId=(L.find(b=>b.primary)||L[0]).id;return}
 const cx=cur.x+cur.w/2,cy=cur.y+cur.h/2;let best=null,bd=1e9;for(const b of L){if(b===cur)continue;const x=b.x+b.w/2-cx,y=b.y+b.h/2-cy;const along=dx?x*dx:y*dy;if(along<=4)continue;const off=dx?Math.abs(y):Math.abs(x);const d=along+off*2.2;if(d<bd){bd=d;best=b}}
 if(best)K.focusId=best.id}
K.moveFocus=moveFocus;
/* ---------- QA hooks: rects of characters drawn this frame, to prove buttons never cover them */
K.charRects=[];K.markChar=function(x,y,w,h,name){K.charRects.push({x,y,w,h,name})};
/* ---------- main loop */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);let dt=Math.min(.05,(now-last)/1000);last=now;K.dt=dt;K.t+=dt;K.frame++;
 K.btns=[];K.charRects=[];K.logoRect=null;g.setTransform(K.DPR,0,0,K.DPR,0,0);
 try{const s=K.scene;if(s){if(!s.paused&&s.update)s.update(dt);g.save();if(K.shake>0){g.translate((Math.random()-.5)*K.shake,(Math.random()-.5)*K.shake);K.shake*=.88;if(K.shake<.3)K.shake=0}s.draw&&s.draw();g.restore();if(s.paused&&s.drawPause)s.drawPause();}
  K.drawParts();if(K.fade>0){g.fillStyle='rgba(0,0,0,'+K.fade+')';g.fillRect(0,0,K.W,K.H);K.fade=Math.max(0,K.fade-dt*3.5)}}catch(e){console.error(e);(window.__ERR=window.__ERR||[]).push(String(e&&e.stack||e))}
 K.lastBtns=K.btns;if(K.focusId&&!K.lastBtns.some(b=>b.id===K.focusId))K.focusId=null}
K.start=function(s){K.go(s);requestAnimationFrame(loop)};
/* QA helper: step the game n frames synchronously */
K.step=function(n){for(let i=0;i<n;i++){K.dt=1/60;K.t+=1/60;K.frame++;K.btns=[];K.charRects=[];const s=K.scene;if(s&&!s.paused&&s.update)s.update(1/60);g.setTransform(K.DPR,0,0,K.DPR,0,0);if(s&&s.draw&&(i%10===9||i===n-1)){s.draw();K.lastBtns=K.btns}}};
})();
