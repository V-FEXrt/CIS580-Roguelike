"use strict";

const Tilemap = require('./tilemap');

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
	var oldPos = {x: this.position.x, y: this.position.y};
	if(input.up) this.position.y--;
	else if(input.down) this.position.y++;

	if (input.right) this.position.x++;
	else if(input.left) this.position.x--;

	if(this.tilemap.isWall(this.position.x, this.position.y)) this.position = oldPos;
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

  ctx.drawImage(
	this.spritesheet,
	96, 480,
	96, 96,
	this.position.x*this.size.width, this.position.y*this.size.height,
	96,96
	);

}
