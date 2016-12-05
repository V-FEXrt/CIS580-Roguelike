(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = exports = CellularAutomata;


function CellularAutomata(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;
  this.percent = percent;

  this.open = 0;
  this.filled = 1;
}

CellularAutomata.prototype.generate = function(){
  this.randomFillMap();
  this.makeCaverns();
  return this.map
}

CellularAutomata.prototype.randomFillMap = function(){
  var mapMiddleX = Math.floor(this.height / 2);
  var mapMiddleY = Math.floor(this.width / 2);

  this.map = [];
  for(var i = 0; i < this.width * this.height; i++){
    this.map.push(this.open);
  }

  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      //column is x, row is y

      // If coordinants lie on the the edge of the map (creates a border)
      if (column == 0 || row == 0 || column == this.width - 1 || row == this.height - 1){
        // y * width + x
        this.map[row * this.width + column] = this.filled;
      }else if(row == mapMiddleX || column == mapMiddleY){
        this.map[row * this.width + column] = this.open;
      }
      else{
        this.map[row * this.width + column] = this.pickTile();
      }
    }
  }
}

CellularAutomata.prototype.pickTile = function() {
  if(this.percent >= rand(100) + 1) return this.filled;
  return this.open;
}

CellularAutomata.prototype.makeCaverns = function(){
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      this.map[row * this.width + column] = this.pickCavernTile(column, row);
    }
  }
}

CellularAutomata.prototype.pickCavernTile = function(x, y){
  var wallCount = this.countAdjacentWalls(x, y, 1, 1);

  if(this.map[y * this.width + x] == this.filled){
    if(wallCount >= 4) return this.filled;
    if(wallCount < 2) return this.open;
  }
  else{
    if(wallCount >= 5) return this.filled;
  }
  return this.open;
}

CellularAutomata.prototype.countAdjacentWalls = function(x, y, scopeX, scopeY){
  var startX = x - scopeX;
  var startY = y - scopeY;
  var endX = x + scopeX;
  var endY = y + scopeY;

  var count = 0;

  for(var iY = startY; iY <= endY; iY++){
    for(var iX = startX; iX <= endX; iX++){
      if(iX == x && iY == y) continue;
      if(this.isWallOrOutOfBounds(iX, iY)) count++;
    }
  }

  return count;
}

CellularAutomata.prototype.isWallOrOutOfBounds = function(x, y){
  return (this.isOutOfBounds(x, y) || this.isWall(x, y));
}

CellularAutomata.prototype.isWall = function(x, y){
  return (this.map[y * this.width + x] != this.open);
}

CellularAutomata.prototype.isOutOfBounds = function(x, y){
  return (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1);
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}

},{}],2:[function(require,module,exports){
"use strict";

module.exports = exports = DebugMap;


function DebugMap(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;
  this.percent = percent;

  this.open = 0;
  this.filled = 1;
}

DebugMap.prototype.generate = function(){
  this.fillMap()
  return this.map
}

DebugMap.prototype.fillMap = function(){
  this.map = [];
  for(var i = 0; i < this.width * this.height; i++){
    this.map.push(this.open);
  }

  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      //column is x, row is y

      // If coordinants lie on the the edge of the map (creates a border)
      if (column == 0 || row == 0 || column == this.width - 1 || row == this.height - 1){
        // y * width + x
        this.map[row * this.width + column] = this.filled;
      }else{
        this.map[row * this.width + column] = this.open;
      }
    }
  }
}

},{}],3:[function(require,module,exports){
"use strict";

const Vector = require('./../vector');

module.exports = exports = RoomsHallways;

function RoomsHallways(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;

  this.numRoomTries = 50;
  this.increaseRoomSize = 0;
  this.windingPercent = 15;
  this.extraConnectorsPercent = 30;

  if(width % 2 == 0 || height % 2 == 0){
    throw new Error("Map must have odd demensions");
  }

  this.open = 0;
  this.filled = 1;

  this.rooms = [];
  this.regions = [];
  this.currentRegion = -1;

  this.cardinal = [
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: -1, y: 0},
    {x: 1, y: 0}
  ];
}

RoomsHallways.prototype.generate = function(){
  this.fillMap();
  this.placeRooms();
  this.carveHallways();
  this.connectRoomsAndHalls();
  this.removeDeadEnds();
  return this.map;
}

RoomsHallways.prototype.removeDeadEnds = function(){
  var done = false;
  while (done == false) {
    done = true;
    for(var y = 0; y < this.height; y++){
      for(var x = 0; x < this.width; x++){
        var point = {x: x, y: y};
        if(this.getTile(point) == this.filled) continue;
        var exits = 0;
        for(var i = 0; i < this.cardinal.length; i++){
          var pos = Vector.add(point, this.cardinal[i])
          if (this.getTile(pos) == this.open) exits++;
        }
        if (exits != 1) continue;

        done = false;
        this.fill(point);
      }
    }
  }
}

RoomsHallways.prototype.fillMap = function(){
  this.map = [];
  for(var i = 0; i < this.width * this.height; i++){
    this.map.push(this.filled);
    this.regions.push(-1);
  }
}

RoomsHallways.prototype.placeRooms = function(){
  for (var i = 0; i < this.numRoomTries; i++) {
      var size = rand(3 + this.increaseRoomSize) * 2 + 1;
      var rectangularity = rand(1 + Math.floor(size / 2)) * 2;
      var width = size;
      var height = size;

      if (Math.random() > 0.5) {
        width += rectangularity;
      } else {
        height += rectangularity;
      }

      var x = rand(Math.floor((this.width - width) / 2)) * 2 + 1;
      var y = rand(Math.floor((this.height - height) / 2)) * 2 + 1;

      var room = Rect(x, y, width, height);

      var overlaps = false;
      for(var i = 0; i < this.rooms.length; i++){
          if(collision(room, this.rooms[i])){
            overlaps = true;
            break;
          }
      }

      if (overlaps) continue;
      this.currentRegion++;
      this.rooms.push(room);

      var self = this;
      RectPoints(room).forEach(function(point){
        self.carve(point);
      });
    }
}

RoomsHallways.prototype.carveHallways = function(){
  for (var y = 1; y < this.height; y += 2) {
    for (var x = 1; x < this.width; x += 2) {
      var pos = {x: x, y: y};
      if (this.getTile(pos) != this.filled) continue;
      this.growMaze(pos);
    }
  }
}

RoomsHallways.prototype.connectRoomsAndHalls = function(){
  while(this.countRegions() > 1){
    var point;
    do{
      var x = rand(this.width);
      var y = rand(this.height);
       point = {x: x, y: y};
    }while(this.getTile(point) != this.filled);

    var surrRegions = new Set();
    for(var i = 0; i < this.cardinal.length; i++){
      var r = this.getRegion(Vector.add(point, this.cardinal[i]))
      if(r != -1) surrRegions.add(r);
    }

    if(surrRegions.size > 1){
      this.carve(point);
      var first = -1
      var rest = []
      surrRegions.forEach(function(value) {
        if(first == -1){
          first = value;
        }else{
          rest.push(value);
        }
      });
      var self = this;
      rest.forEach(function(region) {
        self.replaceRegion(region, first);
      })
      //console.log(first);
      this.regions[point.y * this.width + point.x] = first;
    }
  }

  // Add extra doors to 1/2 of the rooms
  var self = this;
  this.rooms.forEach(function(room){
    if(Math.random() > 1 - (self.extraConnectorsPercent / 100)) return;
    var point;
    do{
      point = pickAdjacent(room);
    } while (point.x == 0 || point.y == 0 || point.x >= self.width || point.y >= self.height);

    self.carve(point);
  });
}

RoomsHallways.prototype.growMaze = function(start){
  var cells = [];
  var lastDir = {x: 0, y: 0};

  this.currentRegion++;
  this.carve(start);

  cells.push(start);
  while (cells.length != 0) {
    var cell = cells[cells.length -  1];

    var openAdjacent = [];

    for(var i = 0; i < this.cardinal.length; i++){
      if (this.canCarve(cell, this.cardinal[i])) openAdjacent.push(this.cardinal[i]);
    }

    if (openAdjacent.length != 0) {
      var dir;
      if (openAdjacent.indexOf(lastDir) != -1 && (rand(100) + 1) > this.windingPercent) {
        dir = lastDir;
      } else {
        dir = openAdjacent[rand(openAdjacent.length)];
      }

      var pos = Vector.add(cell, dir);
      this.carve(pos);
      pos = Vector.add(pos, dir);
      this.carve(pos);

      cells.push(pos);
      lastDir = dir;
    } else {
      // No adjacent uncarved cells.
      cells.pop();

      // This path has ended.
      lastDir = {x: 0, y: 0};
    }
  }
}

RoomsHallways.prototype.canCarve = function(pos, direction) {
    var point = Vector.add(pos, Vector.scale(direction, 3));
    if(point.x >= this.width || point.y >= this.height) return false;

    point = Vector.add(pos, Vector.scale(direction, 2));
    // Destination must not be open.
    return this.getTile(point) == this.filled;
}
RoomsHallways.prototype.carve = function(pos){
  this.regions[pos.y * this.width + pos.x] = this.currentRegion;
  this.map[pos.y * this.width + pos.x] = this.open;
}
RoomsHallways.prototype.fill = function(pos){
  this.regions[pos.y * this.width + pos.x] = -1;
  this.map[pos.y * this.width + pos.x] = this.filled;
}
RoomsHallways.prototype.getTile = function(pos){
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) return -1;
  return this.map[pos.y * this.width + pos.x];
}
RoomsHallways.prototype.getRegion = function(pos){
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) return -1;
  return this.regions[pos.y * this.width + pos.x];
}
RoomsHallways.prototype.replaceRegion = function(region, replacement){
  for(var i = 0; i < this.width * this.height; i++){
    if(this.regions[i] == region) this.regions[i] = replacement;
  }
}

RoomsHallways.prototype.countRegions = function(){
  var x = new Set(this.regions);
  return x.size - 1;
}


function RectPoints(rect){
  var points = [];
  for(var i = rect.position.x; i < rect.position.x + rect.size.width; i++){
    for(var j = rect.position.y; j < rect.position.y + rect.size.height; j++){
      points.push({x: i, y: j});
    }
  }
  return points;
}

function Rect(x, y, width, height){
  return {
    position: {
      x: x,
      y: y
    },
    size: {
      width: width,
      height: height
    }
  }
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}

function collision(rect1, rect2){
  return !(
    (rect1.position.y + rect1.size.height < rect2.position.y) ||
    (rect1.position.y > rect2.position.y + rect2.size.height) ||
    (rect1.position.x > rect2.position.x + rect2.size.width) ||
    (rect1.position.x + rect1.size.width < rect2.position.x))
}

function pickAdjacent(room) {
  var side = rand(4);
  var y;
  var x;
  if(side % 2 == 0){
    y = (side == 0) ? room.position.y - 1 : room.position.y + room.size.height;
    x = rand(room.size.width) + room.position.x;
  }else{
    x = (side == 1) ? room.position.x - 1 : room.position.x + room.size.width;
    y = rand(room.size.height) + room.position.y;
  }
  return {x: x, y: y};
}

},{"./../vector":24}],4:[function(require,module,exports){
"use strict";

window.debug = false;

/* Classes and Libraries */
const Game = require('./game');
const EntityManager = require('./entity_manager');
const EntitySpawner = require('./entity_spawner');
const Tilemap = require('./tilemap');
const tileset = require('../tilemaps/tiledef.json');
const Player = require('./player');
const Pathfinder = require('./pathfinder.js');
const CombatController = require("./combat_controller");
const Vector = require('./vector');
const Click = require('./click');
const Stairs = require('./stairs');
const ProgressManager = require('./progress_manager');
const GUI = require('./gui');
const Terminal = require('./terminal.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
window.entityManager = new EntityManager();
var fadeAnimationProgress = new ProgressManager(0, function () { });
var isFadeOut = true;
var screenSize = { width: 1056, height: 672 };

window.combatController = new CombatController();

window.terminal = new Terminal();
window.terminal.log("Welcome to Roguelike");
window.terminal.log("Good luck!");

var gui = new GUI(screenSize);

var tilemap = new Tilemap(screenSize, 65, 65, tileset, {
  onload: function () {
    masterLoop(performance.now());
  }
});

var pathfinder = new Pathfinder(tilemap);
window.pathfinder = pathfinder;
window.tilemap = tilemap;

var input = {
  up: false,
  down: false,
  left: false,
  right: false
}

var backgroundMusic = new Audio('sounds/tempBGMusic.wav');
backgroundMusic.volume = 0.3;
backgroundMusic.addEventListener('ended', function () {
  setNewMusic();
}, false);
backgroundMusic.play();

var setNewMusic = function () {
  var backgroundMusicOnLoop = new Audio('sounds/tempBGMusicLoop.wav');
  backgroundMusicOnLoop.volume = 0.3;
  backgroundMusicOnLoop.loop = true;
  backgroundMusicOnLoop.play();
}

var turnTimer = 0;
var defaultTurnDelay = 400;     //Default turn between turns
var turnDelay = defaultTurnDelay; //current time between turns
var autoTurn = false;           //If true, reduces time between turns and turns happen automatically
var resetTimer = true;          //Take turn immediately on movement key press if true

var player = new Player({ x: 0, y: 0 }, tilemap, "Mage");

window.player = player;

window.onmousemove = function (event) {
  gui.onmousemove(event);
}

window.onmousedown = function (event) {
  // Init the level when class is chosen
  if (gui.state == "start" || gui.state == "choose class") {
    gui.onmousedown(event);
    if (gui.chosenClass != "") {
      player.changeClass(gui.chosenClass);
      nextLevel(false);
    }
  }
}

canvas.onclick = function (event) {
  var node = {
    x: parseInt(event.offsetX / 96),
    y: parseInt(event.offsetY / 96)
  }

  var clickedWorldPos = tilemap.toWorldCoords(node);
  window.entityManager.addEntity(new Click(clickedWorldPos, tilemap, player, function (enemy) {
    var distance = Vector.distance(player.position, enemy.position);
    if (distance.x <= player.combat.weapon.range && distance.y <= player.combat.weapon.range) {
      turnDelay = defaultTurnDelay;
      autoTurn = false;
      combatController.handleAttack(player.combat, enemy.combat);
      processTurn();
    }
  }));
}

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function (event) {
  if (window.terminal.onkeydown(event)) return;
  switch (event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "Shift":
      event.preventDefault();
      turnDelay = defaultTurnDelay / 2;
      autoTurn = true;
      break;
  }
}

/**
 * @function onkeyup
 * Handles keyup events
 */
window.onkeyup = function (event) {
  switch (event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      break;
    case "Shift":
      turnDelay = defaultTurnDelay;
      autoTurn = false;
      break;
  }
  if (!(input.left || input.right || input.up || input.down)) resetTimer = true;
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function (timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  gui.update(elapsedTime);
  if (input.left || input.right || input.up || input.down || autoTurn) {
    turnTimer += elapsedTime;
    if (turnTimer >= turnDelay) {
      turnTimer = 0;
      processTurn();
    }
  }
  window.entityManager.update(elapsedTime);
  fadeAnimationProgress.progress(elapsedTime);
  window.terminal.update(elapsedTime);
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  tilemap.render(ctx);
  entityManager.render(elapsedTime, ctx);

  ctx.save();
  ctx.globalAlpha = (isFadeOut) ? fadeAnimationProgress.percent : 1 - fadeAnimationProgress.percent;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.fillRect(1060, 0, 273, 672);

  ctx.fillStyle = "white";
  ctx.fillRect(1057, 0, 2, 672);
  window.terminal.render(elapsedTime, ctx);

  gui.render(elapsedTime, ctx);
}

/**
  * @function processTurn
  * Proccesses one turn, updating the states of all entities.
  */
function processTurn() {
  window.entityManager.processTurn(input);
}

function nextLevel(fadeOut) {
  player.level++;
  var init = function () {
    // clear terminal
    window.terminal.clear();
    window.terminal.log("   ---===| LEVEL " + player.level + " |===---");

    // reset entities
    window.entityManager.reset();

    var regen = false;

    do {
      //reset the regen flag
      regen = false;

      //gen new map
      tilemap.changeTileset();
      tilemap.generateMap();

      //move player to valid location
      var pos = tilemap.findOpenSpace();
      player.position = { x: pos.x, y: pos.y };
      tilemap.moveTo({ x: pos.x - 5, y: pos.y - 3 });

      // allow player to move
      player.shouldProcessTurn = true;

      // Find stairs location that is at least 8 away.
      var pos;
      var dist;
      var iterations = 0;
      do {
        pos = tilemap.findOpenSpace();
        dist = pathfinder.findPath(player.position, pos).length
        iterations++;
        if (iterations > 20) {
          regen = true;
          break;
        }
      } while (dist == 0 && dist < 8);

    } while (regen);

    // add player
    window.entityManager.addEntity(player);
    // add stairs
    window.entityManager.addEntity(new Stairs(pos, tilemap, function () { nextLevel(true) }));
    //place new entities
    EntitySpawner.spawn(player, tilemap, 30, [20, 20, 20, 20, 20, 0, 0, 0]);

    unfadeFromBlack();

  };

  (fadeOut) ? fadeToBlack(init) : init()
}

function fadeToBlack(completion) {
  isFadeOut = true;
  fadeAnimationProgress = new ProgressManager(1000, completion);
  fadeAnimationProgress.isActive = true;
}

function unfadeFromBlack() {
  isFadeOut = false;
  fadeAnimationProgress = new ProgressManager(1000, function () { });
  fadeAnimationProgress.isActive = true;
}

},{"../tilemaps/tiledef.json":26,"./click":6,"./combat_controller":8,"./entity_manager":10,"./entity_spawner":11,"./game":12,"./gui":13,"./pathfinder.js":16,"./player":17,"./progress_manager":19,"./stairs":21,"./terminal.js":22,"./tilemap":23,"./vector":24}],5:[function(require,module,exports){
"use strict";

module.exports = exports = Armor;

function Armor(aName) {
    this.type = "Armor";
    this.name = aName;
    this.level = 0;
    this.shouldRetain = true;

    switch (aName) {
        case "Flesh":
            this.defense = 3;
            this.strongType = "";
            this.weakType = "spb";
            break;

        case "Robes":
            this.defense = 5;
            this.strongType = "spb"; // Purely for balance.
            this.weakType = "";
            break;

        case "Hide Armor":
            this.defense = 6;
            this.strongType = "b";
            this.weakType = "s";
            break;

        case "Leather Armor":
            this.defense = 10;
            this.strongType = "s";
            this.weakType = "b";
            break;

        case "Chainmail":
            this.defense = 14;
            this.strongType = "s";
            this.weakType = "p";
            break;

        case "Plate Armor":
            this.defense = 18;
            this.strongType = "p";
            this.weakType = "b";
            break;
    }

    // static properties for entities
    this.position = { x: -1, y: -1 };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/powerup.png';

    this.currY = 0;
    this.movingUp = true;
}

Armor.prototype.collided = function (aEntity) {
    if (aEntity.type == "Player") {
        aEntity.inventory.addArmor(this);
        this.shouldRetain = false;
    }
}

Armor.prototype.processTurn = function () {

}

Armor.prototype.retain = function () {
    return this.shouldRetain;
}

Armor.prototype.update = function () {
    if (this.currY >= 5) this.movingUp = false;
    else if (this.currY <= -5) this.movingUp = true;
    if (this.movingUp) this.currY += .2;
    else this.currY -= .2;
}

Armor.prototype.render = function (time, ctx) {
    var position = window.tilemap.toScreenCoords(this.position);
    ctx.drawImage(this.spritesheet, 305, 225, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);

}

},{}],6:[function(require,module,exports){
"use strict";

module.exports = exports = Click;

function Click(position, tilemap, player, collisionCallback) {
  this.type = "Click";
  this.position = { x: position.x, y: position.y };
  // To change AOE change size of the click.
  this.size = {
    width: 96,
    height: 96
  }

  this.shouldRetain = true;
  this.tilemap = tilemap;
  this.player = player;
  this.collisionCallback = collisionCallback;
  this.color = "green"
}

Click.prototype.update = function (time) {
}

Click.prototype.processTurn = function (input) {
  this.shouldRetain = false;
}

Click.prototype.collided = function (entity) {
  if(entity.type == "Enemy"){
    this.collisionCallback(entity);
    // only call once, will need to change for AOE and only call once per enemy instance
    this.collisionCallback = function(){}
  }
}

Click.prototype.retain = function () {
    return this.shouldRetain;
}

Click.prototype.render = function (elapsedTime, ctx) {
  if(window.debug){
    var position = this.tilemap.toScreenCoords(this.position);
    ctx.fillStyle = this.color;
    ctx.fillRect(position.x * this.size.width, position.y * this.size.height, this.size.width, this.size.height);
    this.color = "green"
  }
}

},{}],7:[function(require,module,exports){
"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');

// weapon/armor shouldnt be done here...
// they can still be stored here if necessary, but 
// I think it might make more sense to have them 
// directly on the player/enemy?
const Weapon = require("./weapon");
const Armor = require("./armor");

module.exports = exports = CombatClass;

function CombatClass(aName) {
    this.name = aName;
    switch (aName) {
        case "Knight":
            this.health = 20;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Longsword", 1);
            this.armor = new Armor("Hide Armor"); // No restrictions on Armor types
            this.attackType = "Melee";
            this.status = { effect: "None", timer: 0 }
            break;

        case "Archer":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Broadhead", 1);
            this.armor = new Armor("Hide Armor"); // Can't wear Chain or Plate
            this.attackType = "Ranged";
            this.status = { effect: "None", timer: 0 }
            break;

        case "Mage":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Eldritch Blast", 1);
            this.armor = new Armor("Robes"); // Can only wear Robes, nothing else
            this.attackType = "Magic";
            this.status = { effect: "None", timer: 0 }
            break;


        case "Zombie":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Claw", 1);
            this.armor = new Armor("Flesh");
            this.attackType = "Melee";
            this.status = { effect: "None", timer: 0 }
            this.senseRange = 5;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    if (path.length > 1) aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "EnemyRanged":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Broadhead", 1);
            this.armor = new Armor("Hide Armor");
            this.attackType = "Ranged";
            this.status = { effect: "None", timer: 0 }
            this.senseRange = 10;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    if (path.length > 1) aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Captain":
            this.health = 25;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Battleaxe", 1);
            this.armor = new Armor("Chainmail");
            this.attackType = "Melee";
            this.status = { effect: "None", timer: 0 }
            this.senseRange = 15;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    if (path.length > 1) aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Shaman":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Eldritch Blast", 1);
            this.armor = new Armor("Robes");
            this.attackType = "Magic";
            this.status = { effect: "None", timer: 0 }
            this.senseRange = 10;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    if (path.length > 1) aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;
    }
}


},{"./armor":5,"./tilemap":23,"./vector":24,"./weapon":25}],8:[function(require,module,exports){
"use strict";

module.exports = exports = CombatController;

const CombatClass = require("./combat_class");
const Weapon = require("./weapon");
const Armor = require("./armor");
const RNG = require("./rng");

function CombatController() {

}

CombatController.prototype.handleAttack = function (aAttackerClass, aDefenderClass) {
    var lAttackBase = Math.floor(aAttackerClass.attackBonus);
    var lAttackBonus = aAttackerClass.weapon.hitBonus;
    var lAttackRoll = RNG.rollRandom(1, 20);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;
    var lAttackEffect = aAttackerClass.weapon.attackEffect;

    var lDefenseBase = aDefenderClass.armor.defense;
    var lDefenseBonus = Math.floor(aDefenderClass.defenseBonus);
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerClass.weapon.level - 1;
    var lDamageMax = aAttackerClass.weapon.damageMax;
    var lDamageMin = aAttackerClass.weapon.damageMin;
    var lDamageRoll = RNG.rollRandom(lDamageMin, lDamageMax);
    var lDamageBonus = Math.floor(aAttackerClass.damageBonus);
    var lDamageTotal = lDamageBase + lDamageBonus + lDamageRoll;

    var lApplyEffect = false;

    var message;
    var attacker = aAttackerClass.name;
    var defender = aDefenderClass.name;
    var playerAttacker = (attacker == "Knight" || attacker == "Archer" || attacker == "Mage");

    if (lAttackRoll == 1) {
        var lSelfDamage = RNG.rollMultiple(1, 3, aAttackerClass.weapon.level);
        aAttackerClass.health -= lSelfDamage;
        if (aAttackerClass.health <= 0) { // Crit fail cant kill an entity
            lSelfDamage - (1 - aAttackerClass.health);
            aAttackerClass.health = 1;
        }
        // attacker hit itself, play attacker hit sound

        // If attacker is player
        if (playerAttacker) {
            message = `You critically fail your attack and hurt yourself for ${lSelfDamage} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker} critically fails its attack and takes ${lSelfDamage} damage.`;
        }
    } else if (lAttackRoll == 20 || (lAttackRoll == 19 && (aAttackerClass.attackType == "Ranged" || aAttackerClass.weapon.name == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderClass.health -= lDamageTotal;
        // defender hit, play defender hit sound

        if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(25, 75);

        // If attacker is player
        if (playerAttacker) {
            message = `Your attack is perfect, striking the ${defender} for ${lDamageTotal} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker}'s attack is perfect, striking you for ${lDamageTotal} damage.`;
        }
    } else {
        if (lAttackTotal > lDefenseTotal || aAttackerClass.weapon.name == "Magic Missile") {
            aDefenderClass.health -= lDamageTotal;
            // defender hit, play defender hit sound

            if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(50, 50);

            // If attacker is player
            if (playerAttacker) {
                message = `Your attack strikes the ${defender} for ${lDamageTotal} damage.`;
            } else { // attacker is enemy
                message = `The ${attacker}'s attack strikes you for ${lDamageTotal} damage.`;
            }
        } else {
            // If attacker is player
            if (playerAttacker) {
                message = `Your attack misses the ${defender}.`;
            } else { // attacker is enemy
                message = `The ${attacker}'s attack misses you.`;
            }
        }
    }

    if (aDefenderClass.health <= 0) message = message.replace(".", ", killing it.");
    window.terminal.log(message);
    if (lApplyEffect) {
        aDefenderClass.status.effect = lAttackEffect;
        aDefenderClass.status.timer = 2;
        window.terminal.log(`The ${defender} is now ${lAttackEffect}.`);
    }
}

CombatController.prototype.handleStatus = function (aCombatClass) {
    switch (aCombatClass.status.effect) {
        case "Burned":
        case "Poisoned":
            if (aCombatClass.status.timer > 0) {
                aCombatClass.status.timer--;
                var damage = RNG.rollMultiple(1, 5, window.player.level);
                aCombatClass.health -= damage;
                window.terminal.log(`${damage} ${aCombatClass.status.effect.substring(0, aCombatClass.status.effect.length - 2)} damage.`);
            } else {
                aCombatClass.status.effect == "None";
            }
            break;

        case "Frozen":
            switch (aCombatClass.status.timer) {
                case 2:
                    aCombatClass.status.timer--;
                    window.terminal.log("Frozen");
                    return;

                case 1:
                    if (RNG.rollWeighted(50, 50)) aCombatClass.status.timer--;
                    else window.terminal.log("Frozen");

                case 0:
                    aCombatClass.status.effect = "None";
                    break;
            }
            break;

        default:
            return;
    }
}

CombatController.prototype.randomDrop = function (aPosition) {
    var lDrop = new Object();
    var lRand = RNG.rollRandom(1, 20); // need to set up weighted rands
    if (lRand > 17) {                           // spawn armor
        lDrop.type = "Armor";
        // TODO > properly implement...
        lDrop = new Armor("Leather Armor");
    } else if (lRand >= 1 && lRand < 17) {      // spawn weapon
        lDrop.type = "Weapon";
        var playerClass = window.player.class;
        var level = RNG.rollRandom(window.player.level, window.player.level + 2); // need to set up weighted rands
        switch (lRand % 4) {
            // this is awful, why is this still here?
            case 0:
                lDrop = (playerClass == "Knight") ? new Weapon("Longsword", level) : (playerClass == "Archer") ? new Weapon("Bodkin", level) : new Weapon("Magic Missile", level);
                break;

            case 1:
                lDrop = (playerClass == "Knight") ? new Weapon("Morning Star", level) : (playerClass == "Archer") ? new Weapon("Broadhead", level) : new Weapon("Fireball", level);
                break;

            case 2:
                lDrop = (playerClass == "Knight") ? new Weapon("Halberd", level) : (playerClass == "Archer") ? new Weapon("Poison-Tipped", level) : new Weapon("Frostbolt", level);
                break;

            case 3:
                lDrop = (playerClass == "Knight") ? new Weapon("Battleaxe", level) : (playerClass == "Archer") ? new Weapon("Heavy Bolts", level) : new Weapon("Eldritch Blast", level);
                break;
        }
    } else {                                    // dont spawn anything
        lDrop.type = "None";
    }
    lDrop.position = aPosition;
    return lDrop;
}


},{"./armor":5,"./combat_class":7,"./rng":20,"./weapon":25}],9:[function(require,module,exports){
"use strict";

const Tilemap = require('./tilemap');
const CombatClass = require("./combat_class");

module.exports = exports = Enemy;

function Enemy(position, tilemap, combatClass, target, onDeathCB) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.tilemap = tilemap;
    this.spritesheet = new Image();
    this.spritesheet.src = "./spritesheets/sprites.png";
    this.type = "Enemy";
    this.class = combatClass;
    this.combat = new CombatClass(this.class);
    this.target = target;
    this.onDeathCB = onDeathCB;

    // console.log(this.position.x + " " + this.position.y);
}

Enemy.prototype.processTurn = function() {
    if (this.combat.status.effect != "None") window.combatController.handleStatus(this.combat);
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead" || this.combat.status.effect == "Frozen") return;

    this.combat.turnAI(this);
}

Enemy.prototype.update = function(time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) {
        this.state = "dead";
    }
}

Enemy.prototype.collided = function(entity) {

}

Enemy.prototype.retain = function() {
    if (this.combat.health <= 0) {
        this.onDeathCB(this.position, this.tilemap);
        return false;
    } else {
        return true;
    }
}

Enemy.prototype.render = function(elapsedTime, ctx) {
    if (this.state == "dead") return; // shouldnt be necessary

    var position = this.tilemap.toScreenCoords(this.position);
    ctx.drawImage(
        this.spritesheet,
        768, 576, // skeleton guy
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}


},{"./combat_class":7,"./tilemap":23}],10:[function(require,module,exports){
"use strict";

/**
 * @module exports the Car class
 */
module.exports = exports = EntityManager;

/**
 * @constructor car
 * Creates a new EntityManager object
 */
function EntityManager() {
  this.entities = [];
}

EntityManager.prototype.addEntity = function(entity) {
  checkType(entity);
  this.entities.push(entity);
}

EntityManager.prototype.destroyEntity = function(entity){
  var idx = this.entities.indexOf(entity);
  this.entities.splice(idx, 1);
}

EntityManager.prototype.reset = function() {
  this.entities = [];
}

EntityManager.prototype.update = function(elapsedTime) {
  var toBeDestroyed = [];
  var self = this;
  this.entities.forEach(function(entity){
    if(entity.retain()){
      entity.update(elapsedTime);
    }
    else{
      toBeDestroyed.push(entity);
    }
  });

  toBeDestroyed.forEach(function(entity){
    self.destroyEntity(entity);
  });

  this.entities.sort(function(a,b){return a.position.x - b.position.x});

  // The active list will hold all balls
  // we are currently considering for collisions
  var active = [];

  // The potentially colliding list will hold
  // all pairs of balls that overlap in the x-axis,
  // and therefore potentially collide
  var potentiallyColliding = [];

  // For each ball in the axis list, we consider it
  // in order
  this.entities.forEach(function(entity, aindex){
    // remove balls from the active list that are
    // too far away from our current ball to collide
    // The Array.prototype.filter() method will return
    // an array containing only elements for which the
    // provided function's return value was true -
    // in this case, all balls that are closer than 30
    // units to our current ball on the x-axis
    active = active.filter(function(oentity){
      var e1r = entity.size.width / 2;
      var e2r = oentity.size.width / 2;
      return ((entity.position.x * 96) + e1r) - ((oentity.position.x * 96) + e2r)  < e1r + e2r;
    });
    // Since only balls within colliding distance of
    // our current ball are left in the active list,
    // we pair them with the current ball and add
    // them to the potentiallyColliding array.
    active.forEach(function(oentity, bindex){
      potentiallyColliding.push({a: oentity, b: entity});
    });
    // Finally, we add our current ball to the active
    // array to consider it in the next pass down the
    // axisList
    active.push(entity);
  });

  // At this point we have a potentaillyColliding array
  // containing all pairs overlapping in the x-axis.  Now
  // we want to check for REAL collisions between these pairs.
  // We'll store those in our collisions array.
  var collisions = [];
  potentiallyColliding.forEach(function(pair){
    if(collision(pair.a, pair.b)) {
      // Color the collision pair for visual debugging
      pair.a.color = 'red';
      pair.b.color = 'red';
      // Push the colliding pair into our collisions array
      collisions.push(pair);
    }
  });

  collisions.forEach(function(pair){
    pair.a.collided(pair.b);
    pair.b.collided(pair.a);
  })
}

EntityManager.prototype.render = function(elapsedTime, ctx) {
  this.entities.forEach(function(entity){
    entity.render(elapsedTime, ctx);
  });
}

EntityManager.prototype.processTurn = function(input) {
  this.entities.forEach(function(entity){
    entity.processTurn(input);
  });
}

function checkType(entity){
  if(typeof entity == 'undefined') failType();
  if(typeof entity.position == 'undefined') failType();
  if(typeof entity.position.x == 'undefined') failType();
  if(typeof entity.position.y == 'undefined') failType();
  if(typeof entity.size == 'undefined') failType();
  if(typeof entity.size.width == 'undefined') failType();
  if(typeof entity.size.height == 'undefined') failType();
  if(typeof entity.collided == 'undefined') failType();
  if(typeof entity.processTurn == 'undefined') failType();
  if(typeof entity.retain == 'undefined') failType();
  if(typeof entity.update == 'undefined') failType();
  if(typeof entity.render == 'undefined') failType();
  if(typeof entity.type == 'undefined') failType();
}

function failType(){
  throw new Error("Object doesn't match type defination for 'Entity'");
  /*
  // Things that must be implemented for the entity manager

  // Properties used for collision
  entity.size.width
  entity.size.height
  entity.position.x
  entity.position.y

  // Informs entity that it collided with the other entity
  entity.collided(withEntity) // returns nothing

  // Handle turn based updates. i.e. moving or attacking
  entity.processTurn(input) // returns nothing

  // Tells entity manager if this entity should be destroyed.
  entity.retain() // return true to to stay in game, return false to be removed from the game

  // Name of the class as a string. Pascal case
  // entity.type = "Type"
  */
}

function collision(entity1, entity2){
  return !(
    ((entity1.position.y * 96) + (entity1.size.height - 1) < (entity2.position.y * 96)) ||
    ((entity1.position.y  * 96) > (entity2.position.y * 96) + (entity2.size.height - 1)) ||
    ((entity1.position.x  * 96) > (entity2.position.x * 96) + entity2.size.width) ||
    ((entity1.position.x  * 96) + entity1.size.width < (entity2.position.x * 96)))

}

},{}],11:[function(require,module,exports){
"use strict";

const Enemy = require('./enemy');
const Powerup = require('./powerup');
const RNG = require('./rng');

/**
 * @module EntitySpawner
 * A class representing a EntitySpawner
 */
 module.exports = exports = {
   spawn: spawn,
   drop: spawnDrop
 }

 var pu = 0;
 var en = 0;
/**
 * @constructor EntitySpawner
 * Creates a EntitySpawner
 */
var spawnArray = [
  function(){ spawnPowerup(1); },
  function(){ spawnPowerup(2); },
  function(){ spawnPowerup(3); },
  function(){ spawnPowerup(4); },
  function(){ spawnEnemy("Zombie"); },
  function(){ spawnEnemy("EnemyRanged"); },
  function(){ spawnEnemy("Captain"); },
  function(){ spawnEnemy("Shaman"); },
]

var tilemap;
var player;
 // percents should be an array of the percent everything should be spawned. in this format
 // [ crystal, red potion, blue potion, green potion, Zombie, EnemyRanged, Captain, Shaman ]
function spawn(aPlayer, tmap, count, percents) {
  tilemap = tmap;
  player = aPlayer;
  for(var i = 0; i < count; i++){
    var idx = RNG.rollWeighted(
      percents[0],
      percents[1],
      percents[2],
      percents[3],
      percents[4],
      percents[5],
      percents[6],
      percents[7]
    );
    //window.terminal.log(""+idx, 'lime');
    spawnArray[idx]()
  }
  if(window.debug){
    console.log(pu + " powerups spawned");
    console.log(en + " enemies spawned");
  }
}

function spawnPowerup(pType){
  pu++;
  window.entityManager.addEntity(new Powerup(tilemap.findOpenSpace(), tilemap, pType));
}

function spawnEnemy(eType){
  en++;
  window.entityManager.addEntity(new Enemy(tilemap.findOpenSpace(), tilemap, eType, player, spawnDrop))
}

function spawnDrop(position){
  pu++;
  var drop = window.combatController.randomDrop(position);
  if(drop.type != "None") window.entityManager.addEntity(drop);
}

},{"./enemy":9,"./powerup":18,"./rng":20}],12:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],13:[function(require,module,exports){
"use strict";

/**
 * @module exports the GUI class
 */
module.exports = exports = GUI;

/**
 * @constructor GUI
 * Creates a new GUI object
 * @param {postition} position object specifying an x and y
 */
function GUI(size) {
  this.state = "start";
  this.size = size;
  this.playerSprites = new Image();
  this.playerSprites.src = './spritesheets/sprites.png';
  this.startSprites = new Image();
  this.startSprites.src = './spritesheets/start.png';
  this.highlightSize = 10;
  
  this.swordHighlights = [0, 0, 0];
  this.swordYPos = [288, 384, 480];
  
  this.playerHighlights = [0, 0, 0];
  this.playerXPos = [336, 480, 624];
  
  this.titleMinY = 75;
  this.titleY = 75;
  this.titleMaxY = 80;
  this.titleDirection = 1;
  
  this.chosenClass = "";
}

var x, y;
GUI.prototype.onmousemove = function(event)
{
	x = event.offsetX;
	y = event.offsetY;
	if(this.state == "start")
	{
		if(x >= 384 && x <= 672)
		{
			if(y >= this.swordYPos[0] + 20 && y <= this.swordYPos[0] + 76)
			{
				this.swordHighlights[0] = this.highlightSize;
			}
			else if(y >= this.swordYPos[1] + 20 && y <= this.swordYPos[1] + 76)
			{
				this.swordHighlights[1] = this.highlightSize;
			}
			else if(y >= this.swordYPos[2] + 20 && y <= this.swordYPos[2] + 76)
			{
				this.swordHighlights[2] = this.highlightSize;
			}
			else this.swordHighlights = [0, 0, 0];
		}
		else this.swordHighlights = [0, 0, 0];
	}
	else if(this.state == "choose class")
	{
		if(y >= 288 && y <= 384)
		{
			if(x >= this.playerXPos[0] + 20 && x <= this.playerXPos[0] + 76)
			{
				this.playerHighlights[0] = this.highlightSize;
			}
			else if(x >= this.playerXPos[1] + 20 && x <= this.playerXPos[1] + 76)
			{
				this.playerHighlights[1] = this.highlightSize;
			}
			else if(x >= this.playerXPos[2] + 20 && x <= this.playerXPos[2] + 76)
			{
				this.playerHighlights[2] = this.highlightSize;
			}
			else this.playerHighlights = [0, 0, 0];
		}
		else this.playerHighlights = [0, 0, 0];
	}
}

GUI.prototype.onmousedown = function(event)
{
	if(this.state == "start")
	{
		if(this.swordHighlights[0] != 0)
		{
			this.state = "choose class";
		}
		else if(this.swordHighlights[1] != 0)
		{
            //this.state = "controls";
		}
		else if(this.swordHighlights[2] != 0)
		{
            //this.state = "credits";
		}
	}
    else if(this.state == "choose class")
    {
        if(this.playerHighlights[0] != 0)
		{
			//Knight
            this.chosenClass = "Knight";
            this.state = "playing";
		}
		else if(this.playerHighlights[1] != 0)
		{
            //Archer
            this.chosenClass = "Archer";
            this.state = "playing";
		}
		else if(this.playerHighlights[2] != 0)
		{
            //Mage
            this.chosenClass = "Mage";
            this.state = "playing";
		}
    }
}

/**
 * @function updates the GUI objects
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
GUI.prototype.update = function (time) {
	if(this.state == "start")
	{
		if(this.titleY >= this.titleMaxY)
		{
			this.titleDirection = -1;
		}
		else if(this.titleY <= this.titleMinY)
		{
			this.titleDirection = 1;
		}
		
		this.titleY += this.titleDirection/10;
	}
}

/**
 * @function renders the GUI into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
GUI.prototype.render = function (elapsedTime, ctx) {
	ctx.imageSmoothingEnabled = false;

  if(this.state == "start")
  {
	//Background
	ctx.drawImage(
		this.startSprites,
		0, 0,
		this.size.width,
		this.size.height,
		0, 0,
		this.size.width,
		this.size.height
	);
	
	//Shadow
	ctx.drawImage(
		this.startSprites,
		0, 1056,
		480, 480,
		285, 96,
		480, 480
	);
	
	//Title
	ctx.drawImage(
		this.startSprites,
		0, 768,
		576, 288,
		285, this.titleY,
		576, 288
	);
	
	//Start Game
	ctx.drawImage(
		this.startSprites,
		0, 672,
		288, 96,
		384 - this.swordHighlights[0]/2, 288 - this.swordHighlights[0]/2,
		288 +this.swordHighlights[0], 96 + this.swordHighlights[0]
	);
	
	//Controls
	ctx.drawImage(
		this.startSprites,
		288, 672,
		288, 96,
		384 - this.swordHighlights[1]/2, 384 - this.swordHighlights[1]/2,
		288 +this.swordHighlights[1], 96 + this.swordHighlights[1]
	);
	
	//Credits
	ctx.drawImage(
		this.startSprites,
		576, 672,
		288, 96,
		384 - this.swordHighlights[2]/2, 480 - this.swordHighlights[2]/2,
		288 +this.swordHighlights[2], 96 + this.swordHighlights[2]
	);
  }
  else if(this.state == "choose class")
  {
  	//Background
	ctx.drawImage(
		this.startSprites,
		0, 0,
		this.size.width,
		this.size.height,
		0, 0,
		this.size.width,
		this.size.height
	);
	
    //Shadow
    ctx.drawImage(
        this.startSprites,
        672, 1248,
        480, 384,
        288, 165,
        480, 384
    );
    
	//Nameplates
	ctx.drawImage(
		this.startSprites,
		576, 768,
		672, 480,
		192, 96,
		672, 480
	);
	
	ctx.fillStyle = "lightgrey";   
    ctx.strokeStyle = "grey";
    ctx.lineWidth =  10;

    ctx.fillRect(x, y, this.size.width/2, this.size.height/3);
    ctx.strokeRect(x, y, this.size.width/2, this.size.height/3);
    var x = this.size.width/4;
    var y = this.size.height/3;
    ctx.font = "20px Arial"
    ctx.fillStyle = "black"
	
	//Knight
    ctx.drawImage(
      this.playerSprites,
      96, 96 *5,
      96 , 96,
      this.playerXPos[0] - this.playerHighlights[0]/2, 282 - this.playerHighlights[0]/2,
      96 + this.playerHighlights[0], 96 + this.playerHighlights[0]
    );
    
	//Archer
    ctx.drawImage(
      this.playerSprites,
      96 * 7, 96 *6,
      96 , 96,
      this.playerXPos[1]  - this.playerHighlights[1]/2, 282  - this.playerHighlights[1]/2,
	  96 + this.playerHighlights[1], 96 + this.playerHighlights[1]
    );
    
	//Mage
    ctx.drawImage(
      this.playerSprites,
      96*9, 96 *5,
      96 , 96,
      this.playerXPos[2]  - this.playerHighlights[2]/2, 282  - this.playerHighlights[2]/2,
      96 + this.playerHighlights[2] , 96 + this.playerHighlights[2]
    );
  }
  else if(this.state == "paused")
  {
    
  }
  else if(this.state == "playing")
  {
    
  }
  else if(this.state == "game over")
  {
    
  }
}

},{}],14:[function(require,module,exports){
"use strict";

/**
 * @module exports the Inventory class
 */
module.exports = exports = Inventory;

/**
 * @constructor Inventory
 * Creates a new inventory
 */
function Inventory(weapon, armor) {
    this.inventory = [];
    this.inventory.push(weapon);
    this.inventory.push(armor);
}

/**
 * @function processes a new weapon item
 *
 */
Inventory.prototype.addWeapon = function (weapon) {
    checkWeapon(weapon);
    // check for invalids

    window.terminal.log(`Picked up a level ${weapon.level} ${weapon.name} with damage range ${weapon.damageMin}-${weapon.damageMax}, with ${weapon.properties}.`);
    var weaponToDrop = this.inventory[0];
    this.inventory[0] = weapon;
    window.player.combat.weapon = weapon;
    weaponToDrop.position = window.player.tilemap.getRandomAdjacent(weapon.position);
    weaponToDrop.shouldRetain = true;
    window.entityManager.addEntity(weaponToDrop);


    // Commented out until we figure out what to do...
    // if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    // if(weapon.type.damageMax > this.inventory[0].type.damageMax) { // This needs to be changed to prompting the user, I'll wait until there's a working GUI class to do that
    //     this.inventory.push(this.inventory[0]);
    //     this.inventory[0] = weapon;
    // }
    // else {
    //     this.inventory.push(weapon);
    // }
}

/**
 * @function processes a new armor item
 *
 */
Inventory.prototype.addArmor = function (armor) {
    checkArmor(armor);
    // check for invalids
    if (player.class == "Mage" && armor.name != "Robes") {
        window.terminal.log("Mages don't wear armor...");
        return;
    }

    window.terminal.log(`Picked up level ${armor.level} ${armor.name}.`);
    var armorToDrop = this.inventory[1];
    this.inventory[1] = armor;
    window.player.combat.armor = armor;
    armorToDrop.position = window.player.tilemap.getRandomAdjacent(armor.position);
    armorToDrop.shouldRetain = true;
    window.entityManager.addEntity(armorToDrop);


    // Commented out until we figure out what to do...
    // if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    // if(armor.type.defense > this.inventory[1].type.defense) { // See line 25
    //     this.inventory.push(this.inventory[1]);
    //     this.inventory[1] = armor;
    // }
    // else {
    //     this.inventory.push(armor);
    // }
}

/**
 * @function power up the equipped weapon
 *
 */
Inventory.prototype.powerupWeapon = function (damage) {
    this.inventory[0].type.damageMax += damage;
}

/**
 * @function power up the equipped armor
 *
 */
Inventory.prototype.powerupArmor = function (defense) {
    this.inventory[1].type.defense += defense;
}

/**
 * @function add item to inventory
 *
 */
Inventory.prototype.addItem = function (item) {
    if (this.inventory.length >= 17) { /* Tell GUI inventory is full */ }
    this.inventory.push(item);
}

/**
 * @function remove item from inventory
 *
 */
Inventory.prototype.removeItem = function (item) {
    this.inventory.remove(this.inventory.indexOf(item));
}

/**
 * @function makes sure item is a weapon
 *
 */
function checkWeapon(item) {
    if (typeof item == 'undefined') failWeapon();
    if (typeof item.type == 'undefined') failWeapon();
    if (typeof item.name == 'undefined') failWeapon();
    if (typeof item.level == "undefined") failWeapon();
    if (typeof item.shouldRetain == 'undefined') failWeapon();
    if (typeof item.damageMax == "undefined") failWeapon();
    if (typeof item.damageMin == "undefined") failWeapon();
    if (typeof item.damageType == "undefined") failWeapon();
    if (typeof item.range == "undefined") failWeapon();
    if (typeof item.hitBonus == "undefined") failWeapon();
    if (typeof item.attackEffect == 'undefined') failWeapon();
    if (typeof item.properties == "undefined") failWeapon();
}

/**
 * @function makes sure item is armor
 *
 */
function checkArmor(item) {
    if (typeof item == 'undefined') failArmor();
    if (typeof item.type == 'undefined') failArmor();
    if (typeof item.name == 'undefined') failArmor();
    if (typeof item.level == 'undefined') failArmor();
    if (typeof item.shouldRetain == 'undefined') failArmor();
    if (typeof item.defense == "undefined") failArmor();
    if (typeof item.strongType == "undefined") failArmor();
    if (typeof item.weakType == "undefined") failArmor();
}

function failWeapon() {
    throw new Error("Item doesn't match type definition for 'Weapon'");
}

function failArmor() {
    throw new Error("Item doesn't match type definition for 'Armor'");
}

},{}],15:[function(require,module,exports){
"use strict";

const CellularAutomata = require('./MapGeneration/cellular_automata_generation');
const DebugMap = require('./MapGeneration/debug_map_generation');
const RoomsHallways = require('./MapGeneration/rooms_hallways_generation');

module.exports = exports = MapGenerator;

function MapGenerator(edges, width, height){
  this.map = [];
  this.width = width;
  this.height = height;

  this.edges = edges;

  this.open = 0;
  this.filled = 1;

  if(window.debug){
    this.map = (new DebugMap(width, height, 50, this.open, this.filled)).generate();
  }else{
    if(Math.random() > 0.5){
      this.map = (new RoomsHallways(width, height, 50, this.open, this.filled)).generate();
    }else{
      this.map = (new CellularAutomata(width, height, 50, this.open, this.filled)).generate();
    }

  }


  this.processEdges();
}

MapGenerator.prototype.processEdges = function(){
  var str = ""
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      if(!this.isWall(column, row)){
        str += "-1, ";
        continue;
      }
      this.map[row * this.width + column] = this.edges[this.countScore(column, row)];
      str += this.countScore(column, row) + ", ";
    }
  }
}

MapGenerator.prototype.toString = function(){
  var header = "Width: " + this.width + "\tHeight: " + this.height + "\n";
  var body = ""
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      var val =  this.map[row * this.width + column]
      if(val < 10){
        //body += "0";
      }
      body += (this.map[row * this.width + column] == this.open) ? "." : "#"; //val + " "; //(this.map[row * this.width + column] == this.open) ? "." : "#";
    }
    body += "\n";
  }
  return header + body;
}

MapGenerator.prototype.countScore = function(x, y){
  var score = 0;

  if(!this.isOutOfBounds(x + 1, y - 1) && this.isWall(x + 1, y - 1)) score += 1;
  if(!this.isOutOfBounds(x + 1, y + 1) && this.isWall(x + 1, y + 1)) score += 2;
  if(!this.isOutOfBounds(x - 1, y + 1) && this.isWall(x - 1, y + 1)) score += 4;
  if(!this.isOutOfBounds(x - 1, y - 1) && this.isWall(x - 1, y - 1)) score += 8;

  if(!this.isOutOfBounds(x, y - 1) && this.isWall(x, y - 1)) score += 16;
  if(!this.isOutOfBounds(x + 1, y) && this.isWall(x + 1, y)) score += 32;
  if(!this.isOutOfBounds(x, y + 1) && this.isWall(x, y + 1)) score += 64;
  if(!this.isOutOfBounds(x - 1, y) && this.isWall(x - 1, y)) score += 128;

  return score
}

MapGenerator.prototype.isFillWall = function(x, y){
  return (this.map[y * this.width + x] == this.edges[15]);
}

MapGenerator.prototype.isWallOrOutOfBounds = function(x, y){
  return (this.isOutOfBounds(x, y) || this.isWall(x, y));
}

MapGenerator.prototype.isWall = function(x, y){
  return (this.map[y * this.width + x] != this.open);
}

MapGenerator.prototype.isOutOfBounds = function(x, y){
  return (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1);
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}

},{"./MapGeneration/cellular_automata_generation":1,"./MapGeneration/debug_map_generation":2,"./MapGeneration/rooms_hallways_generation":3}],16:[function(require,module,exports){
/**
 * @module A pathfinding module providing
 * a visualizaiton of common tree-search
 * algorithms  used in conjunction with
 * a tilemap.
 */
module.exports = exports = Pathfinder;

/**
 * @constructor Pathfinder
 * Constructs a new Pathfinder for the
 * supplied tilemap.  By default it uses
 * breadth-first.
 * @param {Tilemap} tilemap - the tilemap to
 * use in finding paths.
 */
function Pathfinder(tilemap) {
  this.tilemap = tilemap;
  this.algorithm = 'a-star';
}

Pathfinder.prototype.findPath = function(start, end) {
  this.setStartNode(start);
  this.setGoalNode(end);

  var path;
  while (typeof path == 'undefined') {
    path = this.step();
  }

  return path;
}

/**
 * Set a starting node for the pathfinding algorithm
 * @param {Object} node has an x and y property corresponding
 * to a tile in our tilemap.
 */
Pathfinder.prototype.setStartNode = function(node) {
  // Set the starting node
  this.start = {
    x: node.x,
    y: node.y,
    cost: 0
  }
  // Add the start node to the frontier and explored lists
  this.frontier = [[this.start]];
  this.explored = [this.start];

}

/**
 * Set a goal node for the pathfinding algorithm
 * @param {Object} node has an x and y property corresponding
 * to a tile in our tilemap.
 */
Pathfinder.prototype.setGoalNode = function(node) {
  this.goal = {
    x: node.x,
    y: node.y
  }
}

/**
 * Sets the algorithm to use in finding a path.
 * @param {string} algorithm - the algorithm to use
 * Supported values are:
 * - 'depth-first'
 * - 'best-first'
 * - 'greedy'
 * - 'a-star' (default)
 */
Pathfinder.prototype.setAlgorithm = function(algorithm) {
  this.algorithm = algorithm;
}

/**
 * @function isExplored
 * A helper function to determine if a node has
 * already been explored.
 * @param {Object} node - an object with an x and y
 * property corresponding to a tile position.
 * @returns true if explored, false if not.
 */
Pathfinder.prototype.isExplored = function(node) {
  return this.explored.findIndex(function(n){
    return n.x == node.x && n.y == node.y;
  }) != -1;
}

/**
 * @function isImpassible
 * A helper function to determine if a node is
 * impassible - either becuase it is impossible to
 * move through, or it does not exist.
 * @param {Object} node - an object with an x and y
 * property corresponding to a tile position.
 * @returns true if impassible, false if not.
 */
Pathfinder.prototype.isImpassible = function(node) {
  return this.tilemap.isWall(node.x, node.y);
}

/**
 * @function expand
 * Helper function to identify neighboring unexplored nodes
 * and add them to the explored list.  It also calculates
 * the path cost to reach these nodes and thier distance
 * from the goal.
 * @param {Object} node - an object with an x and y
 * property corresponding to a tile position that
 * we want to find unexplored tiles adjacent to.
 * Expanded nodes are rendered into the provided context.
 * @param {RenderingContext2D} ctx - the rendering
 * context in which to display our visualizaiton of
 * expanded nodes.
 * @returns An array of expaned nodes.
 */
Pathfinder.prototype.expand = function(node) {
  var actions = [];
  for(var x = -1; x < 2; x++){
    for(var y = -1; y < 2; y++){
      var newNode = {
        x: node.x - x,
        y: node.y - y
      }
      if((x != 0 || y != 0) &&
        !this.isExplored(newNode) &&
        !this.isImpassible(newNode))
      {
        // Add the path distance to reach this node
        var movement = 1; //this.tilemap.tileAt(node.x, node.y, 0).movement;
        newNode.cost = movement + node.cost;

        // Add the estimated distance to the goal
        // We'll use straight-line distance
        newNode.distance = Math.sqrt(
          Math.pow(newNode.x - this.goal.x, 2) +
          Math.pow(newNode.y - this.goal.y, 2)
        );

        // push the new node to action and explored lists
        actions.push(newNode);
        this.explored.push(newNode);
      }
    }
  }
  return actions;
}

/**
 * @function step
 * Advances the current pathfinding algorithm by one step,
 * displaying the result on-screen.  Used to animate the
 * process; normally this would happen within a loop
 * (see findPath() below)
 * @param {RenderingContext2D} ctx - the context to render into
 * @returns a path to the goal as an array of nodes, an empty
 * array if no such path exists, or undefined if there are still
 * possible paths to explore.
 */
Pathfinder.prototype.step = function() {
  // If there are no paths left in the frontier,
  // we cannot reach our goal
  if(this.frontier.length == 0) {
    return [];
  }

  // Select a path from the frontier to explore
  // The method of selection is what defines our
  // algorithm
  var path;
  switch(this.algorithm) {
    case 'breadth-first':
      // In breadth-first, we process the paths
      // in the order they were added to the frontier
      path = this.frontier.shift();
      break;
    case 'best-first':
      // In best-first, we process the paths in order
      // using a heuristic that helps us pick the
      // "best" option.  We often use straight-line
      // distance between the last node in the path
      // and the goal node.
      this.frontier.sort(function(pathA, pathB){
        var a = pathA[pathA.length-1].distance;
        var b = pathB[pathB.length-1].distance;
        return a - b;
      });
      path = this.frontier.shift();
      break;
    case 'greedy':
      // In greedy search, we pick the path that has
      // the lowest cost to reach
      this.frontier.sort(function(pathA, pathB){
        var a = pathA[pathA.length-1].cost;
        var b = pathB[pathB.length-1].cost;
        return a - b;
      });
      path = this.frontier.shift();
      break;
    case 'a-star':
      // In A*, we pick the path with the lowest combined
      // path cost and distance heurisitic
      this.frontier.sort(function(pathA, pathB){
        var a = pathA[pathA.length-1].cost + pathA[pathA.length-1].distance;
        var b = pathB[pathB.length-1].cost + pathB[pathB.length-1].distance;
        return a - b;
      });
      path = this.frontier.shift();
      break;
  }

  // If the path we chose leads to the goal,
  // we found a solution; return it.
  var lastNode = path[path.length-1];
  if(lastNode.x == this.goal.x && lastNode.y == this.goal.y)
    return path;

  // Otherwise, add any new nodes not already explored
  // that we can reach from the last node in the current path
  var frontier = this.frontier;
  this.expand(lastNode).forEach(function(node){
    var newPath = path.slice()
    newPath.push(node)
    frontier.push(newPath);
  });

  function nodeToString(node) {
    return '(' + node.x + ',' + node.y + ')';
  }

  function pathToString(path) {
    return path.map(nodeToString).join('->');
  }

  // If we reach this point, we have not yet found a path
  return undefined;
}

},{}],17:[function(require,module,exports){
"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatClass = require("./combat_class");
const Inventory = require('./inventory.js');
const Weapon = require('./weapon.js');
const Armor = require('./armor.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {postition} position object specifying an x and y
 */
function Player(position, tilemap, combatClass) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.tilemap = tilemap;
    this.spritesheet.src = './spritesheets/sprites.png';
    this.type = "Player";
    this.walk = [];
    this.changeClass(combatClass);
    this.level = 0;
    this.shouldProcessTurn = true;

    window.terminal.addCommand("/class", "Get your player class", this.getClass.bind(this));
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) this.state = "dead";
}

Player.prototype.walkPath = function(path, completion) {
    if (this.state == "dead") return; // shouldnt be necessary

    path.shift();
    this.walk = path;
    this.walkCompletion = completion;

    if (this.walk.length == 0) completion();
};

//Changes the player class, used because right now things
//rely on player being created before class is actually chosen.
//Potentially change this
Player.prototype.changeClass = function(chosenClass) {
    this.class = chosenClass;
    this.combat = new CombatClass(chosenClass);
    this.inventory = new Inventory(this.combat.weapon, this.combat.armor);

    if (this.class == "Knight") {
        this.spritesheetPos = { x: 1, y: 5 };
    } else if (this.class == "Mage") {
        this.spritesheetPos = { x: 9, y: 5 };
    } else if (this.class == "Archer") {
        this.spritesheetPos = { x: 7, y: 6 };
    }
};

Player.prototype.getClass = function(){
    window.terminal.log("Class: " + this.class, "lime");
}

/**
 *@function handles the players turn
 *{input} keyboard input given for this turn
 */
Player.prototype.processTurn = function(input) {
    if (!this.shouldProcessTurn) return;
    if (this.combat.status.effect != "None") window.combatController.handleStatus(this.combat);
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead" || this.combat.status.effect == "Frozen") return;

    if (hasUserInput(input)) {
        // Cancel walk
        this.walk = [];
    }

    if (this.walk.length > 0) {
        // walk
        this.position = { x: this.walk[0].x, y: this.walk[0].y };
        this.walk.shift();
        if (this.walk.length == 0) this.walkCompletion();
    } else {
        var change = { x: 0, y: 0 };
        if (input.up) change.y--;
        else if (input.down) change.y++;

        if (input.right) change.x++;
        else if (input.left) change.x--;

        var position = Vector.add(this.position, change);
        if (this.tilemap.isWall(position.x, position.y)) return;

        this.position = position;
    }

    var screenCoor = this.tilemap.toScreenCoords(this.position);

    if (screenCoor.y < 3) {
        this.tilemap.moveBy({ x: 0, y: -1 });
    }

    if (screenCoor.y + 3 == this.tilemap.draw.size.height) {
        this.tilemap.moveBy({ x: 0, y: 1 });
    }

    if (screenCoor.x < 5) {
        this.tilemap.moveBy({ x: -1, y: 0 });
    }

    if (screenCoor.x + 5 >= this.tilemap.draw.size.width) {
        this.tilemap.moveBy({ x: 1, y: 0 });
    }
}

Player.prototype.collided = function(entity) {
    if (entity.type == "Stairs") {
        this.shouldProcessTurn = false;
    }
}

Player.prototype.retain = function() {
    return this.combat.health > 0;
}

/**
 * @function renders the player into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(elapsedTime, ctx) {
    if (this.state == "dead") return; // shouldnt be necessary

    var position = this.tilemap.toScreenCoords(this.position);

    ctx.drawImage(
        this.spritesheet,
        96 * this.spritesheetPos.x, 96 * this.spritesheetPos.y,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}

function hasUserInput(input) {
    return input.up || input.down || input.right || input.left;
}

},{"./armor.js":5,"./combat_class":7,"./inventory.js":14,"./tilemap":23,"./vector":24,"./weapon.js":25}],18:[function(require,module,exports){
"use strict";

const Tilemap = require('./tilemap');
const RNG = require("./rng");

/**
 * @module exports the Powerup class
 */
module.exports = exports = Powerup;

//declare sound files
//declare sound files
var healthPickupSound = new Audio('sounds/Powerup3.wav');
healthPickupSound.volume = 0.1;
var attackPowerupSound = new Audio('sounds/Powerup4.wav');
attackPowerupSound.volume = 0.1;
var damageBonusPowerupSound = new Audio('sounds/Powerup1.wav');
damageBonusPowerupSound.volume = 0.1;
var defensePowerupSound = new Audio('sounds/Powerup2.wav');
defensePowerupSound.volume = 0.4;

/**
 * @constructor Powerup
 * Creates a new Powerup object
 * @param {postition} position object specifying an x and y
 */
function Powerup(position, tilemap, pType) {
  this.position = { x: position.x, y: position.y };
  this.size = { width: 96, height: 96 };
  this.spritesheet = new Image();
  this.tilemap = tilemap;
  this.spritesheet.src = './spritesheets/powerup.png';
  this.type = "Powerup";
  this.animation = true;
  this.currY = 0;
  this.movingUp = true;
  this.currPower = pType;
  this.used = false;
}

/**
 * @function updates the Powerup object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Powerup.prototype.update = function (time) {
  if (this.currY >= 5) this.movingUp = false;
  else if (this.currY <= -5) this.movingUp = true;
  if (this.movingUp) this.currY += .2;
  else this.currY -= .2;
}

Powerup.prototype.processTurn = function (input) {

}

Powerup.prototype.collided = function (entity) {
  if (this.used) return;
  if (entity.type == "Player") {
    //Update player's health/strength/item
    switch (this.currPower) {
      case 1:
        damageBonusPowerupSound.play();
        entity.combat.damageBonus += 0.2;
        window.terminal.log("The crystal radiates a bright blue and you feel its energy course through you.");
        if (window.debug) console.log(entity.combat.damageBonus);
        this.used = true;
        break;
      case 2:
        healthPickupSound.play();
        var potionValue = RNG.rollMultiple(3, 6, entity.level);
        entity.combat.health += potionValue;
        window.terminal.log("You quaff the large crimson potion and feel rejuvenated.");
        if (window.debug) console.log("+" + potionValue + " health = " + entity.combat.health);
        this.used = true;
        break;
      case 3:
        defensePowerupSound.play();
        entity.combat.defenseBonus += 0.2;
        window.terminal.log("As you finish the potion a faint ward forms around you.");
        if (window.debug) console.log(entity.combat.defenseBonus);
        this.used = true;
        break;
      case 4:
        attackPowerupSound.play();
        entity.combat.attackBonus += 0.2;
        window.terminal.log("The very smell of the verdant green potion awakens you and you feel more agile.");
        if (window.debug) console.log(entity.combat.attackBonus);
        this.used = true;
        break;
    }
  }
}

Powerup.prototype.retain = function () {
  return !this.used;
}

/**
 * @function renders the Powerup into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Powerup.prototype.render = function (elapsedTime, ctx) {
  var position = this.tilemap.toScreenCoords(this.position);
  switch (this.currPower) {
    case 1:
      ctx.drawImage(this.spritesheet, 0, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
    case 2:
      ctx.drawImage(this.spritesheet, 75, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
    case 3:
      ctx.drawImage(this.spritesheet, 150, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
    case 4:
      ctx.drawImage(this.spritesheet, 225, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
  }
}

    //Other potential powerups
    //ctx.drawImage(this.power,0,25,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
    //ctx.drawImage(this.power,25,50,25,25,position.x*this.size.width, position.y*this.size.height,96,96);

},{"./rng":20,"./tilemap":23}],19:[function(require,module,exports){
"use strict";

module.exports = exports = ProgressManager;

function ProgressManager(length, callbackComplete) {
  this.progressTimer = 0;
  this.progressLength = length;
  this.isProgressing = true;
  this.callbackComplete = callbackComplete;
  this.isActive = false;
  this.percent = 0
}

ProgressManager.prototype.progress = function(time){
  if(!this.isActive) return;
  if(this.isProgressing){
    this.progressTimer += time;
    this.percent = this.progressTimer / this.progressLength;
    if(this.percent > 1){
      this.percent = 1;
      this.isProgressing = false;
      this.callbackComplete();
    }
  }
}

ProgressManager.prototype.reset = function(){
  this.progressTimer = 0;
  this.isProgressing = true;
  this.isActive = false;
  this.percent = 0;
}

},{}],20:[function(require,module,exports){
"use strict";

module.exports = exports = {
    rollRandom: rollRandom,
    rollMultiple: rollMultiple,
    rollWeighted: rollWeighted
}

/**
 * @function rollRandom
 * Generates a random number using given bounds.
 * @param {Integer} aMinimum - inclusive lower bound
 * @param {Integer} aMaximum - inclusive upper bound
 */
function rollRandom(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum + 1 - aMinimum) + aMinimum);
}

/**
 * @function rollMultiple
 * Generates a sum of random numbers using gives bounds.
 * @param {Integer} aMinimum - inclusive lower bound
 * @param {Integer} aMaximum - inclusive upper bound
 * @param {Integer} aNumber - number of times to generate a random number
 */
function rollMultiple(aMinimum, aMaximum, aNumber) {
    var total = 0;
    for (var i = 0; i < aNumber; i++) {
        total += this.rollRandom(aMinimum, aMaximum);
    }
    return total;
}

/**
 * @function rollWeighted
 * Generates a weighted random number corresponding to the index of the weight given.
 * Accepts any number of arguments greater than 0.
 * Example: rollWeighted(10,50,20) might return 1 which corresponds to the weight of 50.
 * Note: weights are not necessarily percentages; they can add up to any amount.
 */
function rollWeighted() {
    var argLength = arguments.length;
    if (argLength < 1) throw new Error("At least one argument required.");
    var weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
    }
    var roll = this.rollRandom(0, weightSum);
    weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
        if (roll <= weightSum) return i;
    }
}


},{}],21:[function(require,module,exports){
"use strict";

/**
 * @module exports the Stairs class
 */
module.exports = exports = Stairs;

/**
 * @constructor Stairs
 * Creates a new Stairs object
 * @param {postition} position object specifying an x and y
 */
function Stairs(position, tilemap, travelStairs) {
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.type = "Stairs";
    this.tilemap = tilemap;
    this.travelStairs = travelStairs;

    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/powerup.png';

    this.beginTransition = false
    this.time = 0;

    this.spriteOff = 0;
}

/**
 * @function updates the Stairs object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Stairs.prototype.update = function (time) {
  if(this.beginTransition){
    this.time += time;
    if(this.time >= 100){
      this.spriteOff = 75;
    }
    if(this.time >= 500){
      this.travelStairs();
      this.travelStairs = function(){};
    }
  }
}

Stairs.prototype.processTurn = function (input) {
}

Stairs.prototype.collided = function (entity) {
  if(entity.type == "Player"){
    this.beginTransition = true;
  }
}

Stairs.prototype.retain = function () {
    return true;
}

/**
 * @function renders the Stairs into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Stairs.prototype.render = function (elapsedTime, ctx) {
  var position = this.tilemap.toScreenCoords(this.position);

  ctx.drawImage(this.spritesheet, 75 + this.spriteOff, 0, 75, 75, (position.x * this.size.width), (position.y * this.size.height), 96, 96);
}

},{}],22:[function(require,module,exports){
"use strict";

const MAX_MSG_COUNT = 50;
const MAX_MSG_LENGTH = 29;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = { x: 1063, y: 649 };
    this.active = false;
    this.input = "";
    this.commands = {};

    this.addCommand("/help", "Print out all commands", this.helpCommand.bind(this));
}

Terminal.prototype.log = function (message, color) {
    if (typeof color == 'undefined') color = 'white';
    splitMessage(message, this.messages, color);
    if (this.messages.length > MAX_MSG_COUNT) {
        this.messages.pop();
    }
    if (window.debug) console.log(message);
}

Terminal.prototype.clear = function () {
    this.messages = [];
}

Terminal.prototype.update = function (time) {

}

Terminal.prototype.render = function (elapsedTime, ctx) {
    ctx.font = "15px Courier New";
    var self = this;
    this.messages.forEach(function (message, i) {
        ctx.fillStyle = message.color;
        ctx.fillText(message.text, self.startPos.x, self.startPos.y - 18 * i);
    });

    ctx.fillText(">", 1063, 667);

    if (this.active){
      ctx.fillStyle = "white";
      ctx.fillText(this.input, 1078, 667)
    } else{
      ctx.fillStyle = "#d3d3d3";
      ctx.fillText("Press / to type", 1078, 667);
    }
}

Terminal.prototype.onkeydown = function (event) {
  switch (event.key) {
    case "/":
      this.active = true;
      this.input = "/";
      break;
    case "Enter":
      this.processInput();
      console.log('dd');
      this.input = "";
      this.active = false;
      break;
    case "Backspace":
      this.input = this.input.substr(0, this.input.length - 1);
      break;
    default:
      if(this.active) this.input = this.input.concat(event.key);
  }

  return this.active;
}

// Callback should accept a string and return true if it handles the Command
// else it should return false
Terminal.prototype.addCommand = function(command, description, callback){
  this.commands[command] = {command: command, description: description, callback: callback};
}

Terminal.prototype.removeCommand = function(command){
  if(command in this.commands){
      delete this.commands[command];
  }
}

Terminal.prototype.helpCommand = function(){
  var self = this;
  Object.keys(self.commands).forEach(function(command){
    var c = self.commands[command];
    self.log(c.command + " " + c.description);
  });
}

Terminal.prototype.processInput = function () {
    this.log(this.input.slice(1), "yellow");

    if(this.input in this.commands){
        this.commands[this.input].callback();
        return;
    }

    this.log("Command not found", "red");
    /*switch (this.input) {
        case "/stats":
            window.terminal.log("Here are your current stats:");
            break;
        case "/weapon":
            window.terminal.log("Here are your weapon's current stats:");
            break;
        case "/armor":
            window.terminal.log("Here are your armor's current stats:");
            break;
        case "/help":
            window.terminal.log("/stats - Show's your current stats for your player");
            window.terminal.log("/weapon - Show's the current stats of your weapon");
            window.terminal.log("/armor - Show's the current stats of your armor");
            break;
        default:
            window.terminal.log("Command not found");
    }*/
}

function splitMessage(message, messages, color) {
    if (message.length < 29) {
        messages.unshift({ text: message, color: color });
    }
    else {
        messages.unshift({ text: message.slice(0, MAX_MSG_LENGTH), color: color });
        splitMessage(message.slice(MAX_MSG_LENGTH, message.length), messages, color);
    }

}

},{}],23:[function(require,module,exports){
"use strict";

const MapGenerator = require('./map_generator');
const Vector = require('./vector')

module.exports = exports = Tilemap;


function Tilemap(canvas, width, height, tileset, options){

  this.tiles = [];
  this.tileWidth = tileset.tilewidth;
  this.tileHeight = tileset.tileheight;
  this.mapWidth = width;
  this.mapHeight = height;
  this.tileset = tileset

  this.draw = {};
  this.draw.origin = {x: 0, y: 0};

  this.idx = 0;

  // We add one so that we go slightly beyond the canvas
  this.draw.size = {
    width: Math.floor(canvas.width / this.tileWidth),
    height: Math.floor(canvas.height / this.tileHeight)
  }

  // Load the tileset(s)

  var tset = new Image();
  tset.onload = function() {
    if(options.onload) options.onload();
  }
  tset.src = tileset.image;

  // Create the tileset's tiles
  var colCount = Math.floor(tileset.imagewidth / this.tileWidth),
      rowCount = Math.floor(tileset.imageheight / this.tileHeight),
      tileCount = colCount * rowCount;

  for(var i = 0; i < tileCount; i++) {
    var tile = {
      // Reference to the image, shared amongst all tiles in the tileset
      image: tset,
      // Source x position.  i % colCount == col number (as we remove full rows)
      sx: (i % colCount) * this.tileWidth,
      // Source y position. i / colWidth (integer division) == row number
      sy: Math.floor(i / colCount) * this.tileHeight,
    }
    this.tiles.push(tile);
  }

  this.generateMap();

}

Tilemap.prototype.changeTileset = function(){
  this.idx++;
  this.idx %= this.tileset.images.length;
  var tset = new Image();
  tset.src = this.tileset.images[this.idx];
  this.tiles.forEach(function(tile){
    tile.image = tset;
  })
}
Tilemap.prototype.generateMap = function(){
  var map = new MapGenerator(this.tileset.edges, this.mapWidth, this.mapHeight);

  // Set up the layer's data array.  We'll try to optimize
  // by keeping the index data type as small as possible
  if(this.tiles.length < Math.pow(2,8))
    this.data = new Uint8Array(map.map);
  else if (this.tiles.length < Math.pow(2, 16))
    this.data = new Uint16Array(map.map);
  else
    this.data = new Uint32Array(map.map);

  for(var i = 0; i < this.mapWidth * this.mapHeight; i++){
    var tileId = this.data[i];
    // tiles with an id of 0 get painted as background
    if(tileId == 0) {
      this.data[i] = (Math.random() > 0.1) ? 49 : 50 + rand(7);
    }
  }
}

Tilemap.prototype.moveTo = function(position){
  var origin = {
    x: position.x,
    y: position.y
  }
  // don't allow the map to move beyond the edge
  if(origin.x < 0){
    origin.x = 0
  }

  if(origin.y < 0){
    origin.y = 0;
  }

  if(origin.x + this.draw.size.width > this.mapWidth){
    origin.x = this.mapWidth - this.draw.size.width;
  }

  if(origin.y + this.draw.size.height > this.mapHeight){
    origin.y = this.mapHeight - this.draw.size.height;
  }

  this.draw.origin = origin;
}

Tilemap.prototype.moveBy = function(position){
  this.moveTo(
    {
      x: this.draw.origin.x + position.x,
      y: this.draw.origin.y + position.y
    }
  );
}

Tilemap.prototype.getDrawOrigin = function(){
  return {x: this.draw.origin.x, y: this.draw.origin.y};
}

Tilemap.prototype.render = function(screenCtx) {
  // Render tilemap layers - note this assumes
  // layers are sorted back-to-front so foreground
  // layers obscure background ones.
  // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
  for(var y = this.draw.origin.y; y - this.draw.origin.y < Math.min(this.mapHeight - this.draw.origin.y, this.draw.size.height); y++) {
    for(var x = this.draw.origin.x; x - this.draw.origin.x < Math.min(this.mapWidth - this.draw.origin.x, this.draw.size.width); x++) {
      var tileId = this.data[x + this.mapWidth * y];

      var tile = this.tiles[tileId - 1];
      if(tile.image) { // Make sure the image has loaded
        screenCtx.drawImage(
          tile.image,     // The image to draw
          tile.sx, tile.sy, this.tileWidth, this.tileHeight, // The portion of image to draw
          (x-this.draw.origin.x)*this.tileWidth, (y-this.draw.origin.y)*this.tileHeight, this.tileWidth, this.tileHeight // Where to draw the image on-screen
        );
      }
    }
  }
}

Tilemap.prototype.toScreenCoords = function(position){
  return Vector.subtract(position, this.draw.origin);
}

Tilemap.prototype.toWorldCoords = function(position){
  return Vector.add(position, this.draw.origin);
}

Tilemap.prototype.isWall = function(x, y){
  //return this.data[x + this.mapWidth * y] != 0;

  //Tiles that are not solid are hard coded here for now
  //Potentially add "solid" property to tiles
  var type = this.data[x + this.mapWidth * y];

  return(!(type >= 49 && type <= 56 ))
}

Tilemap.prototype.tileAt = function(x, y) {
  // sanity check
  if(x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight)
    return undefined;
  return this.tiles[this.data[x + y*this.mapWidth] - 1];
}

function rand(max){
  return Math.floor(Math.random() * max);
}

//Finds an open tile space randomly across the entire map
Tilemap.prototype.findOpenSpace = function()
{
	var randIndex = 0;
	var spotFound = false;
  var tileIndexes = [];
  var tile;

  for(var i = 0; i < this.mapWidth * this.mapHeight; i++)
  {
    tileIndexes.push(i);
  }

	do
	{
		randIndex = Math.floor(Math.random()*tileIndexes.length);
    tile = tileIndexes[randIndex];
    spotFound = !this.isWall(tile % this.mapWidth , Math.floor(tile / this.mapWidth));
    tileIndexes.splice(randIndex, 1);
	}while(!spotFound && tileIndexes.length > 0);

  if(!spotFound)
  {
    throw new Error("Could not find free space. Check map generation algorithms and definition of empty spaces.")
  }

	return {x: tile % this.mapWidth, y: Math.floor(tile / this.mapWidth)};
}

// Finds an random open tile adjacent to a given tile.
Tilemap.prototype.getRandomAdjacent = function (aTile) {
  var adjacents = [
    { x: aTile.x - 1, y: aTile.y - 1, wall: this.isWall(aTile.x - 1, aTile.y - 1) },
    { x: aTile.x, y: aTile.y - 1, wall: this.isWall(aTile.x, aTile.y - 1) },
    { x: aTile.x + 1, y: aTile.y - 1, wall: this.isWall(aTile.x + 1, aTile.y - 1) },
    { x: aTile.x - 1, y: aTile.y, wall: this.isWall(aTile.x - 1, aTile.y) },
    { x: aTile.x + 1, y: aTile.y, wall: this.isWall(aTile.x + 1, aTile.y) },
    { x: aTile.x - 1, y: aTile.y + 1, wall: this.isWall(aTile.x - 1, aTile.y + 1) },
    { x: aTile.x, y: aTile.y + 1, wall: this.isWall(aTile.x, aTile.y + 1) },
    { x: aTile.x + 1, y: aTile.y + 1, wall: this.isWall(aTile.x + 1, aTile.y + 1) }
  ];
  adjacents = adjacents.filter(function (tile) { return !tile.wall });
  if (adjacents.length == 0) {
    return aTile;
  } else {
    return adjacents[rand(adjacents.length)];
  }
}

},{"./map_generator":15,"./vector":24}],24:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize,
  distance: distance,
  equals: equals
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

function distance(a, b){
  var distance=this.subtract(a,b);
  return {x: Math.abs(distance.x), y: Math.abs(distance.y)};
}

function equals(a, b){
  return a.x == b.x && a.y == b.y;
}

},{}],25:[function(require,module,exports){
"use strict";

module.exports = exports = Weapon;

// I'm sure there's a better way to do this,
// especially wince we have to restrict weapon types to different classes.
function Weapon(aName, aLevel) {
    this.type = "Weapon";
    this.name = aName;
    this.level = aLevel;
    this.shouldRetain = true;
    this.spriteIdx = 0;
    this.spritePositions = [
        { x: 75, y: 75 },  // 0 - Magic Staff
        { x: 225, y: 75 }, // 1 - Bow
        { x: 300, y: 75 }, // 2 - Mace
        { x: 375, y: 75 }, // 3 - Knife/Sword
        { x: 450, y: 75 }, // 4 - Axe
        { x: 675, y: 75 }  // 5 - Another Magic Staff
    ];

    switch (aName) {
        // Melee
        case "Longsword":
            this.damageMax = 10
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            this.spriteIdx = 3;
            break;

        case "Morning Star":
            this.damageMax = 8
            this.damageMin = 1;
            this.damageType = "b";
            this.range = 1;
            this.hitBonus = 3;
            this.attackEffect = "";
            this.properties = "+3 to Hit";
            this.spriteIdx = 2;
            break;

        case "Halberd":
            this.damageMax = 8
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 2;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Range, +1 Min Damage";
            this.spriteIdx = 4;
            break;

        case "Battleaxe":
            this.damageMax = 12
            this.damageMin = 4;
            this.damageType = "sb";
            this.range = 1;
            this.hitBonus = 1;
            this.attackEffect = "";
            this.properties = "+3 Min Damage, +1 Crit Chance";
            this.spriteIdx = 4;
            break;

        case "Claw":
            this.damageMax = 4
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            this.spriteIdx = 3;
            break;

        // Ranged
        case "Bodkin":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 3;
            this.attackEffect = "";
            this.properties = "+3 to Hit";
            this.spriteIdx = 1;
            break;

        case "Broadhead":
            this.damageMax = 6
            this.damageMin = 2;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            this.spriteIdx = 1;
            break;

        case "Poison-Tipped":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.attackEffect = "Poisoned";
            this.properties = "50% Poison Chance";
            this.spriteIdx = 1;
            break;

        case "Heavy Bolts":
            this.damageMax = 10
            this.damageMin = 4;
            this.damageType = "b";
            this.range = 3;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+3 Min Damage, -2 Range";
            this.spriteIdx = 1;
            break;

        // Spells
        case "Magic Missile":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 255;
            this.attackEffect = "";
            this.properties = "Unerring Accuracy";
            this.spriteIdx = 0;
            break;

        case "Fireball":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.attackEffect = "Burned";
            this.properties = "50% Burn Chance, Explodes on Contact";
            this.spriteIdx = 5;
            break;

        case "Frostbolt":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.attackEffect = "Frozen";
            this.properties = "50% Freeze Chance";
            this.spriteIdx = 5;
            break;

        case "Eldritch Blast":
            this.damageMax = 10
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = -2;
            this.attackEffect = "";
            this.properties = "-2 to Hit";
            this.spriteIdx = 0;
            break;
    }

    // static properties for entities
    this.position = { x: -1, y: -1 };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/powerup.png';

    this.currY = 0;
    this.movingUp = true;
}

Weapon.prototype.collided = function (aEntity) {
    if (aEntity.type == "Player") {
        aEntity.inventory.addWeapon(this);
        this.shouldRetain = false;
    }
}

Weapon.prototype.processTurn = function () {

}

Weapon.prototype.retain = function () {
    return this.shouldRetain;
}

Weapon.prototype.update = function () {
    if (this.currY >= 5) this.movingUp = false;
    else if (this.currY <= -5) this.movingUp = true;
    if (this.movingUp) this.currY += .2;
    else this.currY -= .2;
}

Weapon.prototype.render = function (time, ctx) {
    var position = window.tilemap.toScreenCoords(this.position);
    var spriteSource = this.spritePositions[this.spriteIdx];
    ctx.drawImage(this.spritesheet, spriteSource.x, spriteSource.y, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
}

},{}],26:[function(require,module,exports){
module.exports={
 "tileheight":96,
 "tilewidth":96,
 "image":".\/tilesets\/grass.png",
 "images": [".\/tilesets\/grass.png", ".\/tilesets\/tset.png"],
 "imageheight":672,
 "imagewidth":768,
 "edges":{
	0: 47,
	1: 47,
	2: 47,
	3: 47,
	4: 47,
	5: 47,
	6: 47,
	7: 47,
	8: 47,
	9: 47,
	10: 47,
	11: 47,
	12: 47,
	13: 47,
	14: 47,
	15: 47,
	16: 5,
	17: 5,
	18: 5,
	19: 5,
	20: 5,
	21: 5,
	22: 5,
	23: 5,
	24: 5,
	25: 5,
	26: 5,
	27: 5,
	28: 5,
	29: 5,
	30: 5,
	31: 5,
	32: 13,
	33: 13,
	34: 13,
	35: 13,
	36: 13,
	37: 13,
	38: 13,
	39: 13,
	40: 13,
	41: 13,
	42: 13,
	43: 13,
	44: 13,
	45: 13,
	46: 13,
	47: 13,
	48: 11,
	49: 9,
	50: 11,
	51: 9,
	52: 11,
	53: 9,
	54: 11,
	55: 9,
	56: 11,
	57: 9,
	58: 11,
	59: 9,
	60: 11,
	61: 9,
	62: 11,
	63: 9,
	64: 6,
	65: 6,
	66: 6,
	67: 6,
	68: 6,
	69: 6,
	70: 6,
	71: 6,
	72: 6,
	73: 6,
	74: 6,
	75: 6,
	76: 6,
	77: 6,
	78: 6,
	79: 6,
	80: 7,
	81: 7,
	82: 7,
	83: 7,
	84: 7,
	85: 7,
	86: 7,
	87: 7,
	88: 7,
	89: 7,
	90: 7,
	91: 7,
	92: 7,
	93: 7,
	94: 7,
	95: 7,
	96: 3,
	97: 3,
	98: 1,
	99: 1,
	100: 3,
	101: 3,
	102: 1,
	103: 1,
	104: 3,
	105: 3,
	106: 1,
	107: 1,
	108: 3,
	109: 3,
	110: 1,
	111: 1,
	112: 32,
	113: 26,
	114: 18,
	115: 21,
	116: 32,
	117: 26,
	118: 18,
	119: 21,
	120: 32,
	121: 26,
	122: 18,
	123: 21,
	124: 32,
	125: 26,
	126: 18,
	127: 21,
	128: 14,
	129: 14,
	130: 14,
	131: 14,
	132: 14,
	133: 14,
	134: 14,
	135: 14,
	136: 14,
	137: 14,
	138: 14,
	139: 14,
	140: 14,
	141: 14,
	142: 14,
	143: 14,
	144: 12,
	145: 12,
	146: 12,
	147: 12,
	148: 12,
	149: 12,
	150: 12,
	151: 12,
	152: 10,
	153: 10,
	154: 10,
	155: 10,
	156: 10,
	157: 10,
	158: 10,
	159: 10,
	160: 8,
	161: 8,
	162: 8,
	163: 8,
	164: 8,
	165: 8,
	166: 8,
	167: 8,
	168: 8,
	169: 8,
	170: 8,
	171: 8,
	172: 8,
	173: 8,
	174: 8,
	175: 8,
	176: 23,
	177: 19,
	178: 23,
	179: 19,
	180: 23,
	181: 19,
	182: 23,
	183: 19,
	184: 20,
	185: 30,
	186: 20,
	187: 30,
	188: 20,
	189: 30,
	190: 20,
	191: 30,
	192: 4,
	193: 4,
	194: 4,
	195: 4,
	196: 2,
	197: 2,
	198: 2,
	199: 2,
	200: 4,
	201: 4,
	202: 4,
	203: 4,
	204: 2,
	205: 2,
	206: 2,
	207: 2,
	208: 31,
	209: 31,
	210: 31,
	211: 31,
	212: 17,
	213: 17,
	214: 17,
	215: 17,
	216: 25,
	217: 25,
	218: 25,
	219: 25,
	220: 22,
	221: 22,
	222: 22,
	223: 22,
	224: 24,
	225: 24,
	226: 27,
	227: 27,
	228: 28,
	229: 28,
	230: 29,
	231: 29,
	232: 24,
	233: 24,
	234: 27,
	235: 27,
	236: 28,
	237: 28,
	238: 29,
	239: 29,
	240: 39,
	241: 34,
	242: 42,
	243: 43,
	244: 41,
	245: 16,
	246: 35,
	247: 46,
	248: 33,
	249: 36,
	250: 15,
	251: 38,
	252: 44,
	253: 37,
	254: 45,
	255: 48,
	256: 48
	}
}

},{}]},{},[4]);
