// --- Screens ---
const homeScreen = document.getElementById('homeScreen');
const levelScreen = document.getElementById('levelScreen');
const shopScreen = document.getElementById('shopScreen');
const settingsScreen = document.getElementById('settingsScreen');
const gameScreen = document.getElementById('gameScreen');

const pointsDisplay = document.getElementById('pointsDisplay');
const gamePointsDisplay = document.getElementById('gamePoints');

document.getElementById('playBtn').onclick = () => showScreen(levelScreen);
document.getElementById('shopBtn').onclick = () => showScreen(shopScreen);
document.getElementById('settingsBtn').onclick = () => showScreen(settingsScreen);
document.getElementById('backHomeFromLevel').onclick = () => showScreen(homeScreen);
document.getElementById('backShop').onclick = () => showScreen(homeScreen);
document.getElementById('backSettings').onclick = () => showScreen(homeScreen);
document.getElementById('backHomeFromGame').onclick = () => { showScreen(homeScreen); resetGame(); };

function showScreen(screen){
  [homeScreen, levelScreen, shopScreen, settingsScreen, gameScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// --- Game Variables ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x:50, y:200, r:15, speed:4 };
let keys = {};
let touchActive = false;

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('touchstart', e => { touchActive = true; movePlayerTouch(e); e.preventDefault(); });
canvas.addEventListener('touchmove', movePlayerTouch);
canvas.addEventListener('touchend', e => { touchActive = false; });

function movePlayerTouch(e){
  if(!touchActive) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  player.x = touch.clientX - rect.left;
  player.y = touch.clientY - rect.top;
}

// --- Levels ---
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

// --- Points / Currency ---
let points = parseInt(localStorage.getItem('points')) || 0;
let unlockedLevels = JSON.parse(localStorage.getItem('unlockedLevels')) || [1];
let purchasedThemes = JSON.parse(localStorage.getItem('purchasedThemes')) || ['theme1'];

// --- Themes ---
const themes = {
  theme1: { name:'Light Blue & Black', cost:0, bg:'#a0d8f1', player:'#ff3b3b', obstacles:'#2b2b2b' },
  theme2: { name:'Light Green & Black', cost:50, bg:'#b6f2a0', player:'#ff3b3b', obstacles:'#2b2b2b' },
  theme3: { name:'Black & White', cost:100, bg:'#000', player:'#fff', obstacles:'#fff' }
};

let currentTheme = themes[purchasedThemes[0]];

// --- Level Buttons ---
const levelButtonsDiv = document.getElementById('levelButtons');
function createLevelButtons(){
  levelButtonsDiv.innerHTML='';
  for(let i=0;i<levels.length;i++){
    const btn = document.createElement('button');
    btn.textContent = `Level ${i+1}`;
    if(!unlockedLevels.includes(i+1)) btn.disabled=true;
    btn.onclick = () => { currentLevel=i; showScreen(gameScreen); startGame(); };
    levelButtonsDiv.appendChild(btn);
  }
}
createLevelButtons();

// --- Shop Buttons ---
const shopThemesDiv = document.getElementById('shopThemes');
function createShop(){
  shopThemesDiv.innerHTML='';
  for(let key in themes){
    const theme = themes[key];
    const btn = document.createElement('div');
    btn.classList.add('themeOption');
    btn.textContent = `${theme.name} (${theme.cost} pts)`;
    if(purchasedThemes.includes(key)) btn.textContent += ' ✅';
    btn.onclick = () => buyTheme(key);
    shopThemesDiv.appendChild(btn);
  }
}
createShop();

function buyTheme(key){
  const theme = themes[key];
  if(purchasedThemes.includes(key)){ currentTheme = theme; return; }
  if(points >= theme.cost){
    points -= theme.cost;
    purchasedThemes.push(key);
    currentTheme = theme;
    updatePoints();
    saveData();
    createShop();
  } else { alert('Not enough points!'); }
}

// --- Settings Buttons ---
const settingsThemesDiv = document.getElementById('settingsThemes');
function createSettings(){
  settingsThemesDiv.innerHTML='';
  for(let key of purchasedThemes){
    const theme = themes[key];
    const btn = document.createElement('div');
    btn.classList.add('themeOption');
    btn.textContent = theme.name;
    btn.onclick = () => { currentTheme=theme; saveData(); };
    settingsThemesDiv.appendChild(btn);
  }
}
createSettings();

// --- Save Data ---
function saveData(){
  localStorage.setItem('points', points);
  localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  localStorage.setItem('purchasedThemes', JSON.stringify(purchasedThemes));
  pointsDisplay.textContent = `Points: ${points}`;
}

// --- Game Functions ---
function resetLevel(){
  player.x=50; player.y=200;
  obstacles = JSON.parse(JSON.stringify(levels[currentLevel]));
}

function resetGame(){
  resetLevel();
  createLevelButtons();
}

function startGame(){
  resetLevel();
  gamePointsDisplay.textContent = `Points Earned: 0`;
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

  // level complete
  if(player.x+player.r >= canvas.width){
    const earnedPoints = 10; // flat 10 pts per level
    points += earnedPoints;
    gamePointsDisplay.textContent = `Points Earned: ${earnedPoints}`;
    if(!unlockedLevels.includes(currentLevel+2)) unlockedLevels.push(currentLevel+2);
    saveData();
    createLevelButtons();
    createSettings();
    resetLevel();
    showScreen(levelScreen);
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

// --- Initialize Points Display ---
pointsDisplay.textContent = `Points: ${points}`;
