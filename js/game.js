// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);
// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

//imagen de piedra
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function () {
	stoneReady = true;
};
stoneImage.src = "images/stone.png";

//imagen de piedra
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

var gameOverReady = false;
var gameOverImage = new Image();
gameOverImage.onload = function () {
	gameOverReady = true;
};
gameOverImage.src = "images/game_over.jpg";


// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};

var lastHeroPos = {};
var princess = {};
var princessesCaught = localStorage.getItem("princessesCaught");
if(princessesCaught == undefined){
	princessesCaught = 0;
	localStorage.setItem("princessesCaught", 0);
}

var lives = localStorage.getItem("lives");
if(lives == undefined){
	lives = 3;
	localStorage.setItem("lives", 3);
}

var nStones = 1;
var stones = [];

var nMonsters = 1;
var monsters = [];
var monsterSpeed = 64;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", event = function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", event = function (e) {
	delete keysDown[e.keyCode];
}, false);

var touchingPrincess = function(character, princess){
	if (
		character.x <= (princess.x + 16)
		&& princess.x <= (character.x + 16)
		&& character.y <= (princess.y + 16)
		&& princess.y <= (character.y + 32)){
			return true;
		}else{
			return false;
		}
}
var touchingStone = function(character, stone){
	if (
	character.x <= (stone.x + 28)
	&& stone.x <= (character.x + 28)
	&& character.y <= (stone.y + 28)
	&& stone.y <= (character.y + 32)){
		return true;
	}else{
		return false;
	}
}

//Tocar cualquier piedra
var touchingAllStones = function(character, stones){
	for(var i = 0; i < nStones; i++){
		if (touchingStone(character, stones[i])){
			return true;
		}
	}
	return false;
}

var touchingMonster = function(character, monster){
	if (
		character.x <= (monster.x + 28)
		&& monster.x <= (character.x + 28)
		&& character.y <= (monster.y + 28)
		&& monster.y <= (character.y + 32)){
			return true;
		}else{
			return false;
		}
}

var touchingAllMonsters = function(character, monsters){
	for(var i = 0; i < nMonsters; i++){
		if (touchingMonster(character, monsters[i])){
			return true;
		}
	}
	return false;
}

var putStones = function(){
	stones = [];
	var stone = {};
	for(var i = 0; i < nStones; i++){
		stone.x = Math.random() * (454 - 28) + 28;
		stone.y = Math.random() * (414 - 28) + 28;
		stones.push(stone);
		while(touchingStone(princess, stones[i])
			|| touchingStone(hero, stones[i])){
			stones.pop();
			stone.x = Math.random() * (454 - 28) + 28;
			stone.y = Math.random() * (414 - 28) + 28;
			stones.push(stone);
		}
		stone = {};
	}
}

var putMonsters = function(){
	monsters = [];
	var monster = {};
	for(var i = 0; i < nMonsters; i++){
		monster.x = Math.random() * (454 - 28) + 28;
		monster.y = Math.random() * (414 - 28) + 28;
		monsters.push(monster);
		while(touchingMonster(hero, monsters[i])
			|| touchingAllStones(monster, stones)){
			monsters.pop();
			monster.x = Math.random() * (454 - 28) + 28;
			monster.y = Math.random() * (414 - 28) + 28;
			monsters.push(monster);
		}
		monster.inicialX = monster.x;
		monster.inicialY = monster.y;
		monster.max = 128;
		monster.speed = monsterSpeed;
		monster = {};
	}
}

// Reset the game when the player catches a princess
var reset = function () {

	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the princess somewhere on 9the screen randomly
	//Valores para que no este en el bosque.
	princess.x = Math.random() * (454 - 28) + 28;
	princess.y = Math.random() * (414 - 28) + 28;

	putStones();
	putMonsters();

};

//El heroe no puede salir del recinto
var touchingMargen = function(character){
	var aux = false;
	if (character.x >= 480) {
		character.x = 480;
		aux = true;
	}

	if (character.x <= 0) {
		character.x = 0;
		aux = true;
	}

	if (character.y >= 448) {
		character.y = 448;
		aux = true;
	}

	if (character.y <= 0) {
		character.y = 0;
		aux = true;
	}

	return aux;

	}

var isOdd = function(num){
	if((num % 2) == 0){
		return true;
	}
	return false;
}

var monsterMovement = function(modifier){
	for (var i = 0; i < nMonsters; i++){
		if(isOdd(i) || i == 0){
			monsters[i].x += monsters[i].speed * modifier;
			if (touchingMargen(monsters[i])
				|| touchingAllStones(monsters[i], stones)
				|| Math.abs(monsters[i].x - monsters[i].inicialX ) > monsters[i].max){
				monsters[i].x -= monsters[i].speed * modifier;
				monsters[i].speed = monsters[i].speed * -1;
			}
		}else{
			monsters[i].y += monsters[i].speed * modifier;
			if (touchingMargen(monsters[i])
				|| touchingAllStones(monsters[i], stones)
				|| Math.abs(monsters[i].y - monsters[i].inicialY ) > monsters[i].max){
				monsters[i].y -= monsters[i].speed * modifier;
				monsters[i].speed = -monsters[i].speed;
			}
		}
	}
}

var levelUP = function(){
	nStones++;
	nMonsters++;
	monsterSpeed += 32;
}
// Update game objects
var update = function (modifier) {
	lastHeroPos.x = hero.x;
	lastHeroPos.y = hero.y;
	if (lives == 0){
		lastHeroPos.x = hero.x;
		lastHeroPos.y = hero.y;
	}else{
		if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
		}
		if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
		}
		if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
		}
		if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
		}
	}
	
	touchingMargen(hero);
	monsterMovement(modifier);

	// Are they touching?
	if (touchingPrincess(hero, princess)) {
		++princessesCaught;
		localStorage.setItem("princessesCaught", princessesCaught);
		if((princessesCaught % 10) == 0){
			levelUP();
		}
		reset();
	}
	//El heroe no puede pasa por la piedra.

	if (touchingAllStones(hero, stones)){
		hero.x = lastHeroPos.x;
		hero.y = lastHeroPos.y;
	}

	if (touchingAllMonsters(hero, monsters)){
		lives--;
		localStorage.setItem("lives", lives);
		reset();
	}

};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if (stoneReady) {
		for (var i = 0; i < nStones; i++){
			ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
		}
	}

	if (monsterReady) {
		for (var j = 0; j < nMonsters; j++){
			ctx.drawImage(monsterImage, monsters[j].x, monsters[j].y);
		}
	}
	
	if (gameOverReady) {
		if(lives == 0){
			ctx.drawImage(gameOverImage, 150, 160);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught, 32, 32);
	ctx.fillText("Lives: " + lives, 32, 64);
};

document.getElementById("btn").onclick = function() {
	newGame();
	};

/* myFunction toggles between adding and removing the show class, which is used to hide and show the dropdown content */
function newGame() {
    princessesCaught = 0;
	localStorage.setItem("princessesCaught", princessesCaught);
	lives = 3;
	localStorage.setItem("lives", lives);
	nStones = 1;
	nMonsters = 1;
	localStorage.clear();
	reset();
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
