"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatStruct = require("./combat_struct");

module.exports = exports = Enemy;

function Enemy(position, tilemap, target) {
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.tilemap = tilemap;
    this.spritesheet = new Image();
    this.spritesheet.src = "./spritesheets/sprites.png";
    this.type = "Enemy";
    this.combat = new CombatStruct("Zombie");
    this.target = target;

    // console.log(this.position.x + " " + this.position.y);
}

Enemy.prototype.processTurn = function() {
    var path = pathfinder.findPath(this.position, this.target.position);
    this.position = path[1];
    var distance = Vector.subtract(this.position, this.target.position);
    if (Math.abs(distance.x) <= this.combat.attackRange && Math.abs(distance.y) <= this.combat.attackRange) {
        console.log("player within range");
        combatController.handleAttack(this.combat, this.target.combat);
    }
}

Enemy.prototype.update = function(time) {
    // if we're dead, we should probably do something
}

Enemy.prototype.collided = function(entity) {

}

Enemy.prototype.retain = function() {
    return this.combat.health > 0;
}

Enemy.prototype.render = function(elapsedTime, ctx) {
    var position = this.tilemap.toScreenCoords(this.position);
    ctx.drawImage(
        this.spritesheet,
        768, 576, // skeleton guy
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}