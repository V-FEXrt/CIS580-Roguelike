"use strict";

module.exports = exports = Click;

function Click(position, player, collisionCallback) {
  this.type = "Click";
  this.position = { x: position.x, y: position.y };
  // To change AOE change size of the click.
  this.size = {
    width: 96,
    height: 96
  }

  this.shouldRetain = true;
  this.player = player;
  this.collisionCallback = collisionCallback;
  this.color = "green"

  this.resolveCollision = false;
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
    var position = window.tilemap.toScreenCoords(this.position);
    ctx.fillStyle = this.color;
    ctx.fillRect(position.x * this.size.width, position.y * this.size.height, this.size.width, this.size.height);
    this.color = "green"
  }
}
