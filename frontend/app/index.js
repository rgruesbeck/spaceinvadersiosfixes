let myFont;

let gameOver = false;
let gameBeginning = true;

//===Game objects
let ship;

let enemies = [];
let lasers = [];
let stars = [];
let explosions = [];
let waveAnnouncer;


//===Images
let imgShip;
let imgEnemy = [];
let imgLaserPlayer;
let imgLaserEnemy;
let imgLife;
let imgExplosion;
let imgEnemyExplosion = [];


//===Buttons
let playButton;
let soundButton;




//===Score data
let score = 0;
let highScore = 0;
let highscoreGained = false;

let scoreGain1;
let scoreGain2;
let scoreGain3;
let scoreGainBoss;

let scoreGainModifier; //how much will all score gain be increased after each boss fight (in percentage)

//===Data taken from Game Settings
let startingLives;
let lives;
let maxLives;

let startingEnemyRows;
let enemyRows;
let maxEnemyRows;
let tierTwoStart;
let tierThreeStart;

let starCount;

let enemyFireChance;

//===Audio
let backgroundMusic;
let sndLaser;
let sndLoseGame;
let sndSplat;
let sndWavePass;

let soundEnabled = true;
let canMute = true;

let soundImage;
let muteImage;


let objSize; //base size of all objects, calculated based on screen size
let arenaSize = 15; //game size in tiles, using bigger numbers will decrease individual object sizes but allow more objects to fit the screen
let enemyOccupancy = 0.8; //how much of the screen will enemies occupy

//===Touch stuff
let touchStartX = 0;
let touching = false;

//===Enemy info
let enemiesVelocity = 0; //made it public because all enemies will use the same velocity
let enemiesDesiredVelocity = 0; //used for smoothing
let enemiesMaxSpeed;

let shipY;
let fireCooldown = 0.2;


//===Wave stuff
let waveCount = 0;
let waveDelay = 1000; //in Miliseconds
let nextWaveReady = false;
let bossWave;


//===Load this before starting the game
function preload() {
    //===Load font from google fonts link provided in game settings
    var link = document.createElement('link');
    link.href = Koji.config.strings.fontFamily;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    myFont = getFontFamily(Koji.config.strings.fontFamily);
    let newStr = myFont.replace("+", " ");
    myFont = newStr;

    //===Load images
    soundImage = loadImage(Koji.config.images.soundImage);
    muteImage = loadImage(Koji.config.images.muteImage);

    imgShip = loadImage(Koji.config.images.ship);
    imgEnemy[0] = loadImage(Koji.config.images.enemy1);
    imgEnemy[1] = loadImage(Koji.config.images.enemy2);
    imgEnemy[2] = loadImage(Koji.config.images.enemy3);
    imgEnemy[3] = loadImage(Koji.config.images.boss);
    imgLaserEnemy = loadImage(Koji.config.images.enemyProjectile);
    imgLaserPlayer = loadImage(Koji.config.images.playerProjectile);
    imgLife = loadImage(Koji.config.images.lifeIcon);
    imgExplosion = loadImage(Koji.config.images.explosion);
    imgEnemyExplosion[0] = loadImage(Koji.config.images.enemyExplosion1);
    imgEnemyExplosion[1] = loadImage(Koji.config.images.enemyExplosion2);
    imgEnemyExplosion[2] = loadImage(Koji.config.images.enemyExplosion3);
    imgEnemyExplosion[3] = loadImage(Koji.config.images.enemyExplosionBoss);

    //===Load Sounds
    sndLaser = Koji.config.sounds.laserSound;
    sndLoseGame = Koji.config.sounds.loseGameSound;
    sndSplat = Koji.config.sounds.splatSound;
    sndWavePass = Koji.config.sounds.wavePassSound;


    //===Load settings
    scoreGain1 = parseInt(Koji.config.strings.scoreGain1);
    scoreGain2 = parseInt(Koji.config.strings.scoreGain2);
    scoreGain3 = parseInt(Koji.config.strings.scoreGain3);
    scoreGainBoss = parseInt(Koji.config.strings.scoreGainBoss);
    scoreGainModifier = parseInt(Koji.config.strings.scoreGainModifier);


    startingEnemyRows = parseInt(Koji.config.strings.enemyRows);
    enemyRows = startingEnemyRows;
    maxEnemyRows = parseInt(Koji.config.strings.maxEnemyRows);
    tierTwoStart = parseInt(Koji.config.strings.tierTwoStart);
    tierThreeStart = parseInt(Koji.config.strings.tierThreeStart);
    starCount = parseInt(Koji.config.strings.starCount);
    enemyFireChance = parseInt(Koji.config.strings.enemyFireChance); //frequency
    startingLives = parseInt(Koji.config.strings.lives);
    maxLives = parseInt(Koji.config.strings.maxLives);
    lives = startingLives;

    bossWave = parseInt(Koji.config.strings.bossWave);

}

function setup() {
    // make a full screen canvas
    width = window.innerWidth;
    height = window.innerHeight;

    //===How much of the screen should the game take
    let sizeModifier = 0.8;
    if (height > width) {
        sizeModifier = 1;
    }

    createCanvas(width, height);

    //===Determine basic object size depending on size of the screen
    objSize = floor(min(floor(width / arenaSize), floor(height / arenaSize)) * sizeModifier);


    enemiesMaxSpeed = objSize / 80;
    shipY = height * 0.8;


    //===Get high score data from local storage
    if (localStorage.getItem("invadersHighscore")) {
        highScore = localStorage.getItem("invadersHighscore");
    }

    textFont(myFont); //set our font

    playButton = new PlayButton();
    soundButton = new SoundButton();

    gameBeginning = true;

    //===start moving enemies left and right
    setEnemyVelocity(enemiesMaxSpeed);


    ship = new Ship();



    spawnStarStart();

    playMusic();


}

//===Main game loop
function draw() {
    // set the background color from the configuration options
    background(Koji.config.colors.backgroundColor);


    //===Update background stars
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].render();

        if (stars[i].pos.y > height && stars[i].timer > 2) {
            stars[i].pos.y = -20;
        }

    }



    //===Draw UI
    if (gameOver || gameBeginning) {

        //===Draw title
        textSize(objSize * 1.5);
        fill(Koji.config.colors.titleColor);
        textAlign(CENTER, TOP);
        text(Koji.config.strings.title, width / 2, objSize * 2);

        //===Draw instructions
        textSize(objSize * 0.8);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(Koji.config.strings.instructions1, width / 2, objSize * 5);

        textSize(objSize * 0.8);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(Koji.config.strings.instructions2, width / 2, objSize * 6);

        textSize(objSize * 0.8);
        fill(Koji.config.colors.instructionsColor);
        textAlign(CENTER, TOP);
        text(Koji.config.strings.instructions3, width / 2, objSize * 7);


        //===
        playButton.render();

        //===Draw score text after the game
        if (!gameBeginning) {
            textSize(objSize);
            fill(Koji.config.colors.scoreColor);
            textAlign(CENTER, TOP);
            text(Koji.config.strings.scoreText + " " + score, width / 2, playButton.pos.y + objSize * 4);
        }

        //===Notify the player if they got a new high score, or if they haven't, show the previous high score
        if (highscoreGained) {
            textSize(objSize * 1.5);
            fill(Koji.config.colors.highscoreColor);
            textAlign(CENTER, TOP);
            text(Koji.config.strings.highscoreGainedText, width / 2, playButton.pos.y + objSize * 8);
        } else {

            textSize(objSize * 1.2);
            fill(Koji.config.colors.highscoreColor);
            textAlign(CENTER, TOP);
            text(Koji.config.strings.highscoreText + " " + highScore, width / 2, playButton.pos.y + objSize * 8);
        }

    } else {

        //===Smoothly update velocity to desired
        enemiesVelocity = Smooth(enemiesVelocity, enemiesDesiredVelocity, 16);

        //===If there are no enemies left, start a new wave
        if (enemies.length <= 0) {
            if (!nextWaveReady) {
                newWave();
            }
        }

        ship.update();
        ship.render();

        //===Update lasers
        for (let i = 0; i < lasers.length; i++) {
            lasers[i].update();
            lasers[i].render();

            //===Check collision with enemies
            for (let j = 0; j < enemies.length; j++) {
                if (lasers[i].owner == 0) {
                    if (lasers[i].hit(enemies[j])) {
                        enemies[j].getDamaged();
                        lasers[i].removable = true;
                    }
                }
            }

            //===Check collision with player
            if (lasers[i].owner == 1) {
                if (lasers[i].hit(ship)) {

                    lives--;
                    ship.pos.y += objSize / 2; /*push back the ship*/
                    PlaySound(sndLoseGame);
                    lasers[i].removable = true;
                    explosions.push(new Explosion(lasers[i].pos, 0)); //create an explosion

                    if (lives <= 0) {
                        gameOver = true;
                        PlaySound(sndLoseGame);
                        checkHighscore();
                    }
                }
            }
        }

        //===Update enemies
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].update();
            enemies[i].render();

        }

        //===Update all explosions===//
        for (var i = explosions.length - 1; i >= 0; i--) {
            explosions[i].update();
            explosions[i].render();

            if (explosions[i].timer <= 0) {
                explosions.splice(i, 1); //remove them after their timer has elapsed
            }
        }

        //===Check if enemies should change direction if on the edge of the screen
        if (enemies.length > 0) {
            checkEnemiesPosition();
        }

        cleanUp(); //===Remove all objects scheduled for removal

        //===Ingame UI

        //===Draw lives
        for (let i = 0; i < lives; i++) {
            image(imgLife, width / 2 - objSize * arenaSize / 2 + (objSize * 1.1) * i + objSize / 2, objSize / 3, objSize, objSize);
        }

        //===Score draw
        let scoreX = width / 2 + objSize * arenaSize / 2 - objSize / 2;
        let scoreY = objSize / 3;
        textSize(objSize);
        fill(Koji.config.colors.scoreColor);
        textAlign(RIGHT, TOP);
        text(score, scoreX, scoreY);

        //===Update wave announcer
        if (waveAnnouncer) {
            waveAnnouncer.update();
            waveAnnouncer.render();

            if (waveAnnouncer.lifetime <= 0) {
                waveAnnouncer = 0;

            }
        }

    }


    soundButton.render();


}

//===Spawn stars across the screen
function spawnStarStart() {
    for (let i = 0; i < starCount; i++) {
        let starX = random() * width;
        let starY = random() * height;
        stars.push(new Star(starX, starY));
    }
}


//===Remove all objects that should be removed
function cleanUp() {
    for (let i = 0; i < enemies.length; i++) {
        //===Enemies die
        if (enemies[i].health <= 0) {
            explosions.push(new Explosion(enemies[i].pos, enemies[i].type + 1)); //create an explosion
            score += round(enemies[i].scoreGain * calculateScoreGain());
            PlaySound(sndSplat);
            enemies.splice(i, 1);
        }
    }

    for (let i = 0; i < lasers.length; i++) {
        if (lasers[i].removable) {
            lasers.splice(i, 1);
        }
    }
}

function checkHighscore() {
    if (score > highScore) {
        highscoreGained = true;
        highscore = score;

        localStorage.setItem("invadersHighscore", highscore);
    }
}

//===Regulate velocity
function checkEnemiesPosition() {
    let leftmostEnemy = enemies[0];
    let rightmostEnemy = enemies[0];

    for (let i = 1; i < enemies.length; i++) {
        if (enemies[i].pos.x < leftmostEnemy.pos.x) {
            leftmostEnemy = enemies[i];
        }
        if (enemies[i].pos.x > rightmostEnemy.pos.x) {
            rightmostEnemy = enemies[i];
        }
    }

    let leftCheck = width / 2 - objSize * arenaSize / 2;
    let rightCheck = width / 2 + objSize * arenaSize / 2;

    if (leftmostEnemy.pos.x <= leftCheck) {
        setEnemyVelocity(enemiesMaxSpeed);
    }

    if (rightmostEnemy.pos.x >= rightCheck) {
        setEnemyVelocity(-enemiesMaxSpeed);
    }

}

function setEnemyVelocity(value) {
    enemiesDesiredVelocity = value;
}



//===Handle input
function keyPressed() {
    if (!gameOver && !gameBeginning) {
        if (keyCode == RIGHT_ARROW) {
            ship.direction = 1;
        } else
            if (keyCode == LEFT_ARROW) {
                ship.direction = -1;
            }

        if (key == ' ') {
            ship.firing = true;
            ship.fireCooldownTimer = 0;
        }
    }
}

function keyReleased() {
    if (!gameOver && !gameBeginning) {
        if (keyCode == RIGHT_ARROW && ship.direction == 1) {
            ship.direction = 0;
        }
        if (keyCode == LEFT_ARROW && ship.direction == -1) {
            ship.direction = 0;
        }

        if (key == ' ') {
            ship.firing = false;
        }

    }
}


function touchStarted() {

    if (gameOver || gameBeginning) {
        if (playButton.checkClick()) {
            gameBeginning = false;
            init();
        }
    }

    if (!gameOver && !gameBeginning) {
        touchStartX = mouseX;

        touching = true;

        ship.firing = true;
        ship.fireCooldownTimer = 0;
    }

    if (soundButton.checkClick()) {
        toggleSound();
    }
}

function touchEnded() {

    if (!gameOver && !gameBeginning) {

        ship.direction = 0;

    }

    ship.firing = false;

    touching = false;
}

//===Initialize/reset the game
function init() {
    gameOver = false;
    lasers = [];
    enemies = [];
    explosions = [];

    highscoreGained = false;
    score = 0;
    waveCount = 0;

    enemyRows = startingEnemyRows;

    lives = startingLives;

    ship = new Ship();

    newWave();

}

//===Get a new wave ready
function newWave() {

    //===Get a life after every boss wave
    if (lives < maxLives && waveCount > 1 && waveCount % bossWave == 0) {
        lives++;
    }

    waveCount++;

    PlaySound(sndWavePass);

    //===Make a new wave announcer with proper text
    let waveTitle = "Wave " + waveCount;
    if (waveCount % bossWave == 0) {
        waveTitle = "BOSS";
    }

    waveAnnouncer = new WaveAnnouncer(waveTitle);

    nextWaveReady = true;

    setTimeout(function () {

        //Every X wave is a boss fight
        if (waveCount % bossWave == 0) {
            SpawnBoss();
        } else {
            SpawnEnemies();
            if (enemyRows < maxEnemyRows) {
                enemyRows++;
            }
        }

        nextWaveReady = false;
    }, waveDelay);

}

//===Player ship
function Ship() {
    this.pos = createVector(width / 2, shipY);
    this.img = imgShip;

    this.velocity = 0;
    this.maxVelocity = objSize / 2;

    this.direction = 0; //=== 0-stop, 1-move right, 2-move left

    this.firing = false; //whether the ship should currently fire or not
    this.fireCooldownTimer = 0;

    this.sizeMod = 1; //size modifier => sizeMod * objSize

    this.render = function () {
        image(this.img, this.pos.x - objSize / 2, this.pos.y - objSize / 2, objSize, objSize);
    }

    this.update = function () {
        if (touching) {
            this.handleTouch();
        }
        this.move();

        //===Move back to original Y after pushback
        if (this.pos.y != shipY) {
            this.pos.y = Smooth(this.pos.y, shipY, 10);
        }

        this.fireCooldownTimer -= 1 / frameRate(); /*update fire cooldown timer*/

        if (this.firing) {
            if (this.fireCooldownTimer < 0) {

                this.fire();

                this.fireCooldownTimer = fireCooldown;
            }
        }
    }


    this.move = function () {
        //===determine acceleration factor, used for smoother movement and changing directions
        let accelerationFactor = 32;
        if (this.direction == 0) {
            accelerationFactor = 20;
        }
        if (this.direction == 1 && this.velocity < 0) {
            accelerationFactor = 10;
        }
        if (this.direction == -1 && this.velocity > 0) {
            accelerationFactor = 10;
        }

        this.velocity = Smooth(this.velocity, this.maxVelocity * this.direction, accelerationFactor); //smoothly update velocity

        if ((this.direction == 1 && this.pos.x < width - objSize) || (this.direction == -1 && this.pos.x > objSize)) {
            this.pos.x += this.velocity;
        } else {
            this.velocity = 0;
        }
    }

    this.handleTouch = function () {

        //===Clamp movement within screen bounds
        let desiredX = mouseX;
        if (desiredX > width) {
            desiredX = width;
        }
        if (desiredX < 0) {
            desiredX = 0;
        }

        //determine direction based on touch coordinates
        let dir = desiredX - this.pos.x;

        if (dir > 0 && abs(dir) > objSize / 4) {
            this.direction = 1;
        } else if (dir < 0 && abs(dir) > objSize / 4) {
            this.direction = -1;
        } else {
            this.direction = 0;
        }

    }

    //===Fire up the LASER
    this.fire = function () {
        lasers.push(new Laser(this.pos.x, this.pos.y - objSize / 2, 0));
        this.pos.y += objSize / 2.5;
        PlaySound(sndLaser);
    }


}



//===Takes coordinates and owner (0-player, 1-enemy)
function Laser(x, y, owner) {
    this.pos = createVector(x, y);
    this.img = imgLaserPlayer;
    this.owner = owner;
    this.maxVelocity = objSize / 2.5;
    this.velocity = 0;

    this.removable = false; //if true, will get removed in the next frame

    if (this.owner == 1) {
        this.img = imgLaserEnemy;
        this.maxVelocity /= 1.5;
    }


    this.update = function () {
        this.move();

        this.velocity = Smooth(this.velocity, this.maxVelocity, 20);

        this.removable = this.offscreen(); //remove if it goes offscreen

    }

    this.render = function () {
        let size = createVector(objSize / 3, objSize);

        image(this.img, this.pos.x - size.x / 2, this.pos.y - size.y / 2, size.x, size.y)
    }

    //check collision
    this.hit = function (other) {
        let size = createVector(objSize / 3, objSize);

        let distX = this.pos.x - other.pos.x;
        let distY = this.pos.y - other.pos.y;


        if (abs(distX) < (size.x * 1.75 * other.sizeMod) && abs(distY) < (size.y / 4 * other.sizeMod)) {
            return true;
        } else {
            return false;
        }
    }


    this.move = function () {
        if (this.owner == 0) {
            this.pos.y -= this.velocity;
        } else {
            this.pos.y += this.velocity;
        }
    }


    //check if offscreen
    this.offscreen = function () {
        if (this.pos.x > width || this.pos.x < 0) {
            return true;

        }
        if (this.pos.y > height || this.pos.y < 0) {

            return true;
        }
        return false;
    }

}

//===Type can be 0, 1 or 2 or 3(boss)
function Enemy(x, y, type) {
    this.desiredY = y;

    this.pos = createVector(x, -objSize * 2, y);
    this.pos.y -= objSize * 200 * (height / y);
    this.type = type;
    this.img = imgEnemy[type];
    this.health = type + 1;

    this.sizeMod = 1;

    //===BOSS STUFF
    //Cooldown between boss fire waves
    this.bossFirePeriodCooldown = 3;
    this.bossFirePeriodCooldownTimer = 2;

    //Cooldown between each individual shot
    this.bossFireCooldown = 0.8;
    this.bossFireCooldownTimer = 0;

    //How long the wave lasts
    this.bossFirePeriod = 2;
    this.bossFireTimer = this.bossFirePeriod;

    this.bossFiring = false;
    //===

    this.scoreGain = scoreGain1;
    if (type == 1) {
        this.scoreGain = scoreGain2;
    }
    if (type == 2) {
        this.scoreGain = scoreGain3;
    }
    if (type == 3) {
        this.scoreGain = scoreGainBoss;
        this.sizeMod = 10;
        this.health = 50;
    }

    let startY = this.pos.y;

    this.update = function () {
        this.pos.x += enemiesVelocity;

        this.pos.y = Smooth(this.pos.y, this.desiredY, 20);

        let roll = random() * 100;
        if (roll < enemyFireChance / 100) {
            this.fire();
        }

        if (type == 3) {
            this.bossFirePeriodCooldownTimer -= 1 / frameRate();

            if (this.bossFirePeriodCooldownTimer <= 0) {
                this.bossFiring = true;
            }

            if (this.bossFiring) {
                this.bossFireTimer -= 1 / frameRate();

                if (this.bossFireTimer <= 0) {
                    this.bossFireTimer = this.bossFirePeriod;
                    this.bossFirePeriodCooldownTimer = this.bossFirePeriodCooldown;
                    this.bossFiring = false;
                }

                this.bossFire();
            }
        }
    }

    this.render = function () {
        let size = objSize * this.sizeMod;
        image(this.img, this.pos.x - size / 2, this.pos.y - size / 2, size, size);
    }

    this.getDamaged = function () {
        this.health--;

        this.pos.y -= objSize / 2.5;



    }

    this.fire = function () {
        lasers.push(new Laser(this.pos.x, this.pos.y + objSize / 2, 1));
        this.pos.y -= objSize / 4;
    }

    //===Boss fire handling
    this.bossFireProjectilesCount = 10;
    this.bossFire = function () {
        this.bossFireCooldownTimer -= 1 / frameRate();

        if (this.bossFireCooldownTimer < 0) {
            for (let i = 0; i < this.bossFireProjectilesCount; i++) {
                let distance = (this.sizeMod * objSize) / this.bossFireProjectilesCount;
                let laserX = this.pos.x - (this.sizeMod * objSize) / 2 + (objSize * i);
                let laserY = this.pos.y + (this.sizeMod * objSize) / 6 + objSize * random();
                lasers.push(new Laser(laserX, laserY, 1));
            }

            this.bossFireCooldownTimer = this.bossFireCooldown;
        }
    }
}

//===Spawn enemies in a grid
function SpawnEnemies() {
    let rows = enemyRows;
    let distance = objSize / 4;
    let rowWidth = arenaSize * 0.8;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rowWidth; j++) {

            let type = 0;
            if (i <= rows - tierTwoStart) {
                type = 1;
            }
            if (i <= rows - tierThreeStart) {
                type = 2;
            }

            enemies.push(
                new Enemy(
                    width / 2 + ((objSize + distance) * (j - (rowWidth - 1) / 2)),
                    height * 0.1 + (objSize * i),
                    type
                )
            );

        }
    }
}

function SpawnBoss() {
    enemies.push(new Enemy(width / 2, height / 2 - objSize * 5, 3));
}


///===Background stars
/*
    Makes them a random color
    When a star moves offscreen, it gets teleported back at the opposite side and starts again
    Velocity.x is opposite of player's velocity.x and smaller

*/
function Star(x, y) {
    this.pos = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.size = random() * objSize / 8;

    this.r = random() * 100 + 155;
    this.g = random() * 100 + 155;
    this.b = random() * 100 + 155;
    this.a = random() * 90 + 60;

    this.speedModifier = random() * 0.1;


    this.timer = 0;


    this.update = function () {

        this.velocity.x = -ship.velocity * 0.05;

        this.velocity.y = objSize / 30;

        this.timer += 1 / frameRate();

        this.pos.add(this.velocity);



    }

    this.render = function () {

        // Set colors
        fill(this.r, this.g, this.b, this.a);
        strokeWeight(0);
        //stroke(127, 63, 120);

        // A rectangle
        //rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        circle(this.pos.x, this.pos.y, this.size);


    }

    this.offscreen = function () {
        if (this.pos.x > width || this.pos.x < 0) {
            return true;

        }
        if (this.pos.y > height || this.pos.y < 0) {

            return true;
        }
        return false;
    }
}

//type - 0 for player; 1, 2, 3 for enemies; 4 for boss
function Explosion(pos, type) {
    this.pos = createVector(pos.x, pos.y);
    this.timer = 0.2; //lifetime of the explosion
    this.a = 1; // alpha/opacity
    this.img = imgExplosion;
    this.rotate = random() * 360;
    this.scale = 0.01;
    this.desiredScale = 2;

    if (type > 0) {
        this.img = imgEnemyExplosion[type - 1];
        this.desiredScale = 2;
    }

    if (type == 4) {
        this.desiredScale = 10;
    }

    this.update = function () {
        
        this.scale = Smooth(this.scale, this.desiredScale, 5);

        //tick tock
        this.timer -= 1 / frameRate();
    }

    this.render = function () {
        //draw
        push();
        let sizeX = objSize * this.scale;
        let sizeY = objSize * this.scale;

        translate(this.pos.x, this.pos.y);
        tint(255, 255, 255, 255 * this.a);
        rotate(this.rotate);
        image(this.img, -sizeX / 2, -sizeY / 2, sizeX, sizeY);
        pop();
    }
}

//===Text before every wave announcing it
function WaveAnnouncer(value) {
    this.pos = createVector(width / 2, -objSize * 5);
    this.value = value;
    this.lifetime = 2;
    this.desiredY = height / 2 - objSize * 2;

    this.update = function () {
        this.pos.y = Smooth(this.pos.y, this.desiredY, 16);
        this.lifetime -= 1 / frameRate();
    }

    this.render = function () {
        textSize(objSize * 2);
        fill(Koji.config.colors.waveColor);
        textAlign(CENTER, CENTER);
        text(this.value, this.pos.x, this.pos.y);
    }

}

//====UTILITIES

//===Used for playing any sound
PlaySound = function (src, loop) {
    if (soundEnabled) {
        var audio = new Audio(src);
        audio.loop = loop;
        audio.play();
    }

}

function playMusic() {
    if (!backgroundMusic) {
        backgroundMusic = new Audio(Koji.config.sounds.music);
    }

    backgroundMusic.loop = loop;
    backgroundMusic.play();
}

function disableSound() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    soundEnabled = false;
}

function enableSound() {
    soundEnabled = true;
    playMusic();
}

function toggleSound() {
    if (canMute) {

        canMute = false;

        if (soundEnabled) {
            disableSound();
        } else {
            enableSound();
        }

        setTimeout(() => {
            canMute = true;
        }, 100);
    }

}

//===Basic Sound button with an on/off function
function SoundButton() {
    this.pos = createVector(50, 50);
    this.size = createVector(objSize, objSize);

    this.render = function () {
        this.pos.x = width - this.size.x * 1.5;
        this.pos.y = height - this.size.y * 1.5;

        let img;
        if (soundEnabled) {
            img = soundImage;
        } else {
            img = muteImage;
        }

        image(img, this.pos.x, this.pos.y, this.size.x, this.size.y); //draw
    }

    this.checkClick = function () {

        if (mouseX >= this.pos.x &&
            mouseX <= this.pos.x + this.size.x &&
            mouseY >= this.pos.y &&
            mouseY <= this.pos.y + this.size.y) {
            return true;
        } else {
            return false;
        }
    }

}



function PlayButton() {
    this.size = createVector(objSize * 6, objSize * 2);
    this.pos = createVector(width / 2 - this.size.x / 2, height / 2 - this.size.y / 2 + 24);


    this.label = "Play";

    this.render = function () {
        this.pos.x = width / 2 - this.size.x / 2;
        this.pos.y = height / 2 - this.size.y / 2;

        fill(Koji.config.colors.playButtonColor);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, objSize / 2);


        textSize(objSize);
        fill(Koji.config.colors.playButtonTextColor);
        textAlign(CENTER, CENTER);
        text(Koji.config.strings.playButtonText, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);

    }

    this.checkClick = function () {

        if (mouseX >= this.pos.x &&
            mouseX <= this.pos.x + this.size.x &&
            mouseY >= this.pos.y &&
            mouseY <= this.pos.y + this.size.y) {
            return true;
        } else {
            return false;
        }
    }
}


/*
    Basic smoothing function
    v = ((v * (N - 1)) + w) / N; 

    v - current value
    w - goal value
    The higher the factor, the slower v approaches w.
*/
function Smooth(current, goal, factor) {
    return ((current * (factor - 1)) + goal) / factor;
}


//===Isolate the font name from the font link provided in game settings
function getFontFamily(ff) {
    const start = ff.indexOf('family=');
    if (start === -1) return 'sans-serif';
    let end = ff.indexOf('&', start);
    if (end === -1) end = undefined;
    return ff.slice(start + 7, end);
}

//===Adds more score gain for each wave, exponentially
function calculateScoreGain() {
    let gain = 1;
    for (let i = 0; i < waveCount - 1; i++) {
        gain += gain * scoreGainModifier / 100;
    }

    return gain;
}