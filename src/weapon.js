"use strict";

module.exports = exports = Weapon;

// I'm sure there's a better way to do this,
// especially wince we have to restrict weapon types to different classes. 
function Weapon(aType, aLevel) {
    this.type = aType;
    this.level = aLevel;

    switch (aType) {
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

            break;

        case "Halberd":

            break;

        case "Battleaxe":

            break;

        // Ranged
        case "Bodkin":

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

            break;

        case "Heavy":

            break;

        // Spells
        case "Magic Missile":

            break;

        case "Fireball":

            break;

        case "Frostbolt":

            break;

        case "Eldritch Blast":
            this.damageMax = 10
            this.damageMin = 1;
            this.damageType = "m";
            this.range = 255;
            this.hitBonus = -1;
            this.properties = "-1 to Hit";
            break;
    }
}