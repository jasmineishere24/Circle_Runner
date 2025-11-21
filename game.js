// --- Screen Management ---
const homeScreen = document.getElementById('homeScreen');
const shopScreen = document.getElementById('shopScreen');
const gameScreen = document.getElementById('gameScreen');

document.getElementById('playBtn').onclick = () => { showScreen(gameScreen); startGame(); };
document.getElementById('shopBtn').onclick = () => showScreen(shopScreen);
document.getElementById('backShop').onclick = () => showScreen(homeScreen);
document.getElementById('backHome').onclick = () => { showScreen(homeScreen); resetGame(); };

function showScreen(screen){
  [homeScreen, shopScreen, gameScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// --- Canvas & Player ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: 50, y: 200, r: 15, speed: 4 };
let keys = {};
let touchY = null;

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; });
canvas.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const deltaY = touch.clientY - touchY;
  player.y += deltaY * 0.5;
  touchY = touch.clientY;
});

// --- Levels (12 levels example) ---
const levels = [
  [{x:150,y:0,w:20,h:150,dx:0,dy:2},{x:300,y:250,w:20,h:150,dx:0,dy:2}],
  [{x:100,y:50,w:150,h:20,dx:3,dy:0},{x:300,y:0,w:20,h:200,dx:0,dy:2}],
  [{x:150,y:0,w:20,h:150,dx:0,dy:3},{x:300,y:250,w:20,h:150,dx:0,dy:2},{x:450,y:100,w:20,h:150,dx:0,dy:2}],
  [{x:100,y:50,w:150,h:20,dx:3,dy:0},{x:250,y:200,w:20,h:150,dx:0,dy:2},{x:400,y:50,w:20,h:150,dx:0,dy:3}],
  [{x:120,y:0,w:20,h:200,dx:0,dy:3},{x:250,y:250,w:150,h:20,dx:2,dy:0}],
  [{x:200,y:0,w:20,h:150,dx:0,dy:2},{x:350,y:250,w:20,h:150,dx:0,dy:3}],
  [{x:100,y:50,w:150,h:20,dx:3,dy:0},{x:300,y:100,w:20,h:200,dx:0,dy:2}],
  [{x:150,y:0,w:20,h:150,dx:0,dy:3},{x:300,y:250,w:20,h:150,dx:0,dy:2},{x:450,y:100,w:20,h:150,dx:0,dy:2}],
  [{x:100,y:50,w:150,h:20,dx:3,dy:0},{x:250,y:200,w:20,h:150,dx:0,dy:2}],
  [{x:120,y:0,w:20,h:200,dx:0,dy:3},{x:250,y:250,w:150,h:20,dx:2,dy:0}],
  [{x:200,y:0,w:20,h:150,dx:0,dy:2},{x:350,y:250,w:20,h:150,dx:0,dy:3}],
  [{x:100,y:50,w:150,h:20,dx:3,dy:0},{x:300,y:100,w:20,h:200,dx:0,dy:2}]
];

let currentLevel = 0;
let obstacles = [];

// --- Themes ---
const themes = {
  theme1: { bg:'#a0d8f1', player:'#ff3b3b', obstacles:'#2b2b2b' },
  theme2: { bg:'#b6f2a0', player:'#ff3b3b', obstacles:'#2b2b2b' },
  theme3: { bg:'#000', player:'#fff', obstacles:'#fff' }
};

let currentTheme = themes.theme1;

// --- Shop click ---
document.querySelectorAll('.themeOption').forEach(btn=>{
  btn.onclick = () => currentTheme = themes[btn.dataset.theme];
});

// --- Game Logic ---
function resetLevel(){
  player.x=50; player.y=200;
  obstacles = JSON.parse(JSON.stringify(levels[currentLevel]));
}

function resetGame(){
  currentLevel=0;
  resetLevel();
}

function startGame(){
  resetLevel();
  loop();
}

function update(){
  if(keys['ArrowUp']||keys['w']) player.y -= player.speed;
  if(keys['ArrowDown']||keys['s']) player.y += player.speed;
  if(keys['ArrowLeft']||keys['a']) player.x -= player.speed;
  if(keys['ArrowRight']||keys['d']) player.x += player.speed;
  player.y = Math.max(player.r, Math.min(canvas.height-player.r, player.y));
  player.x = Math.max(player.r, Math.min(canvas.width-player.r, player.x));

  obstacles.forEach(obs=>{
    obs.x += obs.dx;
    obs.y += obs.dy;
    if(obs.dx!==0&&(obs.x<0||obs.x+obs.w>canvas.width)) obs.dx*=-1;
    if(obs.dy!==0&&(obs.y<0||obs.y+obs.h>canvas.height)) obs.dy*=-1;
  });

  // collision
  for(let obs of obstacles){
    const closestX = Math.max(obs.x, Math.min(player.x, obs.x+obs.w));
    const closestY = Math.max(obs.y, Math.min(player.y, obs.y+obs.h));
    const distX = player.x - closestX;
    const distY = player.y - closestY;
    if(Math.sqrt(distX*distX + distY*distY)<player.r){ resetLevel(); }
  }

  if(player.x + player.r >= canvas.width){
    currentLevel++;
    if(currentLevel >= levels.length) currentLevel=0;
    resetLevel();
  }
}

function draw(){
  ctx.fillStyle = currentTheme.bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = currentTheme.player;
  ctx.beginPath();
  ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = currentTheme.obstacles;
  obstacles.forEach(obs=>ctx.fillRect(obs.x,obs.y,obs.w,obs.h));
}

function loop(){
  if(!gameScreen.classList.contains('hidden')){
    update();
    draw();
    requestAnimationFrame(loop);
  }
}
