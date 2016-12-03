"use strict";

module.exports = exports = Armor;

function Armor(aType) {
    this.type = aType;

    switch (aType) {
        case "Flesh":
            this.defense = 3;
            this.strongType = "";
            this.weakType = "spb";
            break;

        case "Robes":
            this.defense = 5;
            this.strongType = "spb"; // Purely for balance.
            this.weakType = "";
            break;

        case "Hide":
            this.defense = 6;
            this.strongType = "b";
            this.weakType = "s";
            break;

        case "Leather":
            this.defense = 10;
            this.strongType = "s";
            this.weakType = "b";
            break;

        case "Chain":
            this.defense = 14;
            this.strongType = "s";
            this.weakType = "p";
            break;

        case "Plate":
            this.defense = 18;
            this.strongType = "p";
            this.weakType = "b";
            break;
    }

    // static properties for entities
    this.position = { x: -1, y: -1 };
    this.size = { width: 72, height: 72 }; // correct size for sprites? Dylan?
}

Armor.prototype.collided = function (aEntity) {

}

Armor.prototype.processTurn = function () {

}

Armor.prototype.retain = function () {
    return true;
}

Armor.prototype.update = function () {

}

Armor.prototype.render = function () {

}

