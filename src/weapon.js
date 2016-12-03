"use strict";

module.exports = exports = Weapon;

// I'm sure there's a better way to do this,
// especially wince we have to restrict weapon types to different classes. 
function Weapon(aName, aLevel) {
    this.type = "Weapon";
    this.name = aName;
    this.level = aLevel;

    switch (aName) {
        // Melee
        case "Longsword":
            this.damageMax = 10
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.properties = "+1 Min Damage";
            break;

        case "Morning Star":
            this.damageMax = 8
            this.damageMin = 1;
            this.damageType = "b";
            this.range = 1;
            this.hitBonus = 2;
            this.properties = "+2 to Hit";
            break;

        case "Halberd":
            this.damageMax = 8
            this.damageMin = 1;
            this.damageType = "s";
            this.range = 2;
            this.hitBonus = 0;
            this.properties = "+1 Range";
            break;

        case "Battleaxe":
            this.damageMax = 12
            this.damageMin = 4;
            this.damageType = "sb";
            this.range = 1;
            this.hitBonus = 1;
            this.properties = "+3 Min Damage, +1 Crit Chance";
            break;

        case "Claw":
            this.damageMax = 4
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.properties = "+1 Min Damage";
            break;

        // Ranged
        case "Bodkin":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 6;
            this.hitBonus = 3;
            this.properties = "+1 Range, +3 to Hit";
            break;

        case "Broadhead":
            this.damageMax = 6
            this.damageMin = 2;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.properties = "+1 Min Damage";
            break;

        case "Poison-Tipped":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.properties = "50% Poison Chance";
            break;

        case "Heavy Bolts":
            this.damageMax = 10
            this.damageMin = 4;
            this.damageType = "b";
            this.range = 3;
            this.hitBonus = 0;
            this.properties = "+3 Min Damage, -2 Range";
            break;

        // Spells
        case "Magic Missile":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 255;
            this.properties = "Never Misses";
            break;

        case "Fireball":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.properties = "Explodes on Contact, 50% Burn Chance";
            break;

        case "Frostbolt":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.properties = "50% Freeze Chance";
            break;

        case "Eldritch Blast":
            this.damageMax = 10
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = -2;
            this.properties = "-2 to Hit";
            break;
    }

    // static properties for entities
    this.position = { x: -1, y: -1 };
    this.size = { width: 72, height: 72 }; // correct size for sprites? Dylan?
}

Weapon.prototype.collided = function (aEntity) {

}

Weapon.prototype.processTurn = function () {

}

Weapon.prototype.retain = function () {
    return true;
}

Weapon.prototype.update = function () {

}

Weapon.prototype.render = function () {

}

