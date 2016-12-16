"use strict";

const Tilemap = require('./tilemap');
const CombatClass = require("./combat_class");
const Animator = require("./animator.js");
module.exports = exports = Enemy;

function Enemy(position, combatClass, target, onDeathCB) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.spritesheet.src = "./spritesheets/enemy_animations.png";
    this.type = "Enemy";
    this.class = combatClass;
    this.combat = new CombatClass(this.class, target.level);
    this.target = target;
    this.onDeathCB = onDeathCB;
    this.oldX = this.position.x;
    this.oldY = this.position.y;
    this.resolveCollision = false;

    if (this.class == "Shaman") {
        this.animator = new Animator(0, "idle", "Shaman");
    } else if (this.class == "Zombie") {
        this.animator = new Animator(3, "idle", "Zombie");
    } else if (this.class == "Skeleton") {
        this.animator = new Animator(9, "idle", "Skeleton");
    } else if (this.class == "Minotaur") {
        this.animator = new Animator(6, "idle", "Minotaur");
    } else if (this.class == "Fucking Dragon") {
        this.animator = new Animator(12, "idle", "Fucking Dragon");
    }
}

Enemy.prototype.processTurn = function () {
    if (this.combat.status.effect != "None") window.combatController.handleStatus(this.combat);
    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead" || this.combat.status.effect == "Frozen" || this.combat.status.effect == "Stunned") return;

    this.combat.turnAI(this);

    if (this.position.x < this.oldX) this.changeDirection("left");
    else if (this.position.x > this.oldX) this.changeDirection("right");
    this.oldX = this.position.x;
    this.oldY = this.position.y;
}

Enemy.prototype.update = function (time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) {
        this.state = "dead";
    }

    this.animator.update(time);
}

Enemy.prototype.collided = function (entity) {

}

Enemy.prototype.retain = function () {
    if (this.combat.health <= 0) {
        if (this.class == "Fucking Dragon") {
            // add stairs
        } else {
            this.onDeathCB(this.position, window.tilemap);
        }
        return false;
    } else {
        return true;
    }
}

Enemy.prototype.playAttack = function (clickPos) {
    if (this.state != "dead" && this.target.state != "dead") {
        var position = window.tilemap.toScreenCoords(this.position);
        var playerPos = window.tilemap.toScreenCoords(this.target.position);

        if (playerPos.x < position.x) this.changeDirection("left");
        else if (playerPos.x > position.x) this.changeDirection("right");

        this.animator.updateState("attacking");
    }
}

Enemy.prototype.changeDirection = function (direction) {
    if (this.state != "dead") {
        this.animator.changeDirection(direction);
    }
}

Enemy.prototype.render = function (elapsedTime, ctx) {
    if (this.state == "dead") return; // shouldnt be necessary

    ctx.imageSmoothingEnabled = false;

    var position = window.tilemap.toScreenCoords(this.position);
    if (this.name != "Fucking Dragon") ctx.drawImage(
        this.spritesheet,
        96 * this.animator.index.x, 96 * this.animator.index.y,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
    else ctx.drawImage(
        this.spritesheet,
        96 * this.animator.index.x, 96 * this.animator.index.y,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        192, 192
    );
}

