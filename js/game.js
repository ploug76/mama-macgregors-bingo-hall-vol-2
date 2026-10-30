/* game.js — Mama MacGregor's Bingo Hall 2: Bingo Night (large text, one tap to play) */
(function(){
'use strict';
const g=K.g,TAU=Math.PI*2,M=MAMA;K.ns='mmbh2';
/* large print: UI text never below 24px (Helene rule) */
const _KT=K.text;K.text=function(s,x,y,sz,c,o){if(sz>=14*K.S&&sz<24*K.S&&!(o&&o.art))sz=24*K.S;return _KT.call(this,s,x,y,sz,c,o)};
const COLS='BINGO';
const PHRASES={1:"Mama's wee one",2:"Two wee lambs",3:"Three in a kirk pew",4:"Four coos at the door",5:"Five loaves for the crowd",6:"Half a dozen scones",7:"Lucky seven, Heaven sent",8:"Eight bales of hay",9:"Nine o'clock tea",10:"Ten commandments",11:"Legs eleven, coo's legs!",12:"Twelve disciples",13:"Baker's dozen shortbread",14:"Fourteen ewes in the fold",15:"Fifteen bonny thistles",
16:"Sweet sixteen",17:"Seventeen tartan scarves",18:"Eighteen bells a-ringing",19:"Nineteen, Mama's knitting",20:"Twenty sheep in the glen",21:"Key of the door",22:"Two wee ducks",23:"The Lord's my shepherd",24:"Two dozen eggs",25:"Christmas Day",26:"Half a crown",27:"Gateway to Heaven",28:"Twenty-eight days of porridge",29:"Rise and shine",30:"Dirty Gertie the donkey",
31:"Get up and run",32:"Buckle my shoe",33:"All the threes, fleas on the coos!",34:"Ask for more",35:"Jump and jive",36:"Three dozen hymns",37:"More than eleven",38:"Christmas cake",39:"Steps up the kirk",40:"Forty days and nights",41:"Time for fun",42:"Winnie the Pooh",43:"Down on your knees",44:"Droopy drawers",45:"Halfway there",
46:"Up to tricks",47:"Four and seven",48:"Four dozen",49:"Rise and pray",50:"Half a century",51:"Tweak of the thumb",52:"Weeks in the year",53:"Stuck in the tree",54:"Clean the floor",55:"Snakes alive",56:"Shotts bus",57:"Heinz varieties",58:"Make them wait",59:"Brighton line",60:"Five dozen",
61:"Bakers' bun",62:"Tickety-boo",63:"Tickle me",64:"Red raw",65:"Old age pension",66:"Clickety-click",67:"Stairway to Heaven",68:"Saving grace",69:"Either way up",70:"Three score and ten",71:"Bang on the drum",72:"Six dozen",73:"Queen bee",74:"Hit the floor",75:"Strive and strive, the last one!"};
const letter=n=>COLS[Math.floor((n-1)/15)];
const bit=(r,c)=>1<<(r*5+c);const mask=a=>a.reduce((m,[r,c])=>m|bit(r,c),0);
const rows=[0,1,2,3,4].map(r=>mask([0,1,2,3,4].map(c=>[r,c]))),cols=[0,1,2,3,4].map(c=>mask([0,1,2,3,4].map(r=>[r,c])));
const d1=mask([0,1,2,3,4].map(i=>[i,i])),d2=mask([0,1,2,3,4].map(i=>[i,4-i])),ALL=(1<<25)-1;
const PATTERNS={
 line:{n:'Any Line',d:'Any full row, column or diagonal',masks:[...rows,...cols,d1,d2],prize:40},
 corners:{n:'Four Corners',d:'All four corner squares',masks:[mask([[0,0],[0,4],[4,0],[4,4]])],prize:50},
 x:{n:'Big X',d:'Both diagonals',masks:[d1|d2],prize:80},
 cross:{n:'The Cross',d:'The middle column and the middle row',masks:[cols[2]|rows[2]],prize:80},
 horns:{n:'Cow Horns',d:'A Highland coo\u2019s horns',masks:[mask([[0,0],[0,4],[1,0],[1,1],[1,3],[1,4],[2,1],[2,2],[2,3]])],prize:90},
 tee:{n:'Letter T',d:'The top row and the middle column',masks:[rows[0]|cols[2]],prize:80},
 frame:{n:'Barn Fence',d:'Every square around the edge',masks:[rows[0]|rows[4]|cols[0]|cols[4]],prize:120},
 blackout:{n:'Blackout',d:'Every square on the card!',masks:[ALL],prize:300}};
const HALLS=[
 {id:'kirk',n:'Kirk Hall',lvl:1,cpus:5,pats:['line','corners','line','x','line'],bg:['#5a3a24','#3a2416'],d:'Tea and shortbread in the church hall.'},
 {id:'barn',n:'Highland Barn',lvl:2,cpus:7,pats:['corners','line','x','horns','line'],bg:['#8a3a22','#4a1e10'],d:'Hay bales for seats and coos peeking in.'},
 {id:'loch',n:'Lochside Ceilidh',lvl:4,cpus:8,pats:['line','tee','corners','cross','x'],bg:['#2b5876','#163246'],d:'Fiddles, a wee dance, and a view of the loch.'},
 {id:'donkey',n:'Donkey Sanctuary',lvl:6,cpus:10,pats:['cross','horns','x','tee','frame'],bg:['#5a5a6a','#2e2e3a'],d:'The donkeys bray at every BINGO!'},
 {id:'lamb',n:'Lambing Shed',lvl:8,cpus:12,pats:['frame','cross','horns','line','blackout'],bg:['#6a8a4a','#33452a'],d:'Springtime lambs and big prizes.'},
 {id:'cathedral',n:'Cathedral Grand Hall',lvl:11,cpus:16,pats:['cross','frame','tee','x','blackout'],bg:['#3a2a5a','#1a1030'],d:'The grandest hall, under stained glass.'}];
const NAMES=['Auntie Morag','Wee Hamish','Granny Elspeth','Pastor Angus','Fiona','Old Tam','Isla','Callum','Mrs. Fraser','Duncan','Kirsty','Big Jock','Ailsa','Rab the Farmer','Mairi','Lachlan','Effie','Ewan'];
const POW=[{k:'hoof',n:'Hoof Stomp',ic:'🐮',d:'Marks a free square on every card'},{k:'lamb',n:"Lamb's Blessing",ic:'🐑',d:'Tap ANY square to mark it'},{k:'dove',n:"Dove's Peek",ic:'🕊️',d:'See the next 3 balls'},{k:'donkey',n:'Donkey Double',ic:'🐴',d:'Doubles this game\u2019s prize'}];
const SPEEDS=[{n:'Slow',s:6.5},{n:'Normal',s:4.8},{n:'Fast',s:3.4}];
const DEF={coins:500,xp:0,ncards:1,auto:true,speed:0,voice:true,big:1,hall:'kirk',pow:{hoof:1,lamb:1,dove:1,donkey:0},stars:{},games:0,wins:0,story:false,gift:''};
let SV=Object.assign({},DEF,K.save.get('data',{}));SV.pow=Object.assign({},DEF.pow,SV.pow||{});const save=()=>K.save.set('data',SV);
const lvlOf=xp=>{let l=1,need=100,x=xp;while(x>=need){x-=need;l++;need=Math.round(need*1.25)}return{l,x,need}};
K.loadLogo('logo-boh.png');
const SONG={bpm:112,wave:'triangle',lv:.045,bass:[45,0,52,0,45,0,52,0,50,0,57,0,48,0,55,0],lead:[69,0,72,74,76,0,74,72,69,0,67,69,72,0,0,0,74,0,76,79,81,0,79,76,74,0,72,74,76,0,0,0]};
/* -------- shared UI */
function hallBg(h){const H=h||HALLS[0];const gr=g.createLinearGradient(0,0,0,K.H);gr.addColorStop(0,H.bg[0]);gr.addColorStop(1,H.bg[1]);g.fillStyle=gr;g.fillRect(0,0,K.W,K.H);
 const S=K.S;g.globalAlpha=.12;g.fillStyle='#000';for(let x=0;x<K.W;x+=46*S)g.fillRect(x,0,3*S,K.H);g.globalAlpha=1;
 if(H.id==='cathedral'){for(let i=0;i<4;i++){const x=K.W*(.12+i*.25),w=40*S;g.save();g.globalAlpha=.35;['#e03131','#1c7ed6','#f59f00','#2f9e44'].forEach((c,j)=>{g.fillStyle=c;g.fillRect(x-w/2+(j%2)*w/2,K.H*.04+Math.floor(j/2)*w*.8,w/2,w*.8)});g.restore()}}
 else if(H.id==='loch'){g.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(K.W*(i/4),K.H*.12,90*S,20*S,0,0,TAU);g.fill()}}
 else{for(let i=0;i<4;i++){const x=K.W*(.12+i*.25),w=34*S,y=K.H*.04;['#e03131','#1c7ed6','#f59f00','#2f9e44'].forEach((c,j)=>{g.fillStyle=c;g.globalAlpha=.5;g.fillRect(x-w/2+(j%2)*w/2,y+Math.floor(j/2)*w/2,w/2,w/2)});g.globalAlpha=1}}}
function panel(x,y,w,h){g.save();K.rr(x,y,w,h,16*K.S);g.fillStyle='rgba(255,250,238,.97)';g.fill();g.lineWidth=3*K.S;g.strokeStyle='#d9dde2';g.stroke();g.restore()}
const BC={green:'#2b8a3e',blue:'#1864ab',red:'#c92a2a',gold:'#e8a400',plum:'#862e9c',grey:'#495057'};
function bigBtn(o){return K.button(Object.assign({r:18*K.S,fs:Math.min(o.h*.42,30*K.S)},o))}
function topIcons(){const S=K.S,sf=K.safe,s=54*S;K.button({id:'mute',x:K.W-sf.r-s-10*S,y:sf.t+10*S,w:s,h:s,r:s/2,label:K.muted?'🔇':'🔊',fs:24*S,color:'#5f3dc4',cb:()=>K.toggleMute()})}
function say(txt){if(!SV.voice||K.muted)return;try{const u=new SpeechSynthesisUtterance(txt);u.rate=.88;u.pitch=1.05;const v=speechSynthesis.getVoices().find(v=>/en[-_]GB/i.test(v.lang));if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function titleBanner(x,y,w,h){M.tartanBox(x,y,w,h,18*K.S,14*K.S);g.save();K.rr(x+8*K.S,y+8*K.S,w-16*K.S,h-16*K.S,12*K.S);g.fillStyle='rgba(10,20,15,.55)';g.fill();g.restore();
 K.text("Mama MacGregor's",x+w/2,y+h*.32,Math.min(30*K.S,w/12),'#ffe08a',{maxW:w-30*K.S});K.text('BINGO HALL 2',x+w/2,y+h*.68,Math.min(44*K.S,w/7.5),'#fff',{maxW:w-30*K.S,stroke:'#7a1020'})}
function ballArt(x,y,r,n,o){o=o||{};const col={B:'#1c7ed6',I:'#e03131',N:'#adb5bd',G:'#2f9e44',O:'#f59f00'}[letter(n)];g.save();if(o.gold){g.shadowColor='#ffd43b';g.shadowBlur=18*K.S}
 g.fillStyle=o.gold?'#fcc419':col;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.shadowBlur=0;g.fillStyle='#fff';g.beginPath();g.arc(x,y,r*.66,0,TAU);g.fill();g.restore();
 K.text(letter(n),x,y-r*.3,r*.34,'#333',{stroke:false});K.text(String(n),x,y+r*.15,r*.58,'#111',{stroke:false});g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(x-r*.4,y-r*.5,r*.25,r*.14,-.5,0,TAU);g.fill()}
/* -------- TITLE */
const Title={enter(){K.music.play(SONG);giftCheck()},
 draw(){const S=K.S,W=K.W,H=K.H,P=K.portrait,sf=K.safe;hallBg(HALLS.find(h=>h.id===SV.hall));let tb;const lv=lvlOf(SV.xp).l;
  if(P){tb={x:16*S,y:sf.t+72*S,w:W-32*S,h:Math.min(130*S,H*.15)};titleBanner(tb.x,tb.y,tb.w,tb.h);
   const bw=Math.min(W-36*S,380*S),bh=82*S,gap=14*S;const btnTop=H-sf.b-20*S-(bh+gap+64*S);
   const floorY=btnTop-24*S;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,floorY,W,4*S);
   const mh=Math.min(floorY-(tb.y+tb.h)-62*S,300*S);K.text('🪙 '+SV.coins+'   ⭐ Level '+lv,W/2,tb.y+tb.h+24*S,22*S,'#ffe08a');const m=M.draw(W/2,floorY,mh,{mode:'wave'});K.markChar(m.x,m.y,m.w,m.h,'mama');
   const c=M.coo(W*.17,floorY,mh*.36,{dir:1});K.markChar(c.x,c.y,c.w,c.h,'coo');const d=M.donkey(W*.84,floorY,mh*.36,{dir:-1});K.markChar(d.x,d.y,d.w,d.h,'donkey');
   bigBtn({id:'play',x:(W-bw)/2,y:btnTop,w:bw,h:bh,label:'▶ PLAY BINGO',color:BC.green,primary:true,fs:34*S,cb:startPlay});
   bigBtn({id:'halls',x:(W-bw)/2,y:btnTop+bh+gap,w:bw,h:64*S,label:'🏛️ LEVEL SELECT',color:BC.blue,fs:26*S,cb:()=>K.go(Halls)});
   }
  else{tb={x:sf.l+14*S,y:sf.t+10*S,w:W*.5-28*S,h:Math.min(110*S,H*.27)};titleBanner(tb.x,tb.y,tb.w,tb.h);const floorY=H-sf.b-14*S;
   const mh=Math.min(floorY-(tb.y+tb.h)-14*S,260*S);const m=M.draw(tb.x+tb.w*.5,floorY,mh,{mode:'wave'});K.markChar(m.x,m.y,m.w,m.h,'mama');
   const c=M.coo(tb.x+tb.w*.12,floorY,mh*.4,{dir:1});K.markChar(c.x,c.y,c.w,c.h,'coo');const d=M.donkey(tb.x+tb.w*.9,floorY,mh*.4,{dir:-1});K.markChar(d.x,d.y,d.w,d.h,'donkey');
   const bw=Math.min(W*.4,360*S),x=W*.55+(W*.45-bw)/2-sf.r/2,bh=Math.min(80*S,H*.2),gap=12*S;let y=Math.max(sf.t+76*S,(H-(bh+gap+60*S))/2+10*S);
   bigBtn({id:'play',x,y,w:bw,h:bh,label:'▶ PLAY BINGO',color:BC.green,primary:true,fs:32*S,cb:startPlay});const hw=(bw-gap)/2;
   bigBtn({id:'halls',x,y:y+bh+gap,w:bw,h:60*S,label:'🏛️ LEVEL SELECT',color:BC.blue,fs:26*S,cb:()=>K.go(Halls)});
   K.text('🪙 '+SV.coins+'   ⭐ Level '+lv,x+bw/2,y-26*S,22*S,'#ffe08a')}
  topIcons();const hb=54*S;K.button({id:'help',x:K.W-sf.r-2*hb-20*S,y:sf.t+10*S,w:hb,h:hb,r:hb/2,label:'❓',fs:24*S,color:'#1971c2',cb:()=>K.go(Help)});K.button({id:'opts',x:K.W-sf.r-3*hb-30*S,y:sf.t+10*S,w:hb,h:hb,r:hb/2,label:'⚙️',fs:24*S,color:'#862e9c',cb:()=>K.go(Opts)});
  const avoid=K.btns.concat(K.charRects,[tb]);for(const c of ['tl','bl','br'])if(K.drawLogo(c,72*S,avoid))break;
  if(this.gift){const gw=Math.min(W-40*S,380*S),gh=200*S;const gx=(W-gw)/2,gy=(H-gh)/2;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);panel(gx,gy,gw,gh);K.text("☕ Mama's gift",W/2,gy+38*S,28*S,'#5a3a24',{stroke:false});K.text('Tea, shortbread and 🪙 100 coins!',W/2,gy+82*S,20*S,'#333',{stroke:false,maxW:gw-20*S});
   K.btns.length=0;bigBtn({id:'thanks',x:gx+30*S,y:gy+gh-80*S,w:gw-60*S,h:62*S,label:'Thank you, Mama!',color:BC.green,primary:true,cb:()=>{this.gift=false;SV.coins+=100;save();K.sfx.coin()}})}},
 back(){}};
function giftCheck(){const d=new Date().toDateString();if(SV.gift!==d){SV.gift=d;save();Title.gift=true}}
function startPlay(){if(!SV.story){SV.story=true;save();K.go(storyScene(()=>K.go(Play)));return}K.go(Play)}
function storyScene(done){const sc=(f)=>t=>{hallBg(HALLS[0]);const fy=K.H*.62;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,fy,K.W,4*K.S);f(t,fy)};const mh=()=>Math.min(K.H*.42,K.W*.62);
 return K.storyScene([
  {who:'Mama MacGregor',text:"Hello, dearie! Welcome back to the Kirk Hall. Pull up a chair, the tea is on.",draw:sc((t,fy)=>{const m=M.draw(K.W/2,fy,mh(),{mode:'wave',talk:1})})},
  {who:'Mama MacGregor',text:"I'll call the numbers. Your card marks itself, so you just watch for the gold BINGO button.",draw:sc((t,fy)=>{M.draw(K.W*.35,fy,mh(),{mode:'call',talk:1});ballArt(K.W*.72,fy-mh()*.7,40*K.S,22)})},
  {who:'Mama MacGregor',text:"When BINGO glows gold, tap it quick, before Big Jock shouts!",draw:sc((t,fy)=>{M.draw(K.W*.3,fy,mh(),{mode:'point',talk:1});K.button({id:'demo',x:K.W*.52,y:fy-mh()*.6,w:K.W*.42,h:70*K.S,label:'BINGO!',color:BC.gold,instant:true,cb:()=>{}})})},
  {who:'Mama MacGregor',text:"Win games for coins and stars, and you'll open up new halls. Off we go!",draw:sc((t,fy)=>{M.draw(K.W*.5,fy,mh(),{mode:'dance'});M.coo(K.W*.17,fy,mh()*.3,{dir:1,ph:t/66,moving:true});M.donkey(K.W*.84,fy,mh()*.3,{dir:-1,ph:t/66,moving:true})})}],done,{fs:26,edge:'#2b8a3e'})}
/* -------- HALLS (level select) */
const Halls={draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait;hallBg(HALLS.find(h=>h.id===SV.hall));const lv=lvlOf(SV.xp).l;
  K.button({id:'back',x:sf.l+10*S,y:sf.t+10*S,w:110*S,h:56*S,label:'⬅ Back',color:BC.grey,fs:22*S,cb:()=>K.go(Title)});K.text('Level Select',W/2+50*S,sf.t+38*S,30*S,'#fff');
  const cols=P?1:3,gap=10*S,top=sf.t+76*S,rows=Math.ceil(HALLS.length/cols),foot=P?(64*S+86*S+3*gap+30*S):(84*S+gap*2),cw=(W-sf.l-sf.r-28*S-gap*(cols-1))/cols,ch=Math.min((H-top-sf.b-foot-gap*(rows-1))/rows,120*S);
  HALLS.forEach((h,i)=>{const x=sf.l+14*S+(i%cols)*(cw+gap),y=top+Math.floor(i/cols)*(ch+gap),lock=lv<h.lvl,st=SV.stars[h.id]||0,sel=h.id===SV.hall;
   K.button({id:'hall-'+h.id,x,y,w:cw,h:ch,dis:lock,primary:sel,cb:()=>{SV.hall=h.id;save()},draw:(b,down)=>{g.save();K.rr(0,0,b.w,b.h,16*S);const gr=g.createLinearGradient(0,0,b.w,0);gr.addColorStop(0,h.bg[0]);gr.addColorStop(1,h.bg[1]);g.fillStyle=lock?'#555':gr;g.fill();g.lineWidth=(sel?7:3)*S;g.strokeStyle=sel?'#ffd43b':'#fff';g.stroke();g.restore();
    const fs=Math.max(24*S,Math.min(26*S,b.h*.3));K.text((sel?'✅ ':'')+h.n,14*S,b.h*.3,fs,'#fff',{al:'left',maxW:b.w-24*S});K.text(lock?'🔒 Level '+h.lvl:'⭐'.repeat(st)+'☆'.repeat(5-st),14*S,b.h*.72,24*S,lock?'#ddd':'#ffe08a',{al:'left',maxW:b.w-24*S})}})});
  const fy=top+rows*(ch+gap);const C=[1,2,4];
  if(P){K.text('Cards',sf.l+20*S,fy+16*S,24*S,'#fff',{al:'left'});const bw=(W-sf.l-sf.r-28*S-gap*2)/3;C.forEach((n,j)=>bigBtn({id:'cards-'+n,x:sf.l+14*S+j*(bw+gap),y:fy+32*S,w:bw,h:64*S,label:n+(n===1?' card':' cards'),color:SV.ncards===n?BC.green:'#868e96',fs:24*S,cb:()=>{SV.ncards=n;save()}}));
   const sw=Math.min(W-36*S,380*S);bigBtn({id:'start',x:(W-sw)/2,y:fy+32*S+64*S+gap+6*S,w:sw,h:Math.min(86*S,H-sf.b-(fy+32*S+64*S+gap+6*S)-8*S),label:'▶ START',color:BC.green,primary:true,fs:36*S,cb:startPlay})}
  else{const half=(W-sf.l-sf.r-28*S-gap)/2,bw=(half-gap*2)/3;C.forEach((n,j)=>bigBtn({id:'cards-'+n,x:sf.l+14*S+j*(bw+gap),y:fy+4*S,w:bw,h:72*S,label:n+(n===1?' card':' cards'),color:SV.ncards===n?BC.green:'#868e96',fs:24*S,cb:()=>{SV.ncards=n;save()}}));
   bigBtn({id:'start',x:sf.l+14*S+half+gap,y:fy+4*S,w:half,h:72*S,label:'▶ START',color:BC.green,primary:true,fs:34*S,cb:startPlay})}},
 back(){K.go(Title)}};
/* -------- OPTIONS */
const Opts={draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe;hallBg(HALLS[0]);K.button({id:'back',x:sf.l+10*S,y:sf.t+10*S,w:110*S,h:56*S,label:'⬅ Back',color:BC.grey,fs:22*S,cb:()=>K.go(Title)});K.text('Options',W/2+40*S,sf.t+38*S,30*S,'#fff');
  const rowsDef=[['Cards',[['1',()=>SV.ncards=1,SV.ncards===1],['2',()=>SV.ncards=2,SV.ncards===2],['4',()=>SV.ncards=4,SV.ncards===4]]],
   ['Mark my card',[['Auto ✓',()=>SV.auto=true,SV.auto],['I\u2019ll tap',()=>SV.auto=false,!SV.auto]]],
   ['Calling speed',SPEEDS.map((s,i)=>[s.n,()=>SV.speed=i,SV.speed===i])],
   ['Mama\u2019s voice',[['On',()=>SV.voice=true,SV.voice],['Off',()=>SV.voice=false,!SV.voice]]],
   ['Number size',[['Big',()=>SV.big=1,SV.big===1],['Bigger',()=>SV.big=2,SV.big===2]]]];
  const P=K.portrait,top=sf.t+80*S,rh=Math.min(P?110*S:(H-top-sf.b)/3.2,120*S),cols=P?1:2,cw=(W-sf.l-sf.r-30*S-(cols-1)*14*S)/cols;
  rowsDef.forEach((r,i)=>{const x=sf.l+15*S+(i%cols)*(cw+14*S),y=top+Math.floor(i/cols)*rh;K.text(r[0],x+4*S,y+16*S,22*S,'#fff',{al:'left'});const n=r[1].length,gap=10*S,bw=(cw-gap*(n-1))/n;
   r[1].forEach((o,j)=>bigBtn({id:'o'+i+'-'+j,x:x+j*(bw+gap),y:y+34*S,w:bw,h:Math.min(62*S,rh-44*S),label:o[0],color:o[2]?BC.green:'#868e96',fs:24*S,cb:()=>{o[1]();save()}}))})},back(){K.go(Title)}};
/* -------- HELP */
const Help={draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe;hallBg(HALLS[0]);K.button({id:'back',x:sf.l+10*S,y:sf.t+10*S,w:110*S,h:56*S,label:'⬅ Back',color:BC.grey,fs:22*S,cb:()=>K.go(Title)});
  const LP=!K.portrait,bw=LP?Math.min(W-sf.l-sf.r-150*S,720*S):Math.min(W-30*S,640*S),x=LP?sf.l+136*S:(W-bw)/2,y=LP?sf.t+10*S:sf.t+78*S,h=H-y-sf.b-(LP?10:14)*S;panel(x,y,bw,h);
  const L=['Tap PLAY BINGO to start.','Your card marks itself (⚙️ to change).','BINGO glows gold? Tap it!','Make the shape shown at the top.','Win coins and stars to open new halls.','LEVEL SELECT: pick a hall, then START.','Helpers: 🐮 mark one, 🐑 mark any, 🕊️ peek, 🐴 double.','Pretend coins only.'];
  const cols=K.portrait?1:2,cw=(bw-36*S)/cols,per=Math.ceil(L.length/cols);let fs=24*S;const hOf=f=>{let m=0;for(let c=0;c<cols;c++){let t=0;for(const l of L.slice(c*per,c*per+per))t+=K.wrap('• '+l,cw-12*S,f,700).length*f*1.25+f*.4;m=Math.max(m,t)}return m};if(K.portrait)while(hOf(fs*1.08)<h-40*S&&fs<30*S)fs*=1.08;
  for(let c=0;c<cols;c++){let yy=y+16*S+fs*.6;for(const l of L.slice(c*per,c*per+per)){yy+=K.textBox('• '+l,x+18*S+c*cw,yy,cw-12*S,fs,'#2a2a2a',{al:'left',w:700,stroke:false})+fs*.4}}},back(){K.go(Title)}};
/* -------- PLAY */
function mkCard(){const nums=[[],[],[],[],[]];for(let c=0;c<5;c++){const pool=[];for(let k=1;k<=15;k++)pool.push(c*15+k);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}for(let r=0;r<5;r++)nums[r][c]=pool[r]}nums[2][2]=0;return{nums,m:bit(2,2),flash:{}}}
const has=(m,P)=>P.masks.some(k=>(m&k)===k);
const needOf=(m,P)=>Math.min(...P.masks.map(k=>{let x=k&~m,n=0;while(x){n+=x&1;x>>>=1}return n}));
function cpuMask(card,called){let m=bit(2,2);for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(called.has(card.nums[r][c]))m|=bit(r,c);return m}
let G=null;
const Play={play:true,
 enter(){const h=HALLS.find(x=>x.id===SV.hall)||HALLS[0];G={hall:h,game:0,wins:0,coins:0};this.paused=false;K.music.halt();this.newGame()},
 newGame(){const h=G.hall;const pat=h.pats[G.game];const deck=[];for(let i=1;i<=75;i++)deck.push(i);for(let i=74;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  const cpus=[];const names=NAMES.slice();for(let i=0;i<h.cpus;i++){const nm=names.splice(Math.floor(Math.random()*names.length),1)[0];cpus.push({name:nm,card:mkCard(),react:1.6+Math.random()*2.6+SV.speed*-.3,at:null})}
  Object.assign(G,{pat,P:PATTERNS[pat],deck,di:0,called:[],calledAt:{},toldBingo:false,calledSet:new Set(),cur:null,t:-2.4,next:0,cards:Array.from({length:SV.ncards},mkCard),cpus,over:false,res:null,golden:deck[8+Math.floor(Math.random()*25)],dbl:false,lamb:false,peek:0,msg:'Eyes down! This game: '+PATTERNS[pat].n,msgT:3,ballAnim:0,claimable:false,mamaMode:'call'});
  say('Eyes down! This game is '+PATTERNS[pat].n)},
 interval(){return SPEEDS[SV.speed].s},
 update(dt){if(!G||G.over)return;G.t+=dt;if(G.msgT>0)G.msgT-=dt;G.ballAnim=Math.min(1,G.ballAnim+dt*2.2);
  if(G.t>=G.next&&G.di<75){this.callBall();G.next=G.t+this.interval()}
  if(G.di>=75&&G.t>G.next+3&&!G.over){this.end(null)}
  // auto-daub
  if(SV.auto&&G.cur){for(const cd of G.cards)for(let r=0;r<5;r++)for(let c=0;c<5;c++){const n=cd.nums[r][c];if(n&&G.calledSet.has(n)&&!(cd.m&bit(r,c))&&G.t-(G.calledAt[n]||0)>Math.min(.7,this.interval()*.5)){this.daub(cd,r,c,true)}}}
  G.claimable=G.cards.some(cd=>has(cd.m,G.P));
  // CPU claims
  for(const p of G.cpus){if(p.at==null&&has(cpuMask(p.card,G.calledSet),G.P))p.at=G.t+p.react;if(p.at!=null&&G.t>=p.at){this.end(p);return}}
  if(window.__T&&__T.bot&&G.claimable&&G.t-G.curT>(__T.botDelay||1))this.claim()},
 callBall(){const n=G.deck[G.di++];G.cur=n;G.curT=G.t;G.called.push(n);G.calledSet.add(n);G.calledAt[n]=G.t;G.ballAnim=0;if(G.peek>0)G.peek--;const gold=n===G.golden;
  K.tone(880,.08,{type:'triangle',v:.1});K.tone(660,.12,{type:'triangle',v:.08,at:.08});G.msg=letter(n)+' '+n+' — “'+PHRASES[n]+'”';G.msgT=99;say(letter(n)+' '+n+'. '+PHRASES[n]);
  if(gold){G.msg='⭐ GOLDEN BALL! '+G.msg;K.sfx.coin()}},
 daub(cd,r,c,auto){if(cd.m&bit(r,c))return;cd.m|=bit(r,c);cd.flash[r*5+c]=K.t;K.sfx.pop();const n=cd.nums[r][c];if(n===G.golden){G.coins+=25;SV.coins+=25;save();K.float('+25 golden!',K.W/2,K.H*.4,'#ffd43b',26)}
  if(has(cd.m,G.P)&&!G.toldBingo){G.toldBingo=true;G.msg='You have BINGO! Tap the gold button!';G.msgT=99;K.sfx.good()}},
 tapCell(cd,r,c){if(G.over)return;const n=cd.nums[r][c];if(cd.m&bit(r,c))return;if(G.lamb){G.lamb=false;this.daub(cd,r,c);K.float("Lamb's Blessing!",K.W/2,K.H*.4,'#fff',24);return}
  if(n&&G.calledSet.has(n))this.daub(cd,r,c);else{K.sfx.bad();G.msg=n?letter(n)+' '+n+' hasn\u2019t been called yet':'';G.msgT=2}},
 claim(){if(G.over)return;if(G.claimable){this.end('me')}else{K.sfx.bad();G.msg='Not quite, dearie! Keep watching.';G.msgT=2.5}},
 usePow(k){if(G.over||!(SV.pow[k]>0))return;if(k==='hoof'){for(const cd of G.cards){const free=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(!(cd.m&bit(r,c)))free.push([r,c]);if(free.length){const f=K.pick(free);this.daub(cd,f[0],f[1])}}K.sfx.thud();G.msg='Stomp! The coo marked a square!';G.msgT=2.5}
  if(k==='lamb'){G.lamb=true;G.msg="Tap ANY square to mark it";G.msgT=4}if(k==='dove'){G.peek=3;G.msg='The dove peeks at the next 3 balls';G.msgT=3}if(k==='donkey'){if(G.dbl){G.msg='Already doubled, dearie!';G.msgT=2;return}G.dbl=true;G.msg='Hee-haw! This prize is DOUBLED!';G.msgT=3;K.tone(300,.3,{type:'sawtooth',v:.08,f2:500})}
  SV.pow[k]--;save()},
 end(winner){G.over=true;const prize=G.P.prize*(G.dbl?2:1)*(1+G.hall.lvl*.1)|0;let res;const meToo=G.claimable;
  if(winner==='me'){res={win:true,prize,who:'You'};K.sfx.win();say('Bingo! Well done, dearie!');K.burst(K.W/2,K.H*.4,80,{sp:7})}
  else if(winner&&meToo){res={win:true,share:true,prize:Math.round(prize/2),who:winner.name};K.sfx.good();say('Bingo! You share it with '+winner.name)}
  else if(winner){res={win:false,prize:0,who:winner.name};K.sfx.bad();say(winner.name+' got there first. Better luck next game, dearie.')}
  else res={win:false,prize:0,who:'Nobody'};
  if(res.win){G.wins++;SV.wins++;SV.coins+=res.prize;G.coins+=res.prize;const k=K.pick(['hoof','lamb','dove','donkey']);SV.pow[k]=(SV.pow[k]||0)+1;res.pow=k}
  SV.xp+=res.win?40:10;SV.games++;save();G.res=res;G.game++;
  setTimeout(()=>{if(K.scene===Play)K.go(Between,res)},res.win?1600:1200)},
 lay(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait;const L={};
  if(P){L.top={x:0,y:0,w:W,h:sf.t+64*S};L.caller={x:8*S,y:L.top.h+6*S,w:W-16*S,h:150*S};L.pat={x:8*S,y:L.caller.y+L.caller.h+6*S,w:W-16*S,h:66*S};
   L.bingo={x:10*S,y:H-sf.b-84*S,w:W-20*S,h:76*S};L.pow={x:10*S,y:L.bingo.y-70*S,w:W-20*S,h:62*S};L.cards={x:8*S,y:L.pat.y+L.pat.h+8*S,w:W-16*S,h:L.pow.y-8*S-(L.pat.y+L.pat.h+8*S)}}
  else{const lw=Math.min(W*.44,420*S);L.top={x:0,y:0,w:W,h:sf.t+58*S};L.caller={x:sf.l+8*S,y:L.top.h+4*S,w:lw,h:Math.min(130*S,H*.31)};L.pat={x:sf.l+8*S,y:L.caller.y+L.caller.h+6*S,w:lw,h:60*S};
   L.pow={x:sf.l+8*S,y:L.pat.y+L.pat.h+8*S,w:lw,h:Math.min(56*S,H-sf.b-(L.pat.y+L.pat.h+8*S)-8*S)};L.cards={x:sf.l+lw+18*S,y:L.top.h+4*S,w:W-sf.l-sf.r-lw-26*S,h:H-L.top.h-sf.b-10*S};const by=L.pow.y+L.pow.h+8*S;L.bingo={x:sf.l+8*S,y:by,w:lw,h:Math.max(56*S,H-sf.b-by-8*S)}}
  return L},
 draw(){if(!G)return;const S=K.S,W=K.W,H=K.H,sf=K.safe,L=this.lay();hallBg(G.hall);
  // top bar
  g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,W,L.top.h);const ty=sf.t+(L.top.h-sf.t)/2;K.text(G.hall.n,sf.l+12*S,ty-13*S,24*S,'#fff',{al:'left',maxW:W-90*S});
  K.text('Game '+Math.min(G.game+1,5)+' of 5  ·  🪙 '+SV.coins,sf.l+12*S,ty+15*S,24*S,'#ffe08a',{al:'left',maxW:W-90*S});
  const pb=46*S;K.button({id:'pause',x:W-sf.r-pb-10*S,y:ty-pb/2,w:pb,h:pb,r:pb/2,label:'⏸',fs:20*S,color:'#e8590c',cb:()=>this.pause()});
  // caller: Mama + cage + ball + bubble
  const C=L.caller;g.save();K.rr(C.x,C.y,C.w,C.h,16*S);g.fillStyle='rgba(0,0,0,.28)';g.fill();g.restore();
  const mh=C.h*.96,mx=C.x+mh*.24;const mm=M.draw(mx,C.y+C.h-2*S,mh,{mode:G.over&&G.res&&G.res.win?'dance':G.ballAnim<.5?'crank':'call',talk:G.msgT>0&&G.t-G.curT<2});K.markChar(mm.x,mm.y,mm.w,mm.h,'mama');
  const cgx=C.x+mh*.62,cgy=C.y+C.h*.5,cr=Math.min(C.h*.3,C.w*.1);g.save();g.translate(cgx,cgy);g.rotate(G.t*(G.ballAnim<1?6:.6));g.strokeStyle='#ced4da';g.lineWidth=2*S;for(let i=0;i<6;i++){g.beginPath();g.ellipse(0,0,cr,cr*.35,i*Math.PI/6,0,TAU);g.stroke()}g.restore();
  for(let i=0;i<5;i++){const a=G.t*3+i*1.3;M.E(cgx+Math.cos(a)*cr*.5,cgy+Math.sin(a*1.3)*cr*.4,cr*.14,cr*.14,['#1c7ed6','#e03131','#adb5bd','#2f9e44','#f59f00'][i])}
  if(G.cur){const e=K.ease(G.ballAnim);const bx=K.lerp(cgx,cgx+cr*2.3,e),by=K.lerp(cgy,C.y+C.h*.5,e),br=Math.min(C.h*.36,52*S)*(.5+.5*e);ballArt(bx,by,br,G.cur,{gold:G.cur===G.golden})}
  const bx0=cgx+cr*2.3+Math.min(C.h*.36,52*S)+10*S,bw=C.x+C.w-bx0-8*S;if(bw>60*S){g.save();K.rr(bx0,C.y+10*S,bw,C.h-20*S,14*S);g.fillStyle='#fffaf0';g.fill();g.restore();
   const fs=(SV.big===2?28:24)*S;const txt=G.msgT>0?G.msg:'';K.textBox(txt,bx0+bw/2,C.y+C.h/2,bw-16*S,Math.max(Math.min(fs,(C.h-20*S)/3.4),20*S),'#222',{vc:true,stroke:false,w:700})}
  // pattern + recent
  const Pn=L.pat;g.save();K.rr(Pn.x,Pn.y,Pn.w,Pn.h,12*S);g.fillStyle='rgba(0,0,0,.35)';g.fill();g.restore();const ms=Pn.h-12*S,cs=ms/5;const mk=G.P.masks[(Math.floor(G.t/1.2))%G.P.masks.length];
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){g.fillStyle=(mk&bit(r,c))?'#ffd43b':'rgba(255,255,255,.25)';g.fillRect(Pn.x+8*S+c*cs,Pn.y+6*S+r*cs,cs-1.5*S,cs-1.5*S)}
  K.text(G.P.n,Pn.x+ms+20*S,Pn.y+Pn.h*.3,24*S,'#fff',{al:'left',maxW:Pn.w*.45});K.text('Prize 🪙 '+(G.P.prize*(G.dbl?2:1)*(1+G.hall.lvl*.1)|0),Pn.x+ms+20*S,Pn.y+Pn.h*.74,24*S,'#ffe08a',{al:'left',maxW:Pn.w*.45});
  const rec=G.called.slice(-4).reverse();const rr=Math.min(Pn.h*.4,22*S);rec.forEach((n,i)=>{if(i===0)return;ballArt(Pn.x+Pn.w-rr-6*S-(i-1)*(rr*2+6*S),Pn.y+Pn.h/2,rr,n)});
  if(G.peek>0){K.text('Next: '+G.deck.slice(G.di,G.di+G.peek).map(n=>letter(n)+n).join('  '),Pn.x+Pn.w-8*S,Pn.y-8*S,16*S,'#b2f2bb',{al:'right'})}
  // cards
  this.drawCards(L.cards);
  // nearest rival
  let best=99,who='';for(const p of G.cpus){const n=needOf(cpuMask(p.card,G.calledSet),G.P);if(n<best){best=n;who=p.name}}
  // power-ups
  const Pw=L.pow,n=POW.length,gap=8*S,pw=(Pw.w-gap*(n-1))/n;POW.forEach((p,i)=>{const c=SV.pow[p.k]||0;K.button({id:'pow-'+p.k,x:Pw.x+i*(pw+gap),y:Pw.y,w:pw,h:Pw.h,label:p.ic+' ×'+c,fs:Math.min(22*S,Pw.h*.42),color:c>0?'#5c3a21':'#6c6c6c',dis:c<=0||G.over,cb:()=>this.usePow(p.k)})});
  // BINGO
  const B=L.bingo,glow=G.claimable&&!G.over;K.button({id:'bingo',x:B.x,y:B.y,w:B.w,h:B.h,label:'BINGO!',fs:40*S,color:glow?(K.frame%30<15?'#f59f00':'#e8590c'):'#2b5f4a',primary:true,cb:()=>this.claim()});
  if(!G.over&&best<=2)K.text(who+' needs '+best+'!',B.x+B.w/2,B.y-8*S-(K.portrait?Pw.h+8*S:0)-12*S,17*S,'#ffc9c9');
  if(G.t<0)K.text('Eyes down…',W/2,H*.5,40*S,'#ffd43b');
  if(G.over&&G.res){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);K.text(G.res.win?'BINGO!':G.res.who+' wins this one',W/2,H*.45,G.res.win?64*S:30*S,G.res.win?'#ffd43b':'#fff',{maxW:W-30*S})}},
 drawCards(A){const S=K.S,n=G.cards.length;let cols=n===1?1:(K.portrait?(n===2?1:2):(n===2?2:2)),rowsN=Math.ceil(n/cols);const gap=8*S;
  const cw=(A.w-gap*(cols-1))/cols,ch=(A.h-gap*(rowsN-1))/rowsN;const big=SV.big===2?1.12:1;
  G.cards.forEach((cd,i)=>{const cx=A.x+(i%cols)*(cw+gap),cy=A.y+Math.floor(i/cols)*(ch+gap);const head=Math.min(40*S,ch*.13);let cell=Math.min(cw/5,(ch-head)/5);const ww=cell*5,ox=cx+(cw-ww)/2,oy=cy+(ch-head-cell*5)/2;
   g.save();K.rr(ox-4*S,oy-4*S,ww+8*S,head+cell*5+8*S,12*S);g.fillStyle='#1f4a3c';g.fill();g.restore();
   for(let c=0;c<5;c++)K.text(COLS[c],ox+c*cell+cell/2,oy+head/2,head*.8,'#fff',{stroke:false});
   const hasB=has(cd.m,G.P);const mk=G.P.masks.find(k=>(cd.m&k)===k);
   for(let r=0;r<5;r++)for(let c=0;c<5;c++){const x=ox+c*cell,y=oy+head+r*cell,num=cd.nums[r][c],on=!!(cd.m&bit(r,c));const called=num&&G.calledSet.has(num)&&!on;
    K.button({id:'c'+i+'-'+r+'-'+c,x:x+1.5*S,y:y+1.5*S,w:cell-3*S,h:cell-3*S,r:6*S,cb:()=>this.tapCell(cd,r,c),draw:(b,down)=>{g.fillStyle=mk&&(mk&bit(r,c))?'#fff3bf':'#fffaf0';K.rr(0,0,b.w,b.h,6*S);g.fill();
     if(called&&!SV.auto){g.lineWidth=3*S;g.strokeStyle=K.frame%40<20?'#f59f00':'#ffd43b';g.stroke()}
     if(num===0){K.text('❤️',b.w/2,b.h*.45,b.h*.42,'#fff',{stroke:false});K.text('FREE',b.w/2,b.h*.82,b.h*.17,'#c92a2a',{stroke:false})}
     else K.text(String(num),b.w/2,b.h/2+1,Math.min(b.h*.5*big,b.w*.48*big),'#1a1a1a',{stroke:false});
     if(on&&num!==0){const f=cd.flash[r*5+c]||0,a=Math.min(1,(K.t-f)*5);g.globalAlpha=.78;g.fillStyle=num===G.golden?'#fcc419':'#9c36b5';g.beginPath();g.arc(b.w/2,b.h/2,Math.min(b.w,b.h)*.42*(.6+.4*a),0,TAU);g.fill();g.globalAlpha=1;K.text(String(num),b.w/2,b.h/2+1,Math.min(b.h*.5*big,b.w*.48*big),'#fff',{stroke:false})}}})}
   if(hasB&&!G.over){g.save();g.strokeStyle='#ffd43b';g.lineWidth=5*S;K.rr(ox-4*S,oy-4*S,ww+8*S,head+cell*5+8*S,12*S);g.stroke();g.restore()}})},
 drawPause(){const S=K.S,W=K.W,H=K.H;g.fillStyle='rgba(0,0,0,.65)';g.fillRect(0,0,W,H);K.text('Paused',W/2,H*.2,44*S,'#fff');const bw=Math.min(W-60*S,340*S),bh=70*S,gap=14*S,x=(W-bw)/2;let y=Math.max(H*.28,(H-3*(bh+gap))/2);
  bigBtn({id:'resume',x,y,w:bw,h:bh,label:'▶ Keep playing',color:BC.green,primary:true,cb:()=>this.resume()});y+=bh+gap;
  bigBtn({id:'mute2',x,y,w:bw,h:bh,label:K.muted?'🔇 Sound off':'🔊 Sound on',color:BC.plum,cb:()=>K.toggleMute()});y+=bh+gap;
  bigBtn({id:'home',x,y,w:bw,h:bh,label:'🏠 Home',color:BC.blue,cb:()=>{this.paused=false;K.go(Title)}})},
 padBtn(n,p){if(!p)return n==='a';if(this.paused)return false;if(n==='a'){const b=K.lastBtns.find(z=>z.id===K.focusId&&!z.dis);if(b&&b.id!=='bingo'){K.fire(b)}else this.claim();return true}
  const m={x:'hoof',y:'dove',lb:'lamb',rb:'donkey'}[n];if(m){this.usePow(m);return true}},
 padDir(dx,dy,p){if(p&&!this.paused){K.moveFocus(dx,dy);return true}},
 key(k,d){if(d&&(k===' '||k==='Enter')&&!this.paused){const b=K.lastBtns.find(z=>z.id===K.focusId&&!z.dis);if(b&&b.id!=='bingo')K.fire(b);else this.claim();return true}if(d&&k.startsWith('Arrow')&&!this.paused){K.padUsed=true;K.moveFocus(k==='ArrowLeft'?-1:k==='ArrowRight'?1:0,k==='ArrowUp'?-1:k==='ArrowDown'?1:0);return true}},
 pause(){if(!G.over){this.paused=true;try{speechSynthesis.cancel()}catch(e){}}},resume(){this.paused=false},back(){if(this.paused)this.resume();else this.pause()}};
/* -------- BETWEEN GAMES / NIGHT RESULT */
const Between={enter(res){this.res=res;this.done=G.game>=5;if(this.done){const st=G.wins;SV.stars[G.hall.id]=Math.max(SV.stars[G.hall.id]||0,st);save()}K.music.play(SONG)},
 draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait,r=this.res;hallBg(G.hall);
  const floorY=P?H*.52:H-sf.b-14*S,mh=P?Math.min(H*.3,W*.55):Math.min(H*.6,W*.3);const m=M.draw(P?W/2:W*.22,floorY,mh,{mode:r.win?'dance':'idle',talk:1});K.markChar(m.x,m.y,m.w,m.h,'mama');
  if(r.win){const c=M.coo(P?W*.16:W*.07+mh*.1,floorY,mh*.34,{dir:1,ph:K.t*.9,moving:true});K.markChar(c.x,c.y,c.w,c.h,'coo')}
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,floorY,W,4*S);
  const cx=P?W/2:W*.64,tw=P?W-30*S:W*.6;K.text(r.win?(r.share?'Shared BINGO!':'BINGO! You won!'):r.who==='Nobody'?'No winner this time':r.who+' won this one',cx,sf.t+46*S,34*S,r.win?'#ffd43b':'#fff',{maxW:tw});
  K.text(r.win?'🪙 +'+r.prize+(r.pow?'   + '+POW.find(p=>p.k===r.pow).ic+' helper':''):'So close! Better luck next game, dearie.',cx,sf.t+94*S,22*S,'#fff',{maxW:tw});
  if(this.done)K.text('Bingo Night over: '+G.wins+' of 5 won  '+'⭐'.repeat(G.wins),cx,sf.t+132*S,20*S,'#ffe08a',{maxW:tw});
  const bw=Math.min(P?W-40*S:W*.5,380*S),bh=82*S,gap=14*S,x=cx-bw/2;let y=P?floorY+24*S:Math.max(sf.t+160*S,H-sf.b-bh*2-gap-20*S);
  if(!this.done)bigBtn({id:'next',x,y,w:bw,h:bh,label:'▶ NEXT GAME',color:BC.green,primary:true,fs:32*S,cb:()=>Between.next()});
  else bigBtn({id:'again',x,y,w:bw,h:bh,label:'▶ PLAY AGAIN',color:BC.green,primary:true,fs:32*S,cb:()=>K.go(Play)});
  y+=bh+gap;const hw=(bw-gap)/2;bigBtn({id:'home',x,y,w:hw,h:64*S,label:'🏠 Home',color:BC.blue,fs:24*S,cb:()=>K.go(Title)});bigBtn({id:'halls',x:x+hw+gap,y,w:hw,h:64*S,label:'🏛️ Levels',color:BC.plum,fs:24*S,cb:()=>K.go(Halls)})},back(){K.go(Title)}};
Play.cont=function(){/* continue the same Bingo Night: keep G (hall, game index, wins) */};
const _enter=Play.enter;Play.enter=function(){if(Play._cont){Play._cont=false;this.paused=false;this.newGame();return}_enter.call(this)};
Play.cont=function(){};
Between.next=function(){Play._cont=true;K.go(Play)};
/* -------- boot */
K.initPad({});
window.__T={get scene(){return K.scene===Title?'title':K.scene===Play?'play':K.scene===Between?'between':K.scene===Halls?'halls':K.scene===Opts?'opts':K.scene===Help?'help':'story'},get G(){return G},get SV(){return SV},Play,Title,Between,bot:false,botDelay:1,
 fast(){/* QA: call all balls quickly */SPEEDS.forEach(s=>s.s=.25)},reset(){SV=JSON.parse(JSON.stringify(DEF));save()}};
K.start(Title);
})();
