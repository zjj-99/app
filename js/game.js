// 游戏主要变量
let gameStarted = false;
let gameOver = false;
let score = 0;
let player;
let gameLoop;
let enemies = [];
let bullets = [];
let lastEnemySpawn = 0;
let enemySpawnInterval = 1500; // 初始敌机生成间隔（毫秒）
let difficultyInterval = 10000; // 提高难度的间隔（毫秒）
let lastDifficultyIncrease = 0;

// 获取DOM元素
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreValue = document.getElementById('score-value');
const finalScore = document.getElementById('final-score');
const gameArea = document.getElementById('game-area');

// 初始化游戏
function initGame() {
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    
    // 创建飞机精灵的默认图像（临时替代）
    createDefaultSprites();
}

// 创建默认精灵（用于在没有实际图片的情况下）
function createDefaultSprites() {
    // 创建玩家飞机的临时图像
    const playerCanvas = document.createElement('canvas');
    playerCanvas.width = 50;
    playerCanvas.height = 50;
    const playerCtx = playerCanvas.getContext('2d');
    playerCtx.fillStyle = '#3498db';
    playerCtx.beginPath();
    playerCtx.moveTo(25, 0);
    playerCtx.lineTo(50, 50);
    playerCtx.lineTo(25, 40);
    playerCtx.lineTo(0, 50);
    playerCtx.closePath();
    playerCtx.fill();
    
    // 设置玩家飞机图像
    const playerStyle = document.createElement('style');
    playerStyle.textContent = `.player { background-image: url(${playerCanvas.toDataURL()}); }`;
    document.head.appendChild(playerStyle);
    
    // 创建敌机的临时图像
    const enemyCanvas = document.createElement('canvas');
    enemyCanvas.width = 40;
    enemyCanvas.height = 40;
    const enemyCtx = enemyCanvas.getContext('2d');
    enemyCtx.fillStyle = '#e74c3c';
    enemyCtx.beginPath();
    enemyCtx.moveTo(20, 0);
    enemyCtx.lineTo(40, 20);
    enemyCtx.lineTo(20, 40);
    enemyCtx.lineTo(0, 20);
    enemyCtx.closePath();
    enemyCtx.fill();
    
    // 设置敌机图像
    const enemyStyle = document.createElement('style');
    enemyStyle.textContent = `.enemy { background-image: url(${enemyCanvas.toDataURL()}); }`;
    document.head.appendChild(enemyStyle);
}

// 开始游戏
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    enemies = [];
    bullets = [];
    lastEnemySpawn = Date.now();
    lastDifficultyIncrease = Date.now();
    enemySpawnInterval = 1500;
    
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    // 创建玩家飞机
    createPlayer();
    
    // 设置触摸事件处理
    setupTouchControls();
    
    // 开始游戏循环
    gameLoop = requestAnimationFrame(update);
}

// 创建玩家飞机
function createPlayer() {
    player = document.createElement('div');
    player.className = 'player';
    gameArea.appendChild(player);
    
    // 初始位置
    player.style.left = (gameArea.clientWidth / 2 - 25) + 'px';
    player.style.bottom = '50px';
    
    // 自动发射子弹
    setInterval(() => {
        if (gameStarted && !gameOver) {
            fireBullet();
        }
    }, 300);
}

// 设置触摸控制
function setupTouchControls() {
    // 触摸移动控制飞机
    document.addEventListener('touchmove', (e) => {
        if (!gameStarted || gameOver) return;
        
        e.preventDefault(); // 阻止页面滚动
        const touch = e.touches[0];
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // 计算触摸点在游戏区域内的位置
        let x = touch.clientX - gameAreaRect.left - 25; // 25是飞机宽度的一半
        
        // 边界限制
        x = Math.max(0, Math.min(x, gameAreaRect.width - 50));
        
        // 更新玩家位置
        player.style.left = x + 'px';
    });
    
    // 添加触摸开始事件
    document.addEventListener('touchstart', (e) => {
        if (!gameStarted || gameOver) return;
        e.preventDefault();
    });
}

// 发射子弹
function fireBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    
    // 从玩家飞机的位置发射
    const playerRect = player.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    const left = playerRect.left - gameAreaRect.left + playerRect.width / 2 - 2.5;
    const bottom = (gameAreaRect.bottom - playerRect.top);
    
    bullet.style.left = left + 'px';
    bullet.style.bottom = bottom + 'px';
    
    gameArea.appendChild(bullet);
    bullets.push(bullet);
}

// 生成敌机
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    
    // 随机位置
    const left = Math.random() * (gameArea.clientWidth - 40);
    enemy.style.left = left + 'px';
    enemy.style.top = '0px';
    
    gameArea.appendChild(enemy);
    enemies.push(enemy);
}

// 更新游戏状态
function update() {
    if (!gameStarted || gameOver) return;
    
    const now = Date.now();
    
    // 生成敌机
    if (now - lastEnemySpawn > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawn = now;
    }
    
    // 增加游戏难度
    if (now - lastDifficultyIncrease > difficultyInterval) {
        if (enemySpawnInterval > 500) {
            enemySpawnInterval -= 100;
        }
        lastDifficultyIncrease = now;
    }
    
    // 移动子弹
    bullets.forEach((bullet, bulletIndex) => {
        const currentBottom = parseFloat(bullet.style.bottom || '0');
        bullet.style.bottom = (currentBottom + 5) + 'px';
        
        // 移除超出屏幕的子弹
        if (currentBottom > gameArea.clientHeight) {
            bullet.remove();
            bullets.splice(bulletIndex, 1);
        }
    });
    
    // 移动敌机
    enemies.forEach((enemy, enemyIndex) => {
        const currentTop = parseFloat(enemy.style.top || '0');
        enemy.style.top = (currentTop + 2) + 'px';
        
        // 检测敌机是否到达底部（玩家失败）
        if (currentTop > gameArea.clientHeight - 40) {
            endGame();
            return;
        }
        
        // 检测子弹和敌机的碰撞
        bullets.forEach((bullet, bulletIndex) => {
            if (checkCollision(bullet, enemy)) {
                // 移除子弹和敌机
                bullet.remove();
                bullets.splice(bulletIndex, 1);
                
                enemy.remove();
                enemies.splice(enemyIndex, 1);
                
                // 增加分数
                score += 10;
                scoreValue.textContent = score;
            }
        });
        
        // 检测玩家和敌机的碰撞
        if (player && checkCollision(player, enemy)) {
            endGame();
        }
    });
    
    // 继续游戏循环
    gameLoop = requestAnimationFrame(update);
}

// 碰撞检测
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// 游戏结束
function endGame() {
    gameOver = true;
    cancelAnimationFrame(gameLoop);
    
    finalScore.textContent = score;
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

// 重置游戏
function resetGame() {
    // 清除游戏区域
    while (gameArea.firstChild) {
        gameArea.removeChild(gameArea.firstChild);
    }
    
    // 重新开始
    startGame();
}

// 初始化游戏
window.addEventListener('load', initGame); 