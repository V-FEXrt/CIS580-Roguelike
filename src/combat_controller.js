"use strict";

module.exports = exports = CombatController;

const CombatStruct = require("./combat_struct");
const Weapon = require("./weapon");
const Armor = require("./armor");

function CombatController() {

}

CombatController.prototype.handleAttack = function(aAttackerStruct, aDefenderStruct) {
    // console.log("attacker health: " + aAttackerStruct.health);
    // console.log("defender health: " + aDefenderStruct.health);

    var lAttackBase = 0;
    var lAttackBonus = aAttackerStruct.weapon.hitBonus;
    var lAttackRoll = rollRandom(1, 21);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;

    var lDefenseBase = aDefenderStruct.armor.defense;
    var lDefenseBonus = 0;
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerStruct.weapon.level - 1;
    var lDamageMax = aAttackerStruct.weapon.damageMax;
    var lDamageMin = aAttackerStruct.weapon.damageMin;
    var lDamageRoll = rollRandom(lDamageMin, 1 + lDamageMax);
    var lDamageBonus = 0;
    var lDamageTotal = lDamageBase + lDamageBonus + lDamageRoll;

    if (lAttackRoll == 1) {
        var lSelfDamage = rollRandom(1, lDamageMax + 1);
        aAttackerStruct.health -= lSelfDamage;
        console.log("Crit Fail, take " + lSelfDamage + " damage.");
    } else if (lAttackRoll == 20 || (lAttackRoll == 19 && (aAttackerStruct.attackType == "Ranged" || aAttackerStruct.weapon.type == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderStruct.health -= lDamageTotal;
    } else {
        if (lAttackTotal > lDefenseTotal) {
            aDefenderStruct.health -= lDamageTotal;
            console.log("Hit, deal " + lDamageTotal + " damage");
        } else {
            console.log("Miss, " + lAttackTotal + " against " + lDefenseTotal);
        }
    }


    // console.log("attacker health: " + aAttackerStruct.health);
    // console.log("defender health: " + aDefenderStruct.health);
    console.log("\n\n");
}

function rollRandom(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}

function randomDrop() {
    var lReturn;
    var lRand = rollRandom(1, 21); // need to set up weighted rands
    if (lRand > 17) {
        // spawn armor?
        console.log("drop armor?");
    } else {
        var playerClass = window.player.class;
        var level = rollRandom(window.player.level, window.player.level + 3); // need to set up weighted rands
        switch (lRand % 4) {
            // this is awful, why is this still here?
            case 0:
                lReturn = (playerClass == "Knight") ? new weapon("Longsword", level) : (playerClass == "Archer") ? new weapon("Bodkin", level) : new weapon("Magic Missile", level);
                break;

            case 1:
                lReturn = (playerClass == "Knight") ? new weapon("Morning Star", level) : (playerClass == "Archer") ? new weapon("Broadhead", level) : new weapon("Fireball", level);
                break;

            case 2:
                lReturn = (playerClass == "Knight") ? new weapon("Halberd", level) : (playerClass == "Archer") ? new weapon("Poison-Tipped", level) : new weapon("Frostbolt", level);
                break;

            case 3:
                lReturn = (playerClass == "Knight") ? new weapon("Battleaxe", level) : (playerClass == "Archer") ? new weapon("Heavy Bolts", level) : new weapon("Eldritch Blast", level);
                break;
        }
    }
    return lReturn;
}

