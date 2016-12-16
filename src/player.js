"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatClass = require("./combat_class");
const Inventory = require('./inventory.js');
const Weapon = require('./weapon.js');
const Armor = require('./armor.js');
const Powerup = require('./powerup.js');
const Animator = require('./animator.js');
const EntitySpawner = require('./entity_spawner');
/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {postition} position object specifying an x and y
 */
function Player(position, combatClass) {
    this.state = "idle";
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/player_animations.png';
    this.type = "Player";
    this.walk = [];
    this.changeClass(combatClass);
    this.level = 0;
    this.shouldProcessTurn = true;
    this.shouldEndGame = false;
    this.hasMoved = false;
    this.direction = "right";
    this.oldDirection = "right";
	  this.resolveCollision = false;
    window.terminal.addCommand("class", "Get your player class", this.getClass.bind(this));
    window.terminal.addCommand("kill", "Kill yourself", this.killPlayer.bind(this));
    window.terminal.addCommand("look", "Get info about the item at your feet", this.lookCommand.bind(this));
    window.terminal.addCommand("take", "Get the item at your feet", this.takeCommand.bind(this));
    window.terminal.addCommand("coords", "Get your current coordinates", this.coordsCommand.bind(this));
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {
    if (this.combat.health <= 0 && this.state != "dead") {
        this.state = "dead";
        if (this.animator.state != "dead" && this.animator.state != "dying") {
            this.animator.updateState("dying");
            this.shouldProcessTurn = false;
        }

    }
    if (this.animator.state == "dead") {
        this.animator.updateState("nothing");
        this.shouldEndGame = true;
    }
    this.animator.update(time);
}

Player.prototype.debugModeChanged = function () {
    if (window.gameDebug) {
        window.terminal.addCommand("tp", "Teleport to the specified coordinates", this.teleportCommand.bind(this));
        window.terminal.addCommand("health", "Set the Player's health", this.healthCommand.bind(this));
    }
    else {
        window.terminal.removeCommand("tp");
        window.terminal.removeCommand("health");
    }
}

Player.prototype.teleportCommand = function (args) {
    if (args.length != 3) {
        window.terminal.log("Syntax: tp <x> <y>", window.colors.invalid);
    }
    else {
        var x = 0;
        var y = 0;
        if (args[1].charAt(0) == "*") x = parseInt(args[1].slice(1)) + parseInt(this.position.x);
        else x = args[1];
        if (args[2].charAt(0) == "*") y = parseInt(args[2].slice(1)) + parseInt(this.position.y);
        else y = args[2];
        if (parseInt(x) != x || parseInt(y) != y) window.terminal.log("Syntax: tp <x> <y>", window.colors.invalid);
        else {
            window.terminal.log(`Teleporting player to x: ${x} y: ${y}`, window.colors.cmdResponse);
            window.player.position.x = parseInt(x);
            window.player.position.y = parseInt(y);
            window.tilemap.moveTo({ x: x - 5, y: y - 5 });
        }
    }
}

Player.prototype.healthCommand = function (args) {
    if (args.length != 2 || parseInt(args[1]) != args[1]) {
        window.terminal.log("You must provide an integer value", window.colors.invalid);
        return;
    }
    window.terminal.log("Set health to " + args[1], window.colors.cmdResponse);
    this.combat.health = parseInt(args[1]);
}
Player.prototype.walkPath = function (path, completion) {
    if (this.state == "dead") return; // shouldnt be necessary

    path.shift();
    this.walk = path;
    this.walkCompletion = completion;

    if (this.walk.length == 0) completion();
};

//Changes the player class, used because right now things
//rely on player being created before class is actually chosen.
//Potentially change this
Player.prototype.changeClass = function (chosenClass) {
    this.level = 0;
    this.class = chosenClass;
    this.combat = new CombatClass(chosenClass);
    this.inventory = new Inventory(this.combat.weapon, this.combat.armor);
    this.state = "idle";

    if (this.class == "Knight") {
        //this.spritesheetPos = { x: 1, y: 5 };
        this.animator = new Animator(3, this.state, this.class);
    } else if (this.class == "Mage") {
        //this.spritesheetPos = { x: 9, y: 5 };
        this.animator = new Animator(6, this.state, this.class);
    } else if (this.class == "Archer") {
        //this.spritesheetPos = { x: 7, y: 6 };
        this.animator = new Animator(0, this.state, this.class);
    }
};

Player.prototype.lookCommand = function () {
    if (typeof this.collidingWith == "undefined") {
        window.terminal.log("Nothing at your feet", window.colors.invalid);
        return;
    }

    window.terminal.log(this.collidingWith.toString(), window.colors.cmdResponse);
}

Player.prototype.takeCommand = function () {
    if (typeof this.collidingWith == "undefined") {
        window.terminal.log("Nothing to take", window.colors.invalid);
        return;
    }
    if (this.collidingWith.type == "Weapon") {
        this.inventory.addWeapon(this.collidingWith);
        window.sfx.play("weaponPickUp");
    } else if (this.collidingWith.type == "Armor") {
        this.inventory.addArmor(this.collidingWith);
        window.sfx.play("armorPickUp");
    }
}

Player.prototype.coordsCommand = function () {
    window.terminal.log(`You are at x: ${this.position.x} y: ${this.position.y}`, window.colors.cmdResponse);
}

Player.prototype.getClass = function (args) {
    if (args.length > 1) {
        // we have args
        if (args[1] != "Knight" && args[1] != "Mage" && args[1] != "Archer") {
            window.terminal.log("Invalid class type", window.colors.invalid);
            return;
        }
        this.changeClass(args[1]);
        window.terminal.log("Changing class to " + this.class, window.colors.cmdResponse);
        return;
    }
    window.terminal.log("Class: " + this.class, window.colors.cmdResponse);
}

/**
 *@function handles the players turn
 *{input} keyboard input given for this turn
 */
Player.prototype.processTurn = function (input) {
    if (!this.shouldProcessTurn) return;
    this.collidingWith = undefined;
    if (this.combat.status.effect != "None") window.combatController.handleStatus(this.combat);
    if (this.state == "dead" || this.combat.status.effect == "Frozen") return;

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
        if (window.tilemap.isWall(position.x, position.y)) return;

        this.position = { x: position.x, y: position.y };
    }

    var screenCoor = window.tilemap.toScreenCoords(this.position);

    if (screenCoor.y < 5) {
        window.tilemap.moveBy({ x: 0, y: -1 });
    }

    if (screenCoor.y + 5 == window.tilemap.draw.size.height) {
        window.tilemap.moveBy({ x: 0, y: 1 });
    }

    if (screenCoor.x < 5) {
        window.tilemap.moveBy({ x: -1, y: 0 });
    }

    if (screenCoor.x + 5 >= window.tilemap.draw.size.width) {
        window.tilemap.moveBy({ x: 1, y: 0 });
    }

    this.hasMoved = true;
}

Player.prototype.collided = function (entity) {
    if (entity.type == "Stairs") {
        this.shouldProcessTurn = false;
    }
    if (entity.type == "Weapon" || entity.type == "Armor") {
        this.collidingWith = entity;
        if (this.hasMoved) {
            this.lookCommand();
            this.hasMoved = false;
        }
    }
}


Player.prototype.retain = function () {
    return !this.shouldEndGame;
}

/**
 * @function renders the player into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function (elapsedTime, ctx) {
    //if (this.state == "dead") return; // shouldnt be necessary

    var position = window.tilemap.toScreenCoords(this.position);

    ctx.drawImage(
        this.spritesheet,
        96 * this.animator.index.x, 96 * this.animator.index.y,
        96, 96,
        position.x * this.size.width, position.y * this.size.height,
        96, 96
    );
}

Player.prototype.killPlayer = function () {
    this.combat.health = 0;
    if (this.state != "dead") {
        if (this.direction == "down") {
            if (this.oldDirection == "right") this.animator.changeDirection("right");
            else this.animator.changeDirection("left");
        }
        else {
            if (!this.direction == "up") this.oldDirection = direction;
            this.animator.changeDirection(this.direction);
        }
    }
}

Player.prototype.changeDirection = function (direction) {
    if (this.state != "dead") {
        if (direction == "down") {
            if (this.oldDirection == "right") this.animator.changeDirection("right");
            else this.animator.changeDirection("left");
        }
        else {
            if (!direction == "up") this.oldDirection = direction;
            this.animator.changeDirection(direction);
        }
    }
}

Player.prototype.playAttack = function (clickPos) {
    if (this.state != "dead") {
        this.animator.updateState("attacking");
        var position = window.tilemap.toScreenCoords(this.position);

        if (clickPos.x < (position.x * this.size.width + 40)) this.changeDirection("left");
        else this.changeDirection("right");
    }
}

function hasUserInput(input) {
    return input.up || input.down || input.right || input.left;
}
