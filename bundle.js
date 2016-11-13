(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.debug = false;

/* Classes and Libraries */
const Game = require('./game');
const EntityManager = require('./entity_manager');
const Tilemap = require('./tilemap');
const tileset = require('../tilemaps/tiledef.json');
const Player = require('./player');
const Pathfinder = require('./pathfinder.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var entityManager = new EntityManager();


var tilemap = new Tilemap({width: canvas.width, height: canvas.height}, 64, 64, tileset, {
  onload: function() {
    masterLoop(performance.now());
  }
});

var pathfinder = new Pathfinder(tilemap);
window.pathfinder = pathfinder;

var input = {
  up: false,
  down: false,
  left: false,
  right: false
}

var randX;
var randY;
var turnTimer = 0;
var defaultTurnDelay = 400; 	  //Default turn between turns
var turnDelay = defaultTurnDelay; //current time between turns
var autoTurn = false; 			  //If true, reduces time between turns and turns happen automatically
var resetTimer = true; 			  //Take turn immediately on movement key press if true
var loopCount = 0; //Temporary until camera movement is done
do
{
	randX = Math.floor(Math.random()*(tilemap.mapWidth - 1));//tilemap.mapWidth);
	randY = Math.floor(Math.random()*(tilemap.mapWidth - 1));//tilemap.mapHeight);
	loopCount++;
}while(tilemap.isWall(randX, randY) && loopCount < 1000);

var player = new Player({x: randX, y: randY}, tilemap);

window.player = player;

entityManager.addEntity(player);
tilemap.moveTo({x: randX - 3, y: randY - 4});
/**
 * @function onkeydown
 * Handles keydown events
 */
var position = {x: 0, y: 0};
window.onkeydown = function(event) {
   switch(event.key) {
     case "ArrowUp":
     case "w":
       //position.y--;
       input.up = true;
	   if(resetTimer)
	   {
		   turnTimer = turnDelay;
		   resetTimer = false;
	   }
	   event.preventDefault();
       break;
     case "ArrowDown":
     case "s":
       //position.y++;
       input.down = true;
	   if(resetTimer)
	   {
		   turnTimer = turnDelay;
		   resetTimer = false;
	   }
	   event.preventDefault();
       break;
     case "ArrowLeft":
     case "a":
       //position.x--;
       input.left = true;
	   if(resetTimer)
	   {
		   turnTimer = turnDelay;
		   resetTimer = false;
	   }
	   event.preventDefault();
       break;
     case "ArrowRight":
     case "d":
       //position.x++;
       input.right = true;
	   if(resetTimer)
	   {
		   turnTimer = turnDelay;
		   resetTimer = false;
	   }
	   event.preventDefault();
       break;
	 case "Shift":
		event.preventDefault();
		turnDelay=defaultTurnDelay/2;
		autoTurn = true;
		break;
   }
 }

 /**
  * @function onkeyup
  * Handles keyup events
  */
window.onkeyup = function(event) {
    switch(event.key) {
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
	    turnDelay=defaultTurnDelay;
		autoTurn = true;
		break;
    }
	if(!(input.left || input.right || input.up || input.down)) resetTimer = true;
  }
/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
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

  if(input.left || input.right || input.up || input.down || autoTurn)
  {
	  turnTimer += elapsedTime;
	  if(turnTimer >= turnDelay)
	  {
		turnTimer = 0;
		processTurn();
	  }
  }
  entityManager.update(elapsedTime);
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
}

/**
  * @function processTurn
  * Proccesses one turn, updating the states of all entities.
  */
function processTurn(){
	entityManager.processTurn(input);
}

},{"../tilemaps/tiledef.json":9,"./entity_manager":2,"./game":3,"./pathfinder.js":5,"./player":6,"./tilemap":7}],2:[function(require,module,exports){
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
      return (entity.position.x + e1r) - (oentity.position.x + e2r)  <= e1r + e2r;
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
    (entity1.position.y + entity1.size.height < entity2.position.y) ||
    (entity1.position.y > entity2.position.y + entity2.size.height) ||
    (entity1.position.x > entity2.position.x + entity2.size.width) ||
    (entity1.position.x + entity1.size.width < entity2.position.x))
}

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

module.exports = exports = MapGenerator;


function MapGenerator(edges, width, height){
  this.map = [];
  this.width = width;
  this.height = height;
  this.percent = 40;

  this.edges = edges;

  this.open = 0;
  this.filled = 1;

  this.randomFillMap();
  this.makeCaverns();
  this.processEdges();

}

MapGenerator.prototype.randomFillMap = function(){

  var mapMiddle = (this.height / 2);

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
      }
      else{
        if(!window.debug) this.map[row * this.width + column] = this.pickTile();
      }
    }
  }
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

MapGenerator.prototype.loadFromScore = function(scores) {
  this.map = []
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      var val = scores[row * this.width + column];
      if(val == -1){
        this.map.push(0);
        continue;
      }
      this.map.push(this.edges[val]);
    }
  }
}

MapGenerator.prototype.toString = function(){
  var header = "Width: " + this.width + "\tHeight: " + this.height + "\tWalls: " + this.percent + "\n";
  var body = ""
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      var val =  this.map[row * this.width + column]
      if(val < 10){
        body += "0";
      }
      body += val + " "; //(this.map[row * this.width + column] == this.open) ? "." : "#";
    }
    body += "\n";
  }
  return header + body;
}

MapGenerator.prototype.pickTile = function() {
  if(this.percent >= rand(100) + 1) return this.filled;
  return this.open;
}

MapGenerator.prototype.makeCaverns = function(){
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      this.map[row * this.width + column] = this.pickCavernTile(column, row);
    }
  }
}

MapGenerator.prototype.pickCavernTile = function(x, y){
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

MapGenerator.prototype.countAdjacentWalls = function(x, y, scopeX, scopeY){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {postition} position object specifying an x and y
 */
function Player(position, tilemap) {
	this.state = "idle";
	this.position = {x: position.x, y: position.y};
	this.size = {width: 96, height: 96};
	this.spritesheet  = new Image();
	this.tilemap = tilemap;
	this.spritesheet.src = './spritesheets/sprites.png';
	this.type = "Player";
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {

}

/**
 *@function handles the players turn
 *{input} keyboard input given for this turn
 */
Player.prototype.processTurn = function(input)
{
	var change = {x: 0, y: 0};
	if(input.up) change.y--;
	else if(input.down) change.y++;

	if (input.right) change.x++;
	else if(input.left) change.x--;

	var position = Vector.add(this.position, change);
	if(this.tilemap.isWall(position.x, position.y)) return;

	this.position = position;

	var screenCoor = Vector.subtract(position, this.tilemap.draw.origin);

	if(screenCoor.y < 1){
		this.tilemap.moveBy({x: 0, y: -1});
	}

	if(screenCoor.y + 1 == this.tilemap.draw.size.height){
		this.tilemap.moveBy({x: 0, y: 1});
	}

	if(screenCoor.x < 1){
		this.tilemap.moveBy({x: -1, y: 0});
	}

	if(screenCoor.x + 1 == this.tilemap.draw.size.width){
		this.tilemap.moveBy({x: 1, y: 0});
	}

}

Player.prototype.collided = function(entity)
{
}

Player.prototype.retain = function()
{
	return true;
}

/**
 * @function renders the player into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(elapsedTime, ctx) {
	var position = Vector.subtract(this.position, this.tilemap.draw.origin);

  ctx.drawImage(
	this.spritesheet,
	96, 480,
	96, 96,
	position.x*this.size.width, position.y*this.size.height,
	96,96
	);

}

},{"./tilemap":7,"./vector":8}],7:[function(require,module,exports){
"use strict";

const MapGenerator = require('./map_generator');

module.exports = exports = Tilemap;


function Tilemap(canvas, width, height, tileset, options){

  this.tiles = [];
  this.tileWidth = tileset.tilewidth;
  this.tileHeight = tileset.tileheight;
  this.mapWidth = width;
  this.mapHeight = height;

  this.draw = {};
  this.draw.origin = {x: 0, y: 0};

  // We add one so that we go slightly beyond the canvas
  this.draw.size = {
    width: Math.floor(canvas.width / this.tileWidth),
    height: Math.floor(canvas.height / this.tileHeight)
  }

  // Load the tileset(s)

  var map = new MapGenerator(tileset.edges, this.mapWidth, this.mapHeight);
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
  if(origin.x < 0 || origin.y < 0) return;

  if(origin.x + this.draw.size.width > this.mapWidth + 1 || origin.y + this.draw.size.height > this.mapHeight + 1) return;

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

},{"./map_generator":4}],8:[function(require,module,exports){
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
  normalize: normalize
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

},{}],9:[function(require,module,exports){
module.exports={
 "tileheight":96,
 "tilewidth":96,
 "image":".\/tilesets\/tset.png",
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
	48: 9,
	49: 9,
	50: 11,
	51: 9,
	52: 9,
	53: 9,
	54: 9,
	55: 9,
	56: 11,
	57: 9,
	58: 9,
	59: 9,
	60: 9,
	61: 9,
	62: 9,
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
	96: 1,
	97: 1,
	98: 1,
	99: 1,
	100: 1,
	101: 1,
	102: 1,
	103: 1,
	104: 1,
	105: 1,
	106: 1,
	107: 1,
	108: 1,
	109: 1,
	110: 1,
	111: 1,
	112: 21,
	113: 26,
	114: 18,
	115: 21,
	116: 21,
	117: 21,
	118: 18,
	119: 21,
	120: 21,
	121: 26,
	122: 21,
	123: 21,
	124: 21,
	125: 21,
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
	144: 10,
	145: 10,
	146: 10,
	147: 10,
	148: 10,
	149: 10,
	150: 10,
	151: 10,
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
	176: 30,
	177: 19,
	178: 30,
	179: 30,
	180: 30,
	181: 30,
	182: 30,
	183: 30,
	184: 20,
	185: 30,
	186: 30,
	187: 30,
	188: 30,
	189: 30,
	190: 30,
	191: 30,
	192: 4,
	193: 2,
	194: 4,
	195: 2,
	196: 2,
	197: 2,
	198: 2,
	199: 2,
	200: 4,
	201: 2,
	202: 2,
	203: 2,
	204: 2,
	205: 2,
	206: 2,
	207: 2,
	208: 22,
	209: 22,
	210: 22,
	211: 22,
	212: 17,
	213: 22,
	214: 22,
	215: 22,
	216: 25,
	217: 22,
	218: 22,
	219: 25,
	220: 22,
	221: 22,
	222: 22,
	223: 22,
	224: 29,
	225: 29,
	226: 27,
	227: 29,
	228: 28,
	229: 29,
	230: 29,
	231: 29,
	232: 29,
	233: 29,
	234: 29,
	235: 29,
	236: 28,
	237: 29,
	238: 29,
	239: 29,
	240: 48,
	241: 34,
	242: 48,
	243: 43,
	244: 48,
	245: 48,
	246: 35,
	247: 46,
	248: 48,
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

},{}]},{},[1]);
