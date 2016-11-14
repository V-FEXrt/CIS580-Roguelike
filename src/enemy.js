"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');

module.exports = exports = Enemy;

function Enemy(position, tilemap) {
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = tilemap;
    this.spritesheet.src = "./spritesheets/sprites.png";
    this.type = "Enemy";
}

Enemy.prototype.processTurn = function () {

}

Enemy.prototype.update = function (time) {

}

Enemy.prototype.render = function (elapsedTime, ctx) {
    var position = Vector.subtract(this.position, this.tilemap.draw.origin);
    ctx.drawImage(
        this.spritesheet,
        768, 576, // skeleton guy
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}