"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');

/**
 * @module exports the Powerup class
 */
module.exports = exports = Powerup;

/**
 * @constructor Powerup
 * Creates a new Powerup object
 * @param {postition} position object specifying an x and y
 */
function Powerup(position, tilemap) {
	this.position = {x: position.x, y: position.y};
	this.size = {width: 96, height: 96};
	this.spritesheet  = new Image();
	this.tilemap = tilemap;
	this.spritesheet.src = './spritesheets/powerups.png';
	this.type = "Powerup";
	this.animation = true;
	}

/**
 * @function updates the Powerup object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Powerup.prototype.update = function(time) {
	//do nothing for now
}

Powerup.prototype.processTurn = function(input)
{

}
Powerup.prototype.collided = function(entity)
{

}
Powerup.prototype.retain = function()
{
	return true;
}


/**
 * @function renders the Powerup into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Powerup.prototype.render = function(elapsedTime, ctx) {
	var position = Vector.subtract(this.position, this.tilemap.draw.origin);
	if(this.animation){
  ctx.drawImage(
	this.spritesheet,
	0, 0,
	25, 25,
	position.x*this.size.width, position.y*this.size.height,
	96,96
  );
  this.animation = false;
  }
	else{
	ctx.drawImage(
	this.spritesheet,
	25, 0,
	25, 25,
	position.x*this.size.width, position.y*this.size.height,
	96,96
	);
	this.animation = true;
  }
	//Other potential powerups
	//ctx.drawImage(this.power,0,25,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
	//ctx.drawImage(this.power,25,50,25,25,position.x*this.size.width, position.y*this.size.height,96,96);

}
