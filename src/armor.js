"use strict";

module.exports = exports = Armor;

function Armor(aName, aLevel) {
    this.type = "Armor";
    this.name = aName;
    this.level = aLevel;
    this.shouldRetain = true;

    switch (aName) {
        case "Flesh":
            this.defense = 3;
            this.strongType = "";
            this.weakType = "spb";
            break;

        case "Bones":
            this.defense = 5;
            this.strongType = "p";
            this.weakType = "b";
            break;

        case "Robes":
            this.defense = 5;
            this.strongType = "spb"; // Purely for balance.
            this.weakType = "";
            break;

        case "Hide Armor":
            this.defense = 6;
            this.strongType = "b";
            this.weakType = "s";
            break;

        case "Leathers":
            this.defense = 10;
            this.strongType = "s";
            this.weakType = "b";
            break;

        case "Chainmail":
            this.defense = 14;
            this.strongType = "s";
            this.weakType = "p";
            break;

        case "Plate Armor":
            this.defense = 18;
            this.strongType = "p";
            this.weakType = "b";
            break;
    }

    // static properties for entities
    this.position = { x: -1, y: -1 };
    this.size = { width: 96, height: 96 };
    this.spritesheet = new Image();
    this.spritesheet.src = './spritesheets/powerup.png';

    this.currY = 0;
    this.movingUp = true;
}

Armor.prototype.collided = function(aEntity) {

}

Armor.prototype.processTurn = function() {

}

Armor.prototype.retain = function() {
    return this.shouldRetain;
}

Armor.prototype.update = function() {
    if (this.currY >= 5) this.movingUp = false;
    else if (this.currY <= -5) this.movingUp = true;
    if (this.movingUp) this.currY += .2;
    else this.currY -= .2;
}

Armor.prototype.render = function(time, ctx) {
    var position = window.tilemap.toScreenCoords(this.position);
    ctx.drawImage(this.spritesheet, 305, 225, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);

}

Armor.prototype.toString = function() {
    return `Level ${this.level} ${this.name} with ${this.defense} defense`;
}
