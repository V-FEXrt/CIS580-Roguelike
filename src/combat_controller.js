"use strict";

module.exports = exports = CombatController;

const CombatClass = require("./combat_class");
const Weapon = require("./weapon");
const Armor = require("./armor");
const RNG = require("./rng");

function CombatController() {

}

CombatController.prototype.handleAttack = function (aAttackerClass, aDefenderClass) {
    var lAttackBase = Math.floor(aAttackerClass.attackBonus);
    var lAttackBonus = aAttackerClass.weapon.hitBonus;
    var lAttackRoll = RNG.rollRandom(1, 20);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;

    var lDefenseBase = aDefenderClass.armor.defense;
    var lDefenseBonus = Math.floor(aDefenderClass.defenseBonus);
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerClass.weapon.level - 1;
    var lDamageMax = aAttackerClass.weapon.damageMax;
    var lDamageMin = aAttackerClass.weapon.damageMin;
    var lDamageRoll = RNG.rollRandom(lDamageMin, lDamageMax);
    var lDamageBonus = Math.floor(aAttackerClass.damageBonus);
    var lDamageTotal = lDamageBase + lDamageBonus + lDamageRoll;

    var message;
    var attacker = aAttackerClass.type;
    var defender = aDefenderClass.type;
    var playerAttacker = (attacker == "Knight" || attacker == "Archer" || attacker == "Mage");
    if (lAttackRoll == 1) {
        var lSelfDamage = RNG.rollMultiple(1, 3, aAttackerClass.weapon.level);
        aAttackerClass.health -= lSelfDamage;
        // attacker hit itself, play attacker hit sound

        // If attacker is player
        if (playerAttacker) {
            message = `You critically fail your attack and hurt yourself for ${lSelfDamage} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker} critically fails its attack and takes ${lSelfDamage} damage.`;
        }
    } else if (lAttackRoll == 20 || (lAttackRoll == 19 && (aAttackerClass.attackType == "Ranged" || aAttackerClass.weapon.type == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderClass.health -= lDamageTotal;
        // defender hit, play defender hit sound

        // If attacker is player
        if (playerAttacker) {
            message = `Your attack is perfect, striking the ${defender} for ${lDamageTotal} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker}'s attack is perfect striking you for ${lDamageTotal} damage.`;
        }
    } else {
        if (lAttackTotal > lDefenseTotal) {
            aDefenderClass.health -= lDamageTotal;
            // defender hit, play defender hit sound

            // If attacker is player
            if (playerAttacker) {
                message = `Your attack strikes the ${defender} for ${lDamageTotal} damage.`;
            } else { // attacker is enemy
                message = `The ${attacker}'s attack strikes you for ${lDamageTotal} damage.`;
            }
        } else {
            // If attacker is player
            if (playerAttacker) {
                message = `Your attack misses the ${defender}.`;
            } else { // attacker is enemy
                message = `The ${attacker}'s attack misses you.`;
            }
        }
    }

    window.terminal.log(message + "\n");
}

CombatController.prototype.randomDrop = function (aPosition) {
    var lDrop = new Object();
    var lRand = RNG.rollRandom(1, 20); // need to set up weighted rands
    if (lRand > 17) {                           // spawn armor
        lDrop.type = "Armor";
        // TODO > properly implement...
        lDrop = new Armor("Leather");
    } else if (lRand >= 1 && lRand < 17) {      // spawn weapon
        lDrop.type = "Weapon";
        var playerClass = window.player.class;
        var level = RNG.rollRandom(window.player.level, window.player.level + 2); // need to set up weighted rands
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

