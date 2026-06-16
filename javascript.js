
/* ── PARTICLES ── */
(()=>{
  const cv=document.getElementById('bgc'),ctx=cv.getContext('2d');
  let W,H,pts=[],mx=-9e4,my=-9e4;
  const N=110,PAL=['rgba(0,207,255,','rgba(0,112,255,','rgba(168,85,247,','rgba(255,26,60,','rgba(0,180,240,'];
  const rnd=n=>Math.random()*n,rndC=()=>PAL[0|rnd(PAL.length)];
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight}
  function mk(){return{x:rnd(W),y:rnd(H),vx:(rnd(1)-.5)*.6,vy:(rnd(1)-.5)*.6,r:rnd(1.8)+.4,c:rndC(),a:rnd(.45)+.15}}
  function init(){pts=Array.from({length:N},mk)}
  function frame(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
      if(d<140){const f=(140-d)/140*.024;p.vx+=dx/d*f;p.vy+=dy/d*f}
      p.vx*=.993;p.vy*=.993;
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;
      if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);
      ctx.fillStyle=p.c+p.a+')';ctx.fill();
    });
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.hypot(dx,dy);
      if(d<90){
        ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(0,207,255,${(1-d/90)*.08})`;ctx.lineWidth=.5;ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize',resize);
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  addEventListener('touchmove',e=>{if(e.touches[0]){mx=e.touches[0].clientX;my=e.touches[0].clientY}},{passive:true});
  resize();init();frame();
})();

/* ── NAV ── */
const burger=document.getElementById('burger'),navul=document.getElementById('navul');
burger.addEventListener('click',()=>navul.classList.toggle('open'));
document.querySelectorAll('.nav-ul a').forEach(a=>a.addEventListener('click',()=>navul.classList.remove('open')));

/* ── SCROLL REVEAL ── */
const ro=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('on')),{threshold:.1});
document.querySelectorAll('.rev').forEach(el=>ro.observe(el));

/* ── PROGRESS BARS ── */
const po=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const b=e.target.querySelector('.pfill');
  if(b&&!b._d){b._d=1;setTimeout(()=>b.style.width=b.dataset.p+'%',400)}
}),{threshold:.25});
document.querySelectorAll('.gcard').forEach(c=>po.observe(c));

/* ── SNAKE GAME ── */
const CV=document.getElementById('sc'),CTX=CV.getContext('2d');
const G=21; // grid cells
let snake,dir,ndir,food,score,hi,running=false,started=false,loop=null,ft=0;

function getHi(){try{return parseInt(localStorage.getItem('xmy_snake_hi_v3'))||0}catch{return 0}}
function setHi(v){try{localStorage.setItem('xmy_snake_hi_v3',v)}catch{}}
hi=getHi();
document.getElementById('sc-hi').textContent=hi;

const cell=()=>CV.clientWidth/G;
const ri=()=>0|(Math.random()*G);

function placeFood(){
  let f;do{f={x:ri(),y:ri()}}while(snake.some(s=>s.x===f.x&&s.y===f.y));
  food=f;
}

function baseSpeed(){return Math.max(68,145-score*3)}

function setLvlBadge(){
  const el=document.getElementById('lvl-badge');
  const sp=baseSpeed();
  let txt='Oddiy',col='var(--green)';
  if(sp<=100){txt='O\'rta';col='#ffaa00'}
  if(sp<=85){txt='Tez';col='var(--red)'}
  if(sp<=72){txt='Ekstremal 🔥';col='var(--red)'}
  el.style.color=col;el.style.borderColor=col+'55';el.style.background=col+'18';
  el.innerHTML=`<i class="fa-solid fa-gauge-high fa-xs"></i> Daraja: ${txt}`;
}

function init(){
  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir={x:1,y:0};ndir={x:1,y:0};score=0;ft=0;
  document.getElementById('sc-score').textContent=0;
  document.getElementById('sc-msg').textContent='Davom etmoqda... 🐍';
  setLvlBadge();
  placeFood();
}

function draw(){
  const c=cell();
  CTX.clearRect(0,0,CV.width,CV.height);

  // grid
  CTX.strokeStyle='rgba(0,207,255,.035)';CTX.lineWidth=.5;
  for(let i=0;i<=G;i++){
    CTX.beginPath();CTX.moveTo(i*c,0);CTX.lineTo(i*c,G*c);CTX.stroke();
    CTX.beginPath();CTX.moveTo(0,i*c);CTX.lineTo(G*c,i*c);CTX.stroke();
  }

  // food — blinking red glow
  ft=(ft+1)%32;
  const fx=food.x*c+c/2,fy=food.y*c+c/2,fr=c*.37;
  const fa=ft<16 ? .95 : .5;
  const rg=CTX.createRadialGradient(fx,fy,0,fx,fy,fr*2.4);
  rg.addColorStop(0,`rgba(255,90,100,${fa})`);
  rg.addColorStop(.5,`rgba(255,26,60,${fa*.7})`);
  rg.addColorStop(1,'rgba(255,26,60,0)');
  CTX.beginPath();CTX.arc(fx,fy,fr*2.4,0,6.28);CTX.fillStyle=rg;CTX.fill();
  CTX.beginPath();CTX.arc(fx,fy,fr,0,6.28);
  CTX.fillStyle='#ff1a3c';CTX.shadowColor='#ff1a3c';CTX.shadowBlur=ft<16?26:8;CTX.fill();
  CTX.shadowBlur=0;
  // apple stem
  CTX.strokeStyle='rgba(255,180,80,.7)';CTX.lineWidth=1.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(fx,fy-fr*.8);CTX.lineTo(fx+fr*.4,fy-fr*1.4);CTX.stroke();

  // snake
  snake.forEach((s,i)=>{
    const x=s.x*c+2,y=s.y*c+2,sz=c-4;
    const head=i===0;
    const r=head?sz*.42:sz*.28;
    const alpha=Math.max(.28,1-i*.045);
    CTX.beginPath();CTX.roundRect(x,y,sz,sz,r);
    CTX.fillStyle=head?'#00d4ff':'#005de8';
    CTX.globalAlpha=alpha;
    if(head){CTX.shadowColor='#00cfff';CTX.shadowBlur=18}
    CTX.fill();
    CTX.shadowBlur=0;CTX.globalAlpha=1;
    // head detail
    if(head){
      const ex=x+sz/2+dir.x*sz*.2+(dir.y!==0?sz*.18:0);
      const ey=y+sz/2+dir.y*sz*.2+(dir.x!==0?-sz*.18:0);
      CTX.beginPath();CTX.arc(ex,ey,sz*.11,0,6.28);CTX.fillStyle='#fff';CTX.fill();
      CTX.beginPath();CTX.arc(ex+dir.x*sz*.05,ey+dir.y*sz*.05,sz*.05,0,6.28);CTX.fillStyle='#020917';CTX.fill();
      // shine
      CTX.beginPath();CTX.arc(ex-sz*.04,ey-sz*.04,sz*.028,0,6.28);CTX.fillStyle='rgba(255,255,255,.6)';CTX.fill();
    }
    // body shine segment
    if(!head&&i<snake.length*.5){
      const bx=x+sz*.22,by=y+sz*.18;
      CTX.beginPath();CTX.arc(bx,by,sz*.12,0,6.28);
      CTX.fillStyle='rgba(0,180,255,.18)';CTX.fill();
    }
  });
}

function overlay(title,sub){
  CTX.fillStyle='rgba(1,4,18,.85)';CTX.fillRect(0,0,CV.width,CV.height);
  const c=cell();
  CTX.textAlign='center';
  CTX.shadowColor='#00cfff';CTX.shadowBlur=30;
  CTX.fillStyle='#00cfff';
  CTX.font=`bold ${Math.round(c*1.15)}px Poppins,sans-serif`;
  CTX.fillText(title,CV.width/2,CV.height/2-c*.8);
  CTX.shadowBlur=0;
  if(sub){
    CTX.fillStyle='rgba(255,255,255,.5)';
    CTX.font=`${Math.round(c*.62)}px Poppins,sans-serif`;
    CTX.fillText(sub,CV.width/2,CV.height/2+c*.65);
  }
  CTX.textAlign='left';
}

function step(){
  dir={...ndir};
  const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
  if(h.x<0||h.x>=G||h.y<0||h.y>=G||snake.some(s=>s.x===h.x&&s.y===h.y)){
    return gameOver();
  }
  snake.unshift(h);
  if(h.x===food.x&&h.y===food.y){
    score++;
    document.getElementById('sc-score').textContent=score;
    if(score>hi){hi=score;setHi(hi);document.getElementById('sc-hi').textContent=hi}
    setLvlBadge();
    placeFood();
    clearInterval(loop);loop=setInterval(step,baseSpeed());
  } else snake.pop();
  draw();
}

function gameOver(){
  clearInterval(loop);running=false;
  document.getElementById('sc-msg').textContent="O'yin tugadi! 💀";
  draw();
  overlay("O'YIN TUGADI",`Hisob: ${score}  ·  Rekord: ${hi}`);
  document.getElementById('sbtn-restart').style.display='inline-flex';
}

function snakeStart(){
  if(running)return;
  init();running=true;started=true;
  document.getElementById('sbtn-start').style.display='none';
  document.getElementById('sbtn-restart').style.display='inline-flex';
  document.getElementById('dpad').style.display='flex';
  loop=setInterval(step,baseSpeed());
}

function snakeRestart(){
  clearInterval(loop);running=false;
  init();running=true;
  loop=setInterval(step,baseSpeed());
}

// keys
const KM={
  ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
  w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0},
  W:{x:0,y:-1},S:{x:0,y:1},A:{x:-1,y:0},D:{x:1,y:0}
};
document.addEventListener('keydown',e=>{
  const nd=KM[e.key];if(!nd)return;
  if(e.key.startsWith('Arrow'))e.preventDefault();
  if(nd.x===-dir.x&&nd.y===-dir.y)return;
  ndir=nd;if(!started)snakeStart();
});

// touch swipe
let tx=0,ty=0;
document.getElementById('sc').addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
document.getElementById('sc').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.max(Math.abs(dx),Math.abs(dy))<15)return;
  let nd;
  if(Math.abs(dx)>Math.abs(dy))nd=dx>0?{x:1,y:0}:{x:-1,y:0};
  else nd=dy>0?{x:0,y:1}:{x:0,y:-1};
  if(nd.x===-dir.x&&nd.y===-dir.y)return;
  ndir=nd;if(!started)snakeStart();
},{passive:true});

function mDir(d){
  const M={U:{x:0,y:-1},D:{x:0,y:1},L:{x:-1,y:0},R:{x:1,y:0}};
  const nd=M[d];
  if(nd.x===-dir.x&&nd.y===-dir.y)return;
  ndir=nd;if(!started)snakeStart();
}

// idle screen
window.addEventListener('load',()=>{
  hi=getHi();document.getElementById('sc-hi').textContent=hi;
  dir={x:1,y:0};ndir={x:1,y:0};food={x:10,y:10};snake=[{x:5,y:10}];
  draw();
  overlay("SNAKE 🐍",'O\'yinni Boshlash tugmasini bosing');
});