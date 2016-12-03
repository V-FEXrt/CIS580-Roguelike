"use strict";

const Tilemap = require('./tilemap');

/**
 * @module exports the Powerup class
 */
module.exports = exports = Powerup;

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
  this.currPower = window.combatController.rollRandom(1, 5);
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
        entity.combat.damageBonus += 0.2;
        window.terminal.log("The crystal radiates a bright blue and you feel its energy course through you.");
        if (window.debug) console.log(entity.combat.damageBonus);
        this.used = true;
        break;
      case 2:
        var potionValue = window.combatController.rollMultiple(3, 6, entity.level);
        entity.combat.health += potionValue;
        window.terminal.log("You quaff the large crimson potion and feel rejuvenated.");
        if (window.debug) console.log("+" + potionValue + " health = " + entity.combat.health);
        this.used = true;
        break;
      case 3:
        entity.combat.defenseBonus += 0.2;
        window.terminal.log("As you finish the potion a faint ward forms around you.");
        if (window.debug) console.log(entity.combat.defenseBonus);
        this.used = true;
        break;
      case 4:
        entity.combat.attackBonus += 0.2;
        window.terminal.log("The very smell of the verdant green potion awakens you and you feel more agile.");
        if (window.debug) console.log(entity.combat.attackBonus);
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
      ctx.drawImage(this.spritesheet, 75, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
    case 3:
      ctx.drawImage(this.spritesheet, 150, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
    case 4:
      ctx.drawImage(this.spritesheet, 225, 150, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
      break;
  }
}

    //Other potential powerups
    //ctx.drawImage(this.power,0,25,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
    //ctx.drawImage(this.power,25,50,25,25,position.x*this.size.width, position.y*this.size.height,96,96);
