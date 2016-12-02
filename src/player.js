"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatClass = require("./combat_class");

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
    this.changeClass(combatClass);
    this.level = 0;
    this.shouldProcessTurn = true;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
    // if we're dead, we should probably do something
    if (this.combat.health <= 0) this.state = "dead";
}

Player.prototype.walkPath = function(path, completion) {
    if (this.state == "dead") return; // shouldnt be necessary

    path.shift();
    this.walk = path;
    this.walkCompletion = completion;

    if (this.walk.length == 0) completion();
};

//Changes the player class, used because right now things
//rely on player being created before class is actually chosen.
//Potentially change this
Player.prototype.changeClass = function(chosenClass) {
    this.class = chosenClass;
    this.combat = new CombatClass(chosenClass);

    if (this.class == "Knight") {
        this.spritesheetPos = { x: 1, y: 5 };
    } else if (this.class == "Mage") {
        this.spritesheetPos = { x: 9, y: 5 };
    } else if (this.class == "Archer") {
        this.spritesheetPos = { x: 7, y: 6 };
    }
};

/**
 *@function handles the players turn
 *{input} keyboard input given for this turn
 */
Player.prototype.processTurn = function(input) {

    if (!this.shouldProcessTurn) return;

    if (this.combat.health <= 0) this.state = "dead";
    if (this.state == "dead") return; // shouldnt be necessary


    if (hasUserInput(input)) {
        // Cancel walk
        this.walk = [];
    }

    if (this.walk.length > 0) {
        // walk
        this.position = { x: this.walk[0].x, y: this.walk[0].y };
        this.walk.shift();
        if (this.walk.length == 0) this.walkCompletion();
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

    if (screenCoor.y < 3) {
        this.tilemap.moveBy({ x: 0, y: -1 });
    }

    if (screenCoor.y + 3 == this.tilemap.draw.size.height) {
        this.tilemap.moveBy({ x: 0, y: 1 });
    }

    if (screenCoor.x < 5) {
        this.tilemap.moveBy({ x: -1, y: 0 });
    }

    if (screenCoor.x + 5 >= this.tilemap.draw.size.width) {
        this.tilemap.moveBy({ x: 1, y: 0 });
    }

}

Player.prototype.collided = function(entity) {
    if (entity.type == "Stairs") {
        this.shouldProcessTurn = false;
    }
}

Player.prototype.retain = function() {
    return this.combat.health > 0;
}

/**
 * @function renders the player into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(elapsedTime, ctx) {
    if (this.state == "dead") return; // shouldnt be necessary

    var position = this.tilemap.toScreenCoords(this.position);

    ctx.drawImage(
        this.spritesheet,
        96 * this.spritesheetPos.x, 96 * this.spritesheetPos.y,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}

function hasUserInput(input) {
    return input.up || input.down || input.right || input.left;
}

