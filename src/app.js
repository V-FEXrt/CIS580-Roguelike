"use strict";

window.debug = false;

/* Classes and Libraries */
const Game = require('./game');
const EntityManager = require('./entity_manager');
const Tilemap = require('./tilemap');
const tileset = require('../tilemaps/tiledef.json');
const Player = require('./player');
const Enemy = require("./enemy");
const Pathfinder = require('./pathfinder.js');
const Vector = require('./vector');
const CombatController = require("./combat_controller");

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var entityManager = new EntityManager();
var combatController = new CombatController();


var tilemap = new Tilemap({ width: canvas.width, height: canvas.height }, 64, 64, tileset, {
  onload: function () {
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

var randPos;                    //{x: , y: }
var turnTimer = 0;
var defaultTurnDelay = 400;     //Default turn between turns
var turnDelay = defaultTurnDelay; //current time between turns
var autoTurn = false;           //If true, reduces time between turns and turns happen automatically
var resetTimer = true;          //Take turn immediately on movement key press if true
var loopCount = 0; //Temporary until camera movement is done

randPos = tilemap.findOpenSpace();
var player = new Player({ x: randPos.x, y: randPos.y }, tilemap, "Knight");

var enemy = new Enemy({ x: randPos.x + 1, y: randPos.y + 1 }, tilemap); // temp - just spawn next to player

window.player = player;

entityManager.addEntity(player);
entityManager.addEntity(enemy);

tilemap.moveTo({ x: randPos.x - 3, y: randPos.y - 4 });

canvas.onclick = function (event) {
  var node = {
    x: parseInt(event.offsetX / 96),
    y: parseInt(event.offsetY / 96)
  }

  turnDelay = defaultTurnDelay / 2;
  autoTurn = true;

  var clickedWorldPos = Vector.add(tilemap.draw.origin, node);
  if (enemy.position.x == clickedWorldPos.x && enemy.position.y == clickedWorldPos.y) {
    console.log("clicked on enemy");
    var distance = Vector.subtract(player.position, enemy.position);
    if (Math.abs(distance.x) <= player.combat.AttackRange && Math.abs(distance.y) <= player.combat.AttackRange) {
      console.log("enemy within range");
      combatController.handleAttack(player.combat, enemy.combat);
    }
  } else {
    player.walkPath(pathfinder.findPath(player.position, clickedWorldPos), function () {
      turnDelay = defaultTurnDelay;
      autoTurn = false;
    });
  }
}

/**
 * @function onkeydown
 * Handles keydown events
 */
var position = { x: 0, y: 0 };
window.onkeydown = function (event) {
  switch (event.key) {
    case "ArrowUp":
    case "w":
      //position.y--;
      input.up = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      //position.y++;
      input.down = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      //position.x--;
      input.left = true;
      if (resetTimer) {
        turnTimer = turnDelay;
        resetTimer = false;
      }
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      //position.x++;
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

  if (input.left || input.right || input.up || input.down || autoTurn) {
    turnTimer += elapsedTime;
    if (turnTimer >= turnDelay) {
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
function processTurn() {
  entityManager.processTurn(input);
}
