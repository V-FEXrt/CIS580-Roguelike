"use strict";

const Tilemap = require('./tilemap');
const CombatStruct = require("./combat_struct");

module.exports = exports = Enemy;

function Enemy(position, tilemap, combatClass, target) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 95, height: 95 };
    this.tilemap = tilemap;
    this.spritesheet = new Image();
    this.spritesheet.src = "./spritesheets/sprites.png";
    this.type = "Enemy";
    this.class = combatClass;
    this.combat = new CombatStruct(this.class);
    this.target = target;

    // console.log(this.position.x + " " + this.position.y);
}

Enemy.prototype.processTurn = function () {
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead") return; // shouldnt be necessary

    this.combat.turnAI(this);
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
