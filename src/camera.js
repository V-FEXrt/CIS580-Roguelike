"use strict";

/**
 * @module exports the Car class
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a new Camera object
 */
function Camera(player, tilemap) {
  this.player = player;
  this.tilemap = tilemap;
  this.position = {x: 0, y: 0};
}

Camera.prototype.processTurn = function() {
  if(this.player.position.y == 0){
    this.player.position.y++;
    this.tilemap.moveBy({x: 0, y:-1});
  }
  if(this.player.position.y == this.tilemap.draw.size.height - 2){
    this.player.position.y--;
    this.tilemap.moveBy({x: 0, y:1});
  }
  if(this.player.position.x == 0){
    this.player.position.x++;
    this.tilemap.moveBy({x: -1, y:0});
  }
  if(this.player.position.x == this.tilemap.draw.size.width - 2){
    this.player.position.x--;
    this.tilemap.moveBy({x: 1, y:0});
  }
  this.position = this.tilemap.draw.origin;
}
