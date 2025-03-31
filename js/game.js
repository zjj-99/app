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

class Game {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score-value');
        this.finalScoreElement = document.getElementById('final-score');
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        
        this.score = 0;
        this.level = 1;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.gameLoop = null;
        this.isGameOver = false;
        this.lastEnemySpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.hasLaser = false;
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.isGameOver = false;
        this.hasLaser = false;
        
        this.scoreElement.textContent = this.score;
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        this.player = new Player(this.gameArea);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        this.spawnEnemies();
        this.spawnPowerUps();
    }
    
    spawnEnemies() {
        const now = Date.now();
        if (now - this.lastEnemySpawn > 2000 - (this.level * 100)) { // 随等级提高，敌人生成更快
            const enemy = new Enemy(this.gameArea, this.level);
            this.enemies.push(enemy);
            this.lastEnemySpawn = now;
        }
    }
    
    spawnPowerUps() {
        const now = Date.now();
        if (now - this.lastPowerUpSpawn > 10000) { // 每10秒可能生成一个道具
            if (Math.random() < 0.3) { // 30%概率生成道具
                const powerUp = new PowerUp(this.gameArea);
                this.powerUps.push(powerUp);
            }
            this.lastPowerUpSpawn = now;
        }
    }
    
    update() {
        if (this.isGameOver) return;
        
        this.player.update();
        this.spawnEnemies();
        this.spawnPowerUps();
        
        // 更新敌人
        this.enemies.forEach((enemy, index) => {
            enemy.update();
            if (enemy.isOffScreen()) {
                enemy.remove();
                this.enemies.splice(index, 1);
            }
        });
        
        // 更新子弹
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (bullet.isOffScreen()) {
                bullet.remove();
                this.bullets.splice(index, 1);
            }
        });
        
        // 更新道具
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update();
            if (powerUp.isOffScreen()) {
                powerUp.remove();
                this.powerUps.splice(index, 1);
            }
        });
        
        // 检测碰撞
        this.checkCollisions();
        
        // 检查升级
        this.checkLevelUp();
    }
    
    checkCollisions() {
        // 子弹与敌人碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    bullet.remove();
                    this.bullets.splice(bulletIndex, 1);
                    enemy.takeDamage(bullet.damage);
                    if (enemy.isDestroyed()) {
                        enemy.remove();
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 100;
                        this.scoreElement.textContent = this.score;
                    }
                }
            });
        });
        
        // 玩家与敌人碰撞
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(this.player, enemy)) {
                this.gameOver();
            }
        });
        
        // 玩家与道具碰撞
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(this.player, powerUp)) {
                powerUp.remove();
                this.powerUps.splice(index, 1);
                if (powerUp.type === 'laser') {
                    this.hasLaser = true;
                    this.player.activateLaser();
                }
            }
        });
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.player.levelUp();
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.finalScoreElement.textContent = this.score;
        this.gameScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
    }
}

class Player {
    constructor(gameArea) {
        this.gameArea = gameArea;
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.gameArea.appendChild(this.element);
        
        this.width = 50;
        this.height = 50;
        this.x = (gameArea.offsetWidth - this.width) / 2;
        this.y = gameArea.offsetHeight - this.height - 20;
        this.speed = 5;
        this.level = 1;
        this.damage = 10;
        this.hasLaser = false;
        
        this.updatePosition();
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.moveLeft();
            } else if (e.key === 'ArrowRight') {
                this.moveRight();
            } else if (e.key === 'ArrowUp') {
                this.moveUp();
            } else if (e.key === 'ArrowDown') {
                this.moveDown();
            } else if (e.key === ' ') {
                this.shoot();
            }
        });
    }
    
    moveLeft() {
        this.x = Math.max(0, this.x - this.speed);
        this.updatePosition();
    }
    
    moveRight() {
        this.x = Math.min(this.gameArea.offsetWidth - this.width, this.x + this.speed);
        this.updatePosition();
    }
    
    moveUp() {
        this.y = Math.max(0, this.y - this.speed);
        this.updatePosition();
    }
    
    moveDown() {
        this.y = Math.min(this.gameArea.offsetHeight - this.height - 20, this.y + this.speed);
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    shoot() {
        if (this.hasLaser) {
            this.activateLaser();
            this.hasLaser = false;
            this.element.classList.remove('laser-active');
        } else {
            const bullet = new Bullet(this.gameArea, this.x + this.width / 2, this.y, this.damage);
            game.bullets.push(bullet);
        }
    }
    
    levelUp() {
        this.level++;
        this.damage += 5;
        this.element.className = `player level-${this.level}`;
    }
    
    activateLaser() {
        const laser = new Laser(this.gameArea, this.x + this.width / 2);
        game.bullets.push(laser);
    }
    
    update() {
        // 可以添加其他更新逻辑
    }
}

class Enemy {
    constructor(gameArea, level) {
        this.gameArea = gameArea;
        this.element = document.createElement('div');
        this.element.className = `enemy level-${level}`;
        this.gameArea.appendChild(this.element);
        
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (gameArea.offsetWidth - this.width);
        this.y = -this.height;
        this.speed = 2 + (level * 0.5); // 随等级提高速度
        this.health = 20 + (level * 10); // 随等级提高血量
        this.maxHealth = this.health;
        
        this.updatePosition();
    }
    
    update() {
        this.y += this.speed;
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    takeDamage(damage) {
        this.health -= damage;
        const healthPercent = (this.health / this.maxHealth) * 100;
        this.element.style.setProperty('--health', `${healthPercent}%`);
    }
    
    isDestroyed() {
        return this.health <= 0;
    }
    
    isOffScreen() {
        return this.y > this.gameArea.offsetHeight;
    }
    
    remove() {
        this.element.remove();
    }
}

class Bullet {
    constructor(gameArea, x, y, damage) {
        this.gameArea = gameArea;
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.gameArea.appendChild(this.element);
        
        this.width = 4;
        this.height = 10;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = 7;
        this.damage = damage;
        
        this.updatePosition();
    }
    
    update() {
        this.y -= this.speed;
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    isOffScreen() {
        return this.y < -this.height;
    }
    
    remove() {
        this.element.remove();
    }
}

class Laser extends Bullet {
    constructor(gameArea, x) {
        super(gameArea, x, 0, 999);
        this.element.className = 'laser';
        this.width = 8;
        this.height = this.gameArea.offsetHeight;
        this.speed = 15;
        this.updatePosition();
    }
}

class PowerUp {
    constructor(gameArea) {
        this.gameArea = gameArea;
        this.element = document.createElement('div');
        this.element.className = 'power-up laser';
        this.gameArea.appendChild(this.element);
        
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (gameArea.offsetWidth - this.width);
        this.y = -this.height;
        this.speed = 3;
        this.type = 'laser';
        
        this.updatePosition();
    }
    
    update() {
        this.y += this.speed;
        this.updatePosition();
    }
    
    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }
    
    isOffScreen() {
        return this.y > this.gameArea.offsetHeight;
    }
    
    remove() {
        this.element.remove();
    }
}

let game;
window.addEventListener('load', () => {
    game = new Game();
}); 