"use strict";

const Tilemap = require('./tilemap');
const CombatClass = require("./combat_class");

module.exports = exports = Enemy;

function Enemy(position, tilemap, combatClass, target, onDeathCB) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.tilemap = tilemap;
    this.spritesheet = new Image();
    this.spritesheet.src = "./spritesheets/sprites.png";
    this.type = "Enemy";
    this.class = combatClass;
    this.combat = new CombatClass(this.class);
    this.target = target;
    this.onDeathCB = onDeathCB;
}

Enemy.prototype.processTurn = function() {
    if (this.combat.status.effect != "None") window.combatController.handleStatus(this.combat);
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead" || this.combat.status.effect == "Frozen") return;

    this.combat.turnAI(this);
}

Enemy.prototype.update = function(time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) {
        this.state = "dead";
    }
}

Enemy.prototype.collided = function(entity) {

}

Enemy.prototype.retain = function() {
    if (this.combat.health <= 0) {
        this.onDeathCB(this.position, this.tilemap);
        return false;
    } else {
        return true;
    }
}

Enemy.prototype.render = function(elapsedTime, ctx) {
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

