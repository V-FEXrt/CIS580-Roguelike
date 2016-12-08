"use strict";

module.exports = exports = CombatController;

const CombatClass = require("./combat_class");
const Weapon = require("./weapon");
const Armor = require("./armor");
const RNG = require("./rng");

function CombatController() {

}

CombatController.prototype.handleAttack = function(aAttackerClass, aDefenderClass) {
    var lAttackBase = Math.floor(aAttackerClass.attackBonus);
    var lAttackBonus = aAttackerClass.weapon.hitBonus;
    var lAttackRoll = RNG.rollRandom(1, 20);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;
    var lAttackEffect = aAttackerClass.weapon.attackEffect;

    var lDefenseBase = aDefenderClass.armor.defense;
    var lDefenseBonus = Math.floor(aDefenderClass.defenseBonus);
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerClass.weapon.level - 1;
    var lDamageMax = aAttackerClass.weapon.damageMax;
    var lDamageMin = aAttackerClass.weapon.damageMin;
    var lDamageRoll = RNG.rollRandom(lDamageMin, lDamageMax);
    var lDamageBonus = Math.floor(aAttackerClass.damageBonus);
    var lDamageResist = aDefenderClass.armor.level;
    var lDamageTotal = Math.max(lDamageBase + lDamageBonus + lDamageRoll - lDamageResist, 0); // DR shouldnt deal zero or negative damage

    var lApplyEffect = false;

    var message;
    var attacker = aAttackerClass.name;
    var defender = aDefenderClass.name;
    var playerAttacker = (attacker == "Knight" || attacker == "Archer" || attacker == "Mage");

    if (lAttackRoll == 1) {
        var lSelfDamage = RNG.rollMultiple(1, 3, aAttackerClass.weapon.level);
        aAttackerClass.health -= lSelfDamage;
        if (aAttackerClass.health <= 0) { // Crit fail cant kill an entity
            lSelfDamage - (1 - aAttackerClass.health);
            aAttackerClass.health = 1;
        }
        // attacker hit itself, play attacker hit sound

        // If attacker is player
        if (playerAttacker) {
            message = `You critically fail your attack and hurt yourself for ${lSelfDamage} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker} critically fails its attack and takes ${lSelfDamage} damage.`;
        }
    } else if (lAttackRoll == 20 || (lAttackRoll == 19 && (aAttackerClass.weapon.attackType == "Ranged" || aAttackerClass.weapon.name == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderClass.health -= lDamageTotal;
        // defender hit, play defender hit sound

        if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(25, 75);

        // If attacker is player
        if (playerAttacker) {
            message = `Your attack is perfect, striking the ${defender} for ${lDamageTotal} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker}'s attack is perfect, striking you for ${lDamageTotal} damage.`;
        }
    } else {
        if (lAttackTotal > lDefenseTotal || aAttackerClass.weapon.name == "Magic Missile") {
            aDefenderClass.health -= lDamageTotal;
            // defender hit, play defender hit sound

            if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(50, 50);

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

    if (aDefenderClass.health <= 0) message = message.replace(".", ", killing it.");
    window.terminal.log(message, window.colors.combat);
    if (lApplyEffect) {
        aDefenderClass.status.effect = lAttackEffect;
        aDefenderClass.status.timer = 2;
        window.terminal.log(`The ${defender} is now ${lAttackEffect}.`, window.colors.combat);
    }
}

CombatController.prototype.handleStatus = function(aCombatClass) {
    switch (aCombatClass.status.effect) {
        case "Burned":
        case "Poisoned":
            if (aCombatClass.status.timer > 0) {
                aCombatClass.status.timer--;
                var damage = RNG.rollMultiple(1, 5, window.player.level);
                aCombatClass.health -= damage;
                window.terminal.log(`${damage} ${aCombatClass.status.effect.substring(0, aCombatClass.status.effect.length - 2)} damage.`, window.colors.combat);
            } else {
                aCombatClass.status.effect == "None";
            }
            break;

        case "Frozen":
            switch (aCombatClass.status.timer) {
                case 2:
                    aCombatClass.status.timer--;
                    window.terminal.log("Frozen", window.colors.combat);
                    return;

                case 1:
                    if (RNG.rollWeighted(50, 50)) aCombatClass.status.timer--;
                    else window.terminal.log("Frozen", window.colors.combat);

                case 0:
                    aCombatClass.status.effect = "None";
                    break;
            }
            break;

        default:
            return;
    }
}

CombatController.prototype.randomDrop = function(aPosition) {
    var lDrop = new Object();
    var lRand = RNG.rollRandom(1, 20);
    var level = window.player.level + RNG.rollWeighted(50, 40, 10);

    if (lRand > 17) {                           // spawn armor
        var armorArray = getArmors();
        var robesChance = (window.player.class == "Mage") ? 30 : 10;
        var armorRand = RNG.rollWeighted(robesChance, 35, 35, 10, 5);
        lDrop = new Armor(armorArray[armorRand], level);
    } else if (lRand > 1 && lRand < 17) {       // spawn weapon
        var weaponArray = getWeapons(window.player.class); // TODO > Can spawn other classes weapons for fluff once invalid check is implemented
        var weaponRand = RNG.rollRandom(0, weaponArray.length - 1);
        lDrop = new Weapon(weaponArray[weaponRand], level);
    } else {                                    // dont spawn anything
        lDrop.type = "None";
    }
    lDrop.position = aPosition;
    return lDrop;
}

function getArmors() {
    return ["Robes", "Hide Armor", "Leather Armor", "Chainmail", "Plate Armor"];
}

function getWeapons(aClass) {
    switch (aClass) {
        case "Knight":
            return ["Longsword", "Morning Star", "Halberd", "Battleaxe"];

        case "Archer":
            return ["Bodkin", "Broadhead", "Poison-Tipped", "Heavy Bolts"];

        case "Mage":
            return ["Magic Missile", "Fireball", "Frostbolt", "Eldritch Blast"];
    }
}