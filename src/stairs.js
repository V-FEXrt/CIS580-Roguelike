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
function Stairs(position, travelStairs) {
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.type = "Stairs";
    this.travelStairs = travelStairs;

    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/powerup.png';

    this.beginTransition = false
    this.time = 0;

    this.spriteOff = 0;

	this.resolveCollision = false;
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
  else if(this.resolveCollision){
	  this.resolveCollision = false;
	  entity.resolveCollision = true;
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
  var position = window.tilemap.toScreenCoords(this.position);

  ctx.drawImage(this.spritesheet, 75 + this.spriteOff, 0, 75, 75, (position.x * this.size.width), (position.y * this.size.height), 96, 96);
}
