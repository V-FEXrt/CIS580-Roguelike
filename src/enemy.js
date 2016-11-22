"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatStruct = require("./combat_struct");

module.exports = exports = Enemy;

function Enemy(position, tilemap, target) {
    this.state = "idle";
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

Enemy.prototype.processTurn = function () {
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead") return; // shouldnt be necessary

    var distance = Vector.distance(this.position, this.target.position);
    if (distance.x <= this.combat.attackRange && distance.y <= this.combat.attackRange) {
        console.log("player within range");
        combatController.handleAttack(this.combat, this.target.combat);
    } else if (distance.x <= this.combat.senseRange && distance.y <= this.combat.senseRange) {
        var path = pathfinder.findPath(this.position, this.target.position);
        this.position = path[1];
    }
}

Enemy.prototype.update = function (time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) this.state = "dead";
}

Enemy.prototype.collided = function (entity) {

}

Enemy.prototype.retain = function () {
    return this.combat.health > 0;
}

Enemy.prototype.render = function (elapsedTime, ctx) {
    if (this.state == "dead") return; // shouldnt be necessary

    var position = this.tilemap.toScreenCoords(this.position);
    ctx.drawImage(
        this.spritesheet,
        768, 576, // skeleton guy
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}

