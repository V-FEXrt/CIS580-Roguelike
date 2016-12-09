"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const CombatClass = require("./combat_class");
const Inventory = require('./inventory.js');
const Weapon = require('./weapon.js');
const Armor = require('./armor.js');
const Powerup = require('./powerup.js');

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
    this.shouldEndGame = false;
    this.hasMoved = false;

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
        this.shouldEndGame = true;
    }
}

Player.prototype.debugModeChanged = function () {
    if (window.gameDebug) {
        window.terminal.addCommand("godmode", "Make yourself invincible",
            function () {
                window.terminal.log("You are now invincible", window.colors.cmdResponse);
                this.combat.health = Number.POSITIVE_INFINITY;
            });
        window.terminal.addCommand("tp", "Teleport to the specified coordinates", this.teleportCommand.bind(this));
        window.terminal.addCommand("spawn", "Spawn an entity at a given location", this.spawnCommand.bind(this));
        window.terminal.addCommand("health", "Set the Player's health", this.healthCommand.bind(this));
    }
    else {
        window.terminal.removeCommand("godmode");
        window.terminal.removeCommand("tp");
        window.terminal.removeCommand("health");
    }
}

Player.prototype.spawnCommand = function (args) {
    if (args.length == 1) window.terminal.log("Requires parameters", window.colors.invalid);
    else {
        switch (args[1]) {
            case "weapon":
                if (args[2] == "MorningStar") args[2] = "Morning Star";
                if (args[2] == "HeavyBolts") args[2] = "Heavy Bolts";
                if (args[2] == "MagicMissile") args[2] = "Magic Missile";
                if (args[2] == "EldritchBlast") args[2] = "Eldritch Blast";
                var weapon = new Weapon(args[2], args[3]);
                weapon.position.x = args[4];
                weapon.position.y = args[5];
                window.entityManager.addEntity(weapon);
                break;
            case "armor":
                if (args[2] == "HideArmor") args[2] = "Hide Armor";
                if (args[2] == "LeatherArmor") args[2] = "Leather Armor";
                if (args[2] == "PlateArmor") args[2] = "Plate Armor";
                var armor = new Armor(args[2], args[3]);
                armor.position.x = args[4];
                armor.position.y = args[5];
                window.entityManager.addEntity(armor);
                break;
            default:
                window.terminal.log("Invalid entity name", window.colors.invalid);
        }
    }
}

Player.prototype.teleportCommand = function (args) {
    if (args == 1) {
        window.terminal.log("Must include parameters x and y", window.colors.invalid);
    }
    else {
        var x = 0;
        var y = 0;
        if (args[1].charAt(0) == "*") x = parseInt(args[1].slice(1)) + parseInt(this.position.x);
        else x = args[1];
        if (args[2].charAt(0) == "*") y = parseInt(args[2].slice(1)) + parseInt(this.position.y);
        else y = args[2];
        window.terminal.log(`Teleporting player to x: ${x} y: ${y}`, window.colors.cmdResponse);
        window.player.position.x = parseInt(x);
        window.player.position.y = parseInt(y);
        tilemap.moveTo({ x: x - 5, y: y - 5 });
    }
}

Player.prototype.healthCommand = function (args) {
    this.combat.health = args[1];
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
        this.spritesheetPos = { x: 1, y: 5 };
    } else if (this.class == "Mage") {
        this.spritesheetPos = { x: 9, y: 5 };
    } else if (this.class == "Archer") {
        this.spritesheetPos = { x: 7, y: 6 };
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
    } else if (this.collidingWith.type == "Armor") {
        this.inventory.addArmor(this.collidingWith);
    }
}

Player.prototype.coordsCommand = function () {
    window.terminal.log(`You are at x: ${this.position.x} y: ${this.position.y}`, window.colors.cmdResponse);
}

Player.prototype.getClass = function (args) {
    if (args.length > 1) {
        // we have args
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
        if (this.tilemap.isWall(position.x, position.y)) return;

        this.position = position;
    }

    var screenCoor = this.tilemap.toScreenCoords(this.position);

    if (screenCoor.y < 5) {
        this.tilemap.moveBy({ x: 0, y: -1 });
    }

    if (screenCoor.y + 5 == this.tilemap.draw.size.height) {
        this.tilemap.moveBy({ x: 0, y: 1 });
    }

    if (screenCoor.x < 5) {
        this.tilemap.moveBy({ x: -1, y: 0 });
    }

    if (screenCoor.x + 5 >= this.tilemap.draw.size.width) {
        this.tilemap.moveBy({ x: 1, y: 0 });
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

Player.prototype.killPlayer = function () {
    this.combat.health = 0;
}

function hasUserInput(input) {
    return input.up || input.down || input.right || input.left;
}
