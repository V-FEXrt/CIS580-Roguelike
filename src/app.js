"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Tilemap = require('./tilemap');
const tileset = require('../tilemaps/map3.json');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);

var tilemap = new Tilemap({width: canvas.width * 3, height: canvas.height * 3}, true, 64, 64, tileset, {
  onload: function() {
    masterLoop(performance.now());
  }
});

/**
 * @function onkeyup
 * Handles keydown events
 */
 var position = {x: 0, y: 0};
 window.onkeydown = function(event) {
   switch(event.key) {
     case "ArrowUp":
     case "w":
       position.y--;
       break;
     case "ArrowDown":
     case "s":
       position.y++;
       break;
     case "ArrowLeft":
     case "a":
       position.x--;
       break;
     case "ArrowRight":
     case "d":
       position.x++;
       break;
   }
   tilemap.moveTo({x: position.x * 32, y: position.y * 32});
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
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale((1/3), (1/3));
  tilemap.render(ctx);
  ctx.restore();
}
