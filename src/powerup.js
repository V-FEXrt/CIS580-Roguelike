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
	this.spritesheet.src = './spritesheets/powerup.png';
	this.type = "Powerup";
	this.animation = true;
	this.currY = 0;
	this.movingUp =true;
	this.currPower = Math.floor((Math.random()*3)+1);
	this.used = false;
	}

/**
 * @function updates the Powerup object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Powerup.prototype.update = function(time) {
	if(this.currY >= 5) this.movingUp = false;
	else if(this.currY <= -5) this.movingUp = true;
	if (this.movingUp) this.currY+=.2;
	else this.currY-=.2;
}

Powerup.prototype.processTurn = function(input)
{

}
Powerup.prototype.collided = function(entity)
{ if(this.used) return;
	if(entity.type =="Player"){
		//Update player's health/strength/item
		if(entity.position.x == this.position.x && entity.position.y == this.position.y )	{
			switch (this.currPower) {
				case 1:
					entity.health+=5;
					this.used = true;
					console.log(entity.health);
					break;
				case 2:
					entity.stamina+=20;
					this.used = true;
					console.log(entity.stamina);
					break;
				case 3:
					entity.someOtherPowerup+=10;
					this.used = true;
					console.log(entity.someOtherPowerup);
					break;
			}}
	}


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
	if(this.used) return;
	var position = Vector.subtract(this.position, this.tilemap.draw.origin);
	switch (this.currPower) {
		case 1:
			ctx.drawImage(this.spritesheet,0, 49.7,25, 25,(position.x*this.size.width), (position.y*this.size.height)+this.currY,96,96);
			break;
		case 2:
			ctx.drawImage(this.spritesheet,50,49.7,25,25,(position.x*this.size.width), (position.y*this.size.height)+this.currY,96,96);
			break;
		case 3:
			ctx.drawImage(this.spritesheet,25,49.7,25,25,(position.x*this.size.width), (position.y*this.size.height)+this.currY,96,96);
			break;
		}
  }
	//Other potential powerups
	//ctx.drawImage(this.power,0,25,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
	//ctx.drawImage(this.power,25,50,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
