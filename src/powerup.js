"use strict";

const Tilemap = require('./tilemap');

/**
 * @module exports the Powerup class
 */
module.exports = exports = Powerup;

//declare sound files
var healthPickupSound = new Audio('sounds/Powerup3.wav');
healthPickupSound.volume = 0.2;
var staminaPickupSound = new Audio('sounds/Powerup4.wav');
staminaPickupSound.volume = 0.1;
var someOtherPowerupSound = new Audio('sounds/Powerup1.wav');
someOtherPowerupSound.volume = 0.2;

/**
 * @constructor Powerup
 * Creates a new Powerup object
 * @param {postition} position object specifying an x and y
 */
function Powerup(position, tilemap) {
    this.position = { x: position.x, y: position.y };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.tilemap = tilemap;
    this.spritesheet.src = './spritesheets/powerup.png';
    this.type = "Powerup";
    this.animation = true;
    this.currY = 0;
    this.movingUp = true;
    this.currPower = Math.floor((Math.random() * 3) + 1);
    this.used = false;
}

/**
 * @function updates the Powerup object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Powerup.prototype.update = function (time) {
    if (this.currY >= 5) this.movingUp = false;
    else if (this.currY <= -5) this.movingUp = true;
    if (this.movingUp) this.currY += .2;
    else this.currY -= .2;
}

Powerup.prototype.processTurn = function (input) {

}

Powerup.prototype.collided = function (entity) {
    if (this.used) return;
    if (entity.type == "Player") {
        //Update player's health/strength/item
        switch (this.currPower) {
            case 1:
                entity.combat.health += 5;
                healthPickupSound.play();
                this.used = true;
                break;
            case 2:
                entity.combat.stamina += 20;
                staminaPickupSound.play();
                this.used = true;
                break;
            case 3:
                entity.combat.someOtherPowerup += 10;
                someOtherPowerupSound.play();
                this.used = true;
                break;
        }
    }
}

Powerup.prototype.retain = function () {
    return !this.used;
}

/**
 * @function renders the Powerup into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Powerup.prototype.render = function (elapsedTime, ctx) {
    var position = this.tilemap.toScreenCoords(this.position);
    switch (this.currPower) {
        case 1:
            ctx.drawImage(this.spritesheet, 0, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
            break;
        case 2:
            ctx.drawImage(this.spritesheet, 150, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
            break;
        case 3:
            ctx.drawImage(this.spritesheet, 75, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
            break;
    }
}

    //Other potential powerups
    //ctx.drawImage(this.power,0,25,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
    //ctx.drawImage(this.power,25,50,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
