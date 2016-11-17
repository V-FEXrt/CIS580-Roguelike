"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatStruct = require("./combat_struct");

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {postition} position object specifying an x and y
 */
function Player(position, tilemap, combatClass) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.tilemap = tilemap;
    this.spritesheet.src = './spritesheets/sprites.png';
    this.type = "Player";
    this.walk = [];
    this.class = combatClass;
    this.combat = new CombatStruct(this.class);

}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {

}

Player.prototype.walkPath = function (path, completion) {
    path.shift();
    this.walk = path;
    this.walkCompletion = completion;

    if (this.walk.length == 0) completion();
};

/**
 *@function handles the players turn
 *{input} keyboard input given for this turn
 */
Player.prototype.processTurn = function (input) {

    if (this.walk.length > 0) {
        // walk
        this.position = { x: this.walk[0].x, y: this.walk[0].y };
        this.walk.shift();
        var self = this;
        if (this.walk.length == 0) self.walkCompletion();
    } else {
        var change = { x: 0, y: 0 };
        if (input.up) change.y--;
        else if (input.down) change.y++;

        if (input.right) change.x++;
        else if (input.left) change.x--;

        var position = Vector.add(this.position, change);
        if (this.tilemap.isWall(position.x, position.y)) return;

        this.position = position;
    }

    var screenCoor = this.tilemap.toScreenCoords(this.position);

    if (screenCoor.y < 1) {
        this.tilemap.moveBy({ x: 0, y: -1 });
    }

    if (screenCoor.y + 1 == this.tilemap.draw.size.height) {
        this.tilemap.moveBy({ x: 0, y: 1 });
    }

    if (screenCoor.x < 1) {
        this.tilemap.moveBy({ x: -1, y: 0 });
    }

    if (screenCoor.x + 1 == this.tilemap.draw.size.width) {
        this.tilemap.moveBy({ x: 1, y: 0 });
    }

}

Player.prototype.collided = function (entity) {
}

Player.prototype.retain = function () {
    return this.combat.health >= 0;
}

/**
 * @function renders the player into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function (elapsedTime, ctx) {
    var position = this.tilemap.toScreenCoords(this.position);

    ctx.drawImage(
        this.spritesheet,
        96, 480,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );

}
