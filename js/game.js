/* game.js — Mama MacGregor's Bingo Hall 2: Bingo Night (easy mode: large text, one tap to play, card marks itself) */
(function(){
'use strict';
const g=K.g,TAU=Math.PI*2,M=MAMA;K.ns='mmbh2';
/* large print: UI text never below 24px (Helene rule) */
const _KT=K.text;K.text=function(s,x,y,sz,c,o){if(sz>=14*K.S&&sz<24*K.S&&!(o&&o.art))sz=24*K.S;if(!(o&&o.art)){let e=sz;if(o&&o.maxW){g.save();g.font=K.font(sz,o.w);const m=g.measureText(s).width;g.restore();if(m>o.maxW)e=sz*o.maxW/m}if(e/K.S<(K.minFont||99)){K.minFont=e/K.S;K.minFontTxt=String(s).slice(0,24)}}return _KT.call(this,s,x,y,sz,c,o)};
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
 K.text(String(n),x,y+r*.02,Math.max(24*K.S,r*.66),'#111',{stroke:false});g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(x-r*.4,y-r*.5,r*.25,r*.14,-.5,0,TAU);g.fill()}
/* -------- TITLE (easy mode for Mama's players: one huge PLAY, one LEVEL SELECT, tiny gear for sound) */
function gearBtn(){const S=K.S,sf=K.safe,s=64*S;K.button({id:'gear',x:K.W-sf.r-s-10*S,y:sf.t+10*S,w:s,h:s,r:s/2,label:'⚙️',fs:30*S,color:'#495057',cb:()=>K.go(Settings)})}
const Title={enter(){K.music.play(SONG)},
 draw(){const S=K.S,W=K.W,H=K.H,P=K.portrait,sf=K.safe;hallBg(HALLS.find(h=>h.id===SV.hall));let tb;
  if(P){tb={x:16*S,y:sf.t+84*S,w:W-32*S,h:Math.min(140*S,H*.16)};titleBanner(tb.x,tb.y,tb.w,tb.h);
   const bw=Math.min(W-32*S,400*S),bh=124*S,lh=88*S,gap=18*S;const btnTop=H-sf.b-26*S-(bh+gap+lh);
   const floorY=btnTop-22*S;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,floorY,W,4*S);
   const mh=Math.min(floorY-(tb.y+tb.h)-26*S,300*S);const m=M.draw(W/2,floorY,mh,{mode:'wave'});K.markChar(m.x,m.y,m.w,m.h,'mama');
   const c=M.coo(W*.17,floorY,mh*.36,{dir:1});K.markChar(c.x,c.y,c.w,c.h,'coo');const d=M.donkey(W*.84,floorY,mh*.36,{dir:-1});K.markChar(d.x,d.y,d.w,d.h,'donkey');
   bigBtn({id:'play',x:(W-bw)/2,y:btnTop,w:bw,h:bh,label:'▶ PLAY',color:BC.green,primary:true,fs:60*S,cb:startPlay});
   bigBtn({id:'halls',x:(W-bw)/2,y:btnTop+bh+gap,w:bw,h:lh,label:'LEVEL SELECT',color:BC.blue,fs:34*S,cb:()=>K.go(Halls)})}
  else{tb={x:sf.l+14*S,y:sf.t+10*S,w:W*.5-28*S,h:Math.min(110*S,H*.27)};titleBanner(tb.x,tb.y,tb.w,tb.h);const floorY=H-sf.b-14*S;
   const mh=Math.min(floorY-(tb.y+tb.h)-14*S,260*S);const m=M.draw(tb.x+tb.w*.5,floorY,mh,{mode:'wave'});K.markChar(m.x,m.y,m.w,m.h,'mama');
   const c=M.coo(tb.x+tb.w*.12,floorY,mh*.4,{dir:1});K.markChar(c.x,c.y,c.w,c.h,'coo');const d=M.donkey(tb.x+tb.w*.9,floorY,mh*.4,{dir:-1});K.markChar(d.x,d.y,d.w,d.h,'donkey');
   const bw=Math.min(W*.42,390*S),x=W*.55+(W*.45-bw)/2-sf.r/2,bh=Math.min(124*S,H*.3),lh=84*S,gap=18*S;const y=Math.max(sf.t+86*S,(H-(bh+gap+lh))/2+24*S);
   bigBtn({id:'play',x,y,w:bw,h:bh,label:'▶ PLAY',color:BC.green,primary:true,fs:58*S,cb:startPlay});
   bigBtn({id:'halls',x,y:y+bh+gap,w:bw,h:lh,label:'LEVEL SELECT',color:BC.blue,fs:34*S,cb:()=>K.go(Halls)})}
  gearBtn();const avoid=K.btns.concat(K.charRects,[tb]);for(const c of ['bl','br','tl'])if(K.drawLogo(c,64*S,avoid))break},
 back(){}};
function startPlay(){K.go(Play)}
/* -------- SETTINGS (sound only) */
const Settings={draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe;hallBg(HALLS[0]);const bw=Math.min(W-40*S,400*S),bh=110*S,gap=24*S,x=(W-bw)/2;let y=Math.max(sf.t+70*S,(H-(bh*2+gap))/2+10*S);
  K.text('Sound',W/2,y-34*S,40*S,'#fff');
  bigBtn({id:'sound',x,y,w:bw,h:bh,label:K.muted?'🔇 Sound is OFF':'🔊 Sound is ON',color:K.muted?BC.grey:BC.green,primary:true,fs:36*S,cb:()=>K.toggleMute()});y+=bh+gap;
  bigBtn({id:'back',x,y,w:bw,h:Math.min(bh,H-sf.b-y-10*S),label:'⬅ Back',color:BC.blue,fs:34*S,cb:()=>K.go(Title)})},back(){K.go(Title)}};
/* -------- LEVEL SELECT: one screen, pick a hall and 1 or 2 cards, then one big START. Every hall is open. */
const Halls={draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait;hallBg(HALLS.find(h=>h.id===SV.hall));
  K.button({id:'back',x:sf.l+10*S,y:sf.t+10*S,w:150*S,h:64*S,label:'⬅ Back',color:BC.grey,fs:30*S,cb:()=>K.go(Title)});K.text('Pick a Hall',W/2+(P?60:0)*S,sf.t+42*S,36*S,'#fff');
  const cols=P?1:3,gap=10*S,top=sf.t+86*S,rows=Math.ceil(HALLS.length/cols),foot=P?(72*S+100*S+3*gap+10*S):(80*S+gap*2),cw=(W-sf.l-sf.r-28*S-gap*(cols-1))/cols,ch=Math.min((H-top-sf.b-foot-gap*(rows-1))/rows,104*S);
  HALLS.forEach((h,i)=>{const x=sf.l+14*S+(i%cols)*(cw+gap),y=top+Math.floor(i/cols)*(ch+gap),sel=h.id===SV.hall;
   K.button({id:'hall-'+h.id,x,y,w:cw,h:ch,primary:sel,cb:()=>{SV.hall=h.id;save()},draw:(b)=>{g.save();K.rr(0,0,b.w,b.h,16*S);const gr=g.createLinearGradient(0,0,b.w,0);gr.addColorStop(0,h.bg[0]);gr.addColorStop(1,h.bg[1]);g.fillStyle=gr;g.fill();g.lineWidth=(sel?8:3)*S;g.strokeStyle=sel?'#ffd43b':'#fff';g.stroke();g.restore();
    K.text((sel?'✅ ':'')+h.n.replace(' Grand Hall',' Hall'),b.w/2,b.h/2,32*S,'#fff',{maxW:b.w-20*S})}})});
  const fy=top+rows*(ch+gap);const C=[1,2];
  if(P){const bw=(W-sf.l-sf.r-28*S-gap)/2;C.forEach((n,j)=>bigBtn({id:'cards-'+n,x:sf.l+14*S+j*(bw+gap),y:fy,w:bw,h:72*S,label:n+(n===1?' card':' cards'),color:SV.ncards===n?BC.green:'#868e96',fs:30*S,cb:()=>{SV.ncards=n;save()}}));
   const sw=Math.min(W-28*S,400*S),sy=fy+72*S+gap+4*S;bigBtn({id:'start',x:(W-sw)/2,y:sy,w:sw,h:Math.min(100*S,H-sf.b-sy-8*S),label:'▶ START',color:BC.green,primary:true,fs:44*S,cb:startPlay})}
  else{const half=(W-sf.l-sf.r-28*S-gap)/2,bw=(half-gap)/2;C.forEach((n,j)=>bigBtn({id:'cards-'+n,x:sf.l+14*S+j*(bw+gap),y:fy+4*S,w:bw,h:Math.min(80*S,H-sf.b-fy-10*S),label:n+(n===1?' card':' cards'),color:SV.ncards===n?BC.green:'#868e96',fs:30*S,cb:()=>{SV.ncards=n;save()}}));
   bigBtn({id:'start',x:sf.l+14*S+half+gap,y:fy+4*S,w:half,h:Math.min(80*S,H-sf.b-fy-10*S),label:'▶ START',color:BC.green,primary:true,fs:42*S,cb:startPlay})}},
 back(){K.go(Title)}};
/* -------- PLAY (easy mode: Mama marks the card, BINGO button glows, and it is claimed for you if you wait) */
function mkCard(){const nums=[[],[],[],[],[]];for(let c=0;c<5;c++){const pool=[];for(let k=1;k<=15;k++)pool.push(c*15+k);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}for(let r=0;r<5;r++)nums[r][c]=pool[r]}nums[2][2]=0;return{nums,m:bit(2,2),flash:{}}}
const has=(m,P)=>P.masks.some(k=>(m&k)===k);
const needOf=(m,P)=>Math.min(...P.masks.map(k=>{let x=k&~m,n=0;while(x){n+=x&1;x>>>=1}return n}));
function cpuMask(card,called){let m=bit(2,2);for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(called.has(card.nums[r][c]))m|=bit(r,c);return m}
const AUTO_CLAIM=5;/* seconds: if she doesn't tap BINGO, Mama shouts it for her */
let G=null;
const Play={play:true,
 enter(){const h=HALLS.find(x=>x.id===SV.hall)||HALLS[0];if(!(SV.ncards===1||SV.ncards===2)){SV.ncards=1;save()}G={hall:h,game:0,wins:0,coins:0};this.paused=false;K.music.halt();this.newGame()},
 newGame(){const h=G.hall;const pat=h.pats[G.game%h.pats.length];const deck=[];for(let i=1;i<=75;i++)deck.push(i);for(let i=74;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  const cpus=[];const names=NAMES.slice();for(let i=0;i<Math.min(4,h.cpus);i++){const nm=names.splice(Math.floor(Math.random()*names.length),1)[0];cpus.push({name:nm,card:mkCard(),react:3+Math.random()*3,at:null})}
  Object.assign(G,{pat,P:PATTERNS[pat],deck,di:0,called:[],calledAt:{},toldBingo:false,calledSet:new Set(),cur:null,curT:0,t:-2.4,next:0,cards:Array.from({length:SV.ncards},mkCard),cpus,over:false,res:null,msg:'Eyes down!',msgT:3,ballAnim:0,claimable:false,claimT:null});
  say('Eyes down! This game is '+PATTERNS[pat].n)},
 interval(){return SPEEDS[0].s},
 update(dt){if(!G||G.over)return;G.t+=dt;if(G.msgT>0)G.msgT-=dt;G.ballAnim=Math.min(1,G.ballAnim+dt*2.2);
  if(G.t>=G.next&&G.di<75){this.callBall();G.next=G.t+this.interval()}
  if(G.di>=75&&G.t>G.next+3&&!G.over){this.end(null);return}
  for(const cd of G.cards)for(let r=0;r<5;r++)for(let c=0;c<5;c++){const n=cd.nums[r][c];if(n&&G.calledSet.has(n)&&!(cd.m&bit(r,c))&&G.t-(G.calledAt[n]||0)>.7)this.daub(cd,r,c,true)}
  G.claimable=G.cards.some(cd=>has(cd.m,G.P));
  if(G.claimable){if(G.claimT==null)G.claimT=G.t;if(G.t-G.claimT>=AUTO_CLAIM){this.claim();return}}
  else for(const p of G.cpus){if(p.at==null&&has(cpuMask(p.card,G.calledSet),G.P))p.at=G.t+p.react;if(p.at!=null&&G.t>=p.at){this.end(p);return}}
  if(window.__T&&__T.bot&&G.claimable&&G.t-G.claimT>(__T.botDelay||1))this.claim()},
 callBall(){const n=G.deck[G.di++];G.cur=n;G.curT=G.t;G.called.push(n);G.calledSet.add(n);G.calledAt[n]=G.t;G.ballAnim=0;
  K.tone(880,.08,{type:'triangle',v:.1});K.tone(660,.12,{type:'triangle',v:.08,at:.08});if(!G.claimable){G.msg='';G.msgT=0}say(letter(n)+' '+n+'. '+PHRASES[n])},
 daub(cd,r,c,auto){if(cd.m&bit(r,c))return;cd.m|=bit(r,c);cd.flash[r*5+c]=K.t;K.sfx.pop();
  if(has(cd.m,G.P)&&!G.toldBingo){G.toldBingo=true;G.msg='You have BINGO!';G.msgT=99;K.sfx.good();say('You have bingo, dearie! Tap the big button!')}},
 tapCell(cd,r,c){if(G.over)return;const n=cd.nums[r][c];if(cd.m&bit(r,c))return;if(n&&G.calledSet.has(n))this.daub(cd,r,c)},
 claim(){if(G.over)return;if(G.claimable){this.end('me')}else{K.sfx.bad();G.msg='Not yet, dearie!';G.msgT=2}},
 end(winner){G.over=true;const prize=G.P.prize*(1+G.hall.lvl*.1)|0;let res;
  if(winner==='me'){res={win:true,prize,who:'You'};K.sfx.win();say('Bingo! Well done, dearie!');K.burst(K.W/2,K.H*.4,90,{sp:7})}
  else if(winner){res={win:false,prize:0,who:winner.name};K.sfx.bad();say(winner.name+' got there first. Next game, dearie.')}
  else res={win:false,prize:0,who:'Nobody'};
  if(res.win){G.wins++;SV.wins++;SV.coins+=res.prize;G.coins+=res.prize}
  SV.xp+=res.win?40:10;SV.games++;save();G.res=res;G.game++;
  setTimeout(()=>{if(K.scene===Play)K.go(Between,res)},res.win?2400:1800)},
 lay(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait;const L={};
  if(P){L.top={x:sf.l+8*S,y:sf.t+8*S,w:W-sf.l-sf.r-16*S,h:72*S};L.caller={x:8*S,y:L.top.y+L.top.h+8*S,w:W-16*S,h:150*S};
   L.bingo={x:10*S,y:H-sf.b-122*S,w:W-20*S,h:112*S};L.cards={x:8*S,y:L.caller.y+L.caller.h+10*S,w:W-16*S,h:L.bingo.y-12*S-(L.caller.y+L.caller.h+10*S)}}
  else{const lw=Math.min(W*.47,440*S);L.top={x:sf.l+8*S,y:sf.t+8*S,w:lw,h:72*S};L.caller={x:sf.l+8*S,y:L.top.y+L.top.h+8*S,w:lw,h:Math.min(150*S,H*.36)};
   const by=L.caller.y+L.caller.h+10*S;L.bingo={x:sf.l+8*S,y:by,w:lw,h:Math.max(72*S,H-sf.b-by-10*S)};L.cards={x:sf.l+lw+18*S,y:sf.t+6*S,w:W-sf.l-sf.r-lw-26*S,h:H-sf.t-sf.b-12*S}}
  return L},
 draw(){if(!G)return;const S=K.S,W=K.W,H=K.H,sf=K.safe,L=this.lay();hallBg(G.hall);
  // top row: the shape to make + pause
  const T=L.top,pb=64*S;g.save();K.rr(T.x,T.y,T.w-pb-10*S,T.h,14*S);g.fillStyle='rgba(0,0,0,.45)';g.fill();g.restore();
  const ms=T.h-14*S,cs=ms/5,mk=G.P.masks[(Math.floor(Math.max(0,G.t)/1.2))%G.P.masks.length];
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){g.fillStyle=(mk&bit(r,c))?'#ffd43b':'rgba(255,255,255,.28)';g.fillRect(T.x+8*S+c*cs,T.y+7*S+r*cs,cs-2*S,cs-2*S)}
  K.text(G.P.n,T.x+ms+18*S,T.y+T.h/2,30*S,'#fff',{al:'left',maxW:T.w-pb-ms-36*S});
  K.button({id:'pause',x:T.x+T.w-pb,y:T.y+(T.h-pb)/2,w:pb,h:pb,r:pb/2,label:'⏸',fs:30*S,color:'#e8590c',cb:()=>this.pause()});
  // caller: Mama + the big ball + what she says
  const C=L.caller;g.save();K.rr(C.x,C.y,C.w,C.h,16*S);g.fillStyle='rgba(0,0,0,.3)';g.fill();g.restore();
  const mh=C.h*.96,mx=C.x+mh*.26;const mm=M.draw(mx,C.y+C.h-2*S,mh,{mode:G.over&&G.res&&G.res.win?'dance':G.ballAnim<.5?'crank':'call',talk:G.t-G.curT<2});K.markChar(mm.x,mm.y,mm.w,mm.h,'mama');
  const br=Math.min(C.h*.4,62*S),bx=C.x+mh*.56+br,by=C.y+C.h/2;
  if(G.cur){const e=K.ease(G.ballAnim);ballArt(bx,by,br*(.6+.4*e),G.cur)}else{g.fillStyle='rgba(255,255,255,.15)';g.beginPath();g.arc(bx,by,br,0,TAU);g.fill()}
  const bx0=bx+br+10*S,bw=C.x+C.w-bx0-8*S;g.save();K.rr(bx0,C.y+10*S,bw,C.h-20*S,14*S);g.fillStyle='#fffaf0';g.fill();g.restore();
  if(G.msgT>0&&G.msg){let fs=32*S;while(fs>24*S&&K.wrap(G.msg,bw-14*S,fs,800).length*fs*1.25>C.h-26*S)fs-=1*S;K.textBox(G.msg,bx0+bw/2,C.y+C.h/2,bw-14*S,fs,'#222',{vc:true,stroke:false,w:800})}
  else if(G.cur)K.text(letter(G.cur)+' '+G.cur,bx0+bw/2,C.y+C.h/2,Math.min(64*S,C.h*.42),'#1a1a1a',{stroke:false,maxW:bw-16*S});
  else K.text('Ready…',bx0+bw/2,C.y+C.h/2,32*S,'#1a1a1a',{stroke:false,maxW:bw-16*S});
  this.drawCards(L.cards);
  // BINGO
  const B=L.bingo,glow=G.claimable&&!G.over;if(glow){g.save();g.shadowColor='#ffd43b';g.shadowBlur=(20+10*Math.sin(K.t*8))*S;K.rr(B.x,B.y,B.w,B.h,18*S);g.fillStyle='#ffd43b';g.fill();g.restore()}
  bigBtn({id:'bingo',x:B.x,y:B.y,w:B.w,h:B.h,label:glow?'BINGO! TAP!':'BINGO',fs:Math.min(54*S,B.h*.5),color:glow?(K.frame%30<15?'#f59f00':'#e8590c'):'#2b5f4a',primary:true,cb:()=>this.claim()});
  if(glow){const f=Math.min(1,(G.t-G.claimT)/AUTO_CLAIM);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(B.x+14*S,B.y+B.h-14*S,(B.w-28*S)*f,6*S)}
  if(G.t<0)K.text('Eyes down…',L.cards.x+L.cards.w/2,L.cards.y+L.cards.h/2,48*S,'#ffd43b');
  if(G.over&&G.res){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,W,H);if(G.res.win){const s=1+Math.sin(K.t*8)*.05;K.text('BINGO!',W/2,H*.42,96*S*s,'#ffd43b',{stroke:'#7a1020',maxW:W-30*S});K.text('You won!',W/2,H*.42+80*S,48*S,'#fff')}
   else K.text(G.res.who==='Nobody'?'No winner this time':G.res.who+' won this one',W/2,H*.45,40*S,'#fff',{maxW:W-30*S})}},
 drawCards(A){const S=K.S,n=G.cards.length;const cols=n===1?1:(K.portrait?1:2),rowsN=Math.ceil(n/cols);const gap=10*S;
  const cw=(A.w-gap*(cols-1))/cols,ch=(A.h-gap*(rowsN-1))/rowsN;
  G.cards.forEach((cd,i)=>{const cx=A.x+(i%cols)*(cw+gap),cy=A.y+Math.floor(i/cols)*(ch+gap);const head=Math.min(40*S,ch*.13);let cell=Math.min(cw/5,(ch-head)/5);const ww=cell*5,ox=cx+(cw-ww)/2,oy=cy+(ch-head-cell*5)/2;
   g.save();K.rr(ox-4*S,oy-4*S,ww+8*S,head+cell*5+8*S,12*S);g.fillStyle='#1f4a3c';g.fill();g.restore();
   for(let c=0;c<5;c++)K.text(COLS[c],ox+c*cell+cell/2,oy+head/2,Math.max(24*S,head*.8),'#fff',{stroke:false});
   const hasB=has(cd.m,G.P);const mk=G.P.masks.find(k=>(cd.m&k)===k);
   for(let r=0;r<5;r++)for(let c=0;c<5;c++){const x=ox+c*cell,y=oy+head+r*cell,num=cd.nums[r][c],on=!!(cd.m&bit(r,c));
    K.button({id:'c'+i+'-'+r+'-'+c,x:x+1.5*S,y:y+1.5*S,w:cell-3*S,h:cell-3*S,r:6*S,cb:()=>this.tapCell(cd,r,c),draw:(b)=>{g.fillStyle=mk&&(mk&bit(r,c))?'#fff3bf':'#fffaf0';K.rr(0,0,b.w,b.h,6*S);g.fill();
     if(num===0)K.text('★',b.w/2,b.h/2,Math.max(24*S,b.h*.6),'#c92a2a',{stroke:false,maxW:b.w-6*S});
     else K.text(String(num),b.w/2,b.h/2+1,Math.max(24*S,Math.min(b.h*.52,b.w*.5)),'#1a1a1a',{stroke:false});
     if(on&&num!==0){const f=cd.flash[r*5+c]||0,a=Math.min(1,(K.t-f)*5);g.globalAlpha=.78;g.fillStyle='#9c36b5';g.beginPath();g.arc(b.w/2,b.h/2,Math.min(b.w,b.h)*.44*(.6+.4*a),0,TAU);g.fill();g.globalAlpha=1;K.text(String(num),b.w/2,b.h/2+1,Math.max(24*S,Math.min(b.h*.52,b.w*.5)),'#fff',{stroke:false})}}})}
   if(hasB&&!G.over){g.save();g.strokeStyle='#ffd43b';g.lineWidth=6*S;K.rr(ox-4*S,oy-4*S,ww+8*S,head+cell*5+8*S,12*S);g.stroke();g.restore()}})},
 drawPause(){const S=K.S,W=K.W,H=K.H;g.fillStyle='rgba(0,0,0,.7)';g.fillRect(0,0,W,H);const bw=Math.min(W-60*S,380*S),bh=100*S,gap=20*S,x=(W-bw)/2;let y=Math.max(K.safe.t+90*S,(H-(2*bh+gap))/2+30*S);
  K.text('Paused',W/2,y-46*S,48*S,'#fff');
  bigBtn({id:'resume',x,y,w:bw,h:bh,label:'▶ Keep playing',color:BC.green,primary:true,fs:36*S,cb:()=>this.resume()});y+=bh+gap;
  bigBtn({id:'home',x,y,w:bw,h:bh,label:'🏠 Home',color:BC.blue,fs:36*S,cb:()=>{this.paused=false;K.go(Title)}})},
 padBtn(n,p){if(!p)return n==='a';if(this.paused)return false;if(n==='a'){const b=K.lastBtns.find(z=>z.id===K.focusId&&!z.dis);if(b&&b.id!=='bingo'){K.fire(b)}else this.claim();return true}
  if(n==='x'||n==='y'){this.claim();return true}},
 padDir(dx,dy,p){if(p&&!this.paused){K.moveFocus(dx,dy);return true}},
 key(k,d){if(d&&(k===' '||k==='Enter')&&!this.paused){const b=K.lastBtns.find(z=>z.id===K.focusId&&!z.dis);if(b&&b.id!=='bingo'&&K.padUsed)K.fire(b);else this.claim();return true}if(d&&k.startsWith('Arrow')&&!this.paused){K.padUsed=true;K.moveFocus(k==='ArrowLeft'?-1:k==='ArrowRight'?1:0,k==='ArrowUp'?-1:k==='ArrowDown'?1:0);return true}},
 pause(){if(!G.over){this.paused=true;try{speechSynthesis.cancel()}catch(e){}}},resume(){this.paused=false},back(){if(this.paused)this.resume();else this.pause()}};
/* -------- BETWEEN GAMES: one big PLAY AGAIN (the next game also starts by itself) */
const NEXT_AUTO=8;
const Between={enter(res){this.res=res;this.t=0;K.music.play(SONG)},
 update(dt){this.t+=dt;if(this.t>=NEXT_AUTO)Between.next()},
 draw(){const S=K.S,W=K.W,H=K.H,sf=K.safe,P=K.portrait,r=this.res;hallBg(G.hall);
  const floorY=P?H*.5:H-sf.b-14*S,mh=P?Math.min(H*.26,W*.5):Math.min(H*.6,W*.3);const m=M.draw(P?W/2:W*.2,floorY,mh,{mode:r.win?'dance':'idle',talk:1});K.markChar(m.x,m.y,m.w,m.h,'mama');
  if(r.win){const c=M.coo(P?W*.16:W*.06+mh*.1,floorY,mh*.34,{dir:1,ph:K.t*.9,moving:true});K.markChar(c.x,c.y,c.w,c.h,'coo')}
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,floorY,W,4*S);
  const cx=P?W/2:W*.64,tw=P?W-30*S:W*.6;
  K.text(r.win?'BINGO! You won!':r.who==='Nobody'?'No winner':r.who+' won',cx,sf.t+(P?60:44)*S,44*S,r.win?'#ffd43b':'#fff',{maxW:tw});
  K.text(r.win?'Well done, dearie!':'Next game soon, dearie!',cx,sf.t+(P?118:96)*S,32*S,'#fff',{maxW:tw});
  const bw=Math.min(P?W-32*S:W*.52,400*S),bh=P?120*S:110*S,gap=18*S,x=cx-bw/2;let y=P?floorY+30*S:Math.max(sf.t+136*S,H-sf.b-bh-gap-76*S-14*S);
  bigBtn({id:'again',x,y,w:bw,h:bh,label:'▶ PLAY AGAIN',color:BC.green,primary:true,fs:44*S,cb:()=>Between.next()});
  const f=Math.min(1,this.t/NEXT_AUTO);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x+16*S,y+bh-16*S,(bw-32*S)*f,6*S);
  y+=bh+gap;bigBtn({id:'home',x,y,w:bw,h:76*S,label:'🏠 Home',color:BC.blue,fs:32*S,cb:()=>K.go(Title)})},back(){K.go(Title)}};
const _enter=Play.enter;Play.enter=function(){if(Play._cont){Play._cont=false;this.paused=false;this.newGame();return}_enter.call(this)};
Between.next=function(){Play._cont=true;K.go(Play)};
/* -------- boot */
K.initPad({});
window.__T={get scene(){return K.scene===Title?'title':K.scene===Play?'play':K.scene===Between?'between':K.scene===Halls?'halls':K.scene===Settings?'settings':'other'},get G(){return G},get SV(){return SV},Play,Between,
 fast(){/* QA: call all balls quickly */SPEEDS.forEach(s=>s.s=.25)},reset(){SV=JSON.parse(JSON.stringify(DEF));save()}};
K.start(Title);
})();
