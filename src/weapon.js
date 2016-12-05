"use strict";

module.exports = exports = Weapon;

// I'm sure there's a better way to do this,
// especially wince we have to restrict weapon types to different classes.
function Weapon(aName, aLevel) {
    this.type = "Weapon";
    this.name = aName;
    this.level = aLevel;
    this.shouldRetain = true;

    switch (aName) {
        // Melee
        case "Longsword":
            this.damageMax = 10
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            break;

        case "Morning Star":
            this.damageMax = 8
            this.damageMin = 1;
            this.damageType = "b";
            this.range = 1;
            this.hitBonus = 3;
            this.attackEffect = "";
            this.properties = "+3 to Hit";
            break;

        case "Halberd":
            this.damageMax = 8
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 2;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Range, +1 Min Damage";
            break;

        case "Battleaxe":
            this.damageMax = 12
            this.damageMin = 4;
            this.damageType = "sb";
            this.range = 1;
            this.hitBonus = 1;
            this.attackEffect = "";
            this.properties = "+3 Min Damage, +1 Crit Chance";
            break;

        case "Claw":
            this.damageMax = 4
            this.damageMin = 2;
            this.damageType = "s";
            this.range = 1;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            break;

        // Ranged
        case "Bodkin":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 3;
            this.attackEffect = "";
            this.properties = "+3 to Hit";
            break;

        case "Broadhead":
            this.damageMax = 6
            this.damageMin = 2;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+1 Min Damage";
            break;

        case "Poison-Tipped":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "p";
            this.range = 5;
            this.hitBonus = 0;
            this.attackEffect = "Poisoned";
            this.properties = "50% Poison Chance";
            break;

        case "Heavy Bolts":
            this.damageMax = 10
            this.damageMin = 4;
            this.damageType = "b";
            this.range = 3;
            this.hitBonus = 0;
            this.attackEffect = "";
            this.properties = "+3 Min Damage, -2 Range";
            break;

        // Spells
        case "Magic Missile":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 255;
            this.attackEffect = "";
            this.properties = "Unerring Accuracy";
            break;

        case "Fireball":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.attackEffect = "Burned";
            this.properties = "50% Burn Chance, Explodes on Contact";
            break;

        case "Frostbolt":
            this.damageMax = 4
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = 0;
            this.attackEffect = "Frozen";
            this.properties = "50% Freeze Chance";
            break;

        case "Eldritch Blast":
            this.damageMax = 10
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = -2;
            this.attackEffect = "";
            this.properties = "-2 to Hit";
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

Weapon.prototype.collided = function (aEntity) {
    if (aEntity.type == "Player") {
        aEntity.inventory.addWeapon(this);
        this.shouldRetain = false;
    }
}

Weapon.prototype.processTurn = function () {

}

Weapon.prototype.retain = function () {
    return this.shouldRetain;
}

Weapon.prototype.update = function () {
    if (this.currY >= 5) this.movingUp = false;
    else if (this.currY <= -5) this.movingUp = true;
    if (this.movingUp) this.currY += .2;
    else this.currY -= .2;
}

Weapon.prototype.render = function (time, ctx) {
    var position = window.tilemap.toScreenCoords(this.position);
    ctx.drawImage(this.spritesheet, 375, 75, 75, 75, (position.x * this.size.width), (position.y * this.size.height) + this.currY, 96, 96);
}
