"use strict";

module.exports = exports = CombatController;

const CombatClass = require("./combat_class");
const Weapon = require("./weapon");
const Armor = require("./armor");

function CombatController() {

}

CombatController.prototype.handleAttack = function(aAttackerClass, aDefenderClass) {
    var lAttackBase = Math.floor(aAttackerClass.attackBonus);
    var lAttackBonus = aAttackerClass.weapon.hitBonus;
    var lAttackRoll = rollRandom(1, 21);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;

    var lDefenseBase = aDefenderClass.armor.defense;
    var lDefenseBonus = Math.floor(aDefenderClass.defenseBonus);
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerClass.weapon.level - 1;
    var lDamageMax = aAttackerClass.weapon.damageMax;
    var lDamageMin = aAttackerClass.weapon.damageMin;
    var lDamageRoll = rollRandom(lDamageMin, 1 + lDamageMax);
    var lDamageBonus = Math.floor(aAttackerClass.damageBonus);
    var lDamageTotal = lDamageBase + lDamageBonus + lDamageRoll;

    if (lAttackRoll == 1) {
        var lSelfDamage = rollRandom(1, lDamageMax + 1);
        aAttackerClass.health -= lSelfDamage;
        window.terminal.log("Crit Fail, take " + lSelfDamage + " damage.");
        // attacker hit itself, play attacker hit sound
        // aDefenderClass.type != "Knight"||"Archer"||"Mage"
    } else if (lAttackRoll == 20 || (lAttackRoll == 19 && (aAttackerClass.attackType == "Ranged" || aAttackerClass.weapon.type == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderClass.health -= lDamageTotal;
        // defender hit, play defender hit sound
    } else {
        if (lAttackTotal > lDefenseTotal) {
            aDefenderClass.health -= lDamageTotal;
            window.terminal.log("Hit, deal " + lDamageTotal + " damage");
            // defender hit, play defender hit sound
        } else {
            window.terminal.log("Miss, " + lAttackTotal + " against " + lDefenseTotal);
        }
    }
}

CombatController.prototype.rollRandom = function(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}

CombatController.prototype.randomDrop = function(aPosition) {
    var lDrop = new Object();
    var lRand = rollRandom(1, 21); // need to set up weighted rands
    if (lRand > 17) {                           // spawn armor
        lDrop.type = "Armor";
        // TODO > properly implement...
        lDrop = new Armor("Leather");
    } else if (lRand >= 1 && lRand < 17) {      // spawn weapon
        lDrop.type = "Weapon";
        var playerClass = window.player.class;
        var level = rollRandom(window.player.level, window.player.level + 3); // need to set up weighted rands
        switch (lRand % 4) {
            // this is awful, why is this still here?
            case 0:
                lDrop = (playerClass == "Knight") ? new Weapon("Longsword", level) : (playerClass == "Archer") ? new Weapon("Bodkin", level) : new Weapon("Magic Missile", level);
                break;

            case 1:
                lDrop = (playerClass == "Knight") ? new Weapon("Morning Star", level) : (playerClass == "Archer") ? new Weapon("Broadhead", level) : new Weapon("Fireball", level);
                break;

            case 2:
                lDrop = (playerClass == "Knight") ? new Weapon("Halberd", level) : (playerClass == "Archer") ? new Weapon("Poison-Tipped", level) : new Weapon("Frostbolt", level);
                break;

            case 3:
                lDrop = (playerClass == "Knight") ? new Weapon("Battleaxe", level) : (playerClass == "Archer") ? new Weapon("Heavy Bolts", level) : new Weapon("Eldritch Blast", level);
                break;
        }
    } else {                                    // dont spawn anything
        lDrop.type = "None";
    }
    lDrop.position = aPosition;
    return lDrop;
}

