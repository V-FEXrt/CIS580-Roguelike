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
    var lDamageTotal = Math.max(lDamageBase + lDamageBonus + lDamageRoll - lDamageResist, 1); // DR shouldnt deal zero or negative damage

    var lApplyEffect = false;

    var message;
    var attacker = aAttackerClass.name;
    var defender = aDefenderClass.name;
    var playerAttacker = (attacker == "Knight" || attacker == "Archer" || attacker == "Mage");

    if (lAttackRoll == 1) {
        var lSelfDamage = RNG.rollMultiple(1, 3, Math.max(1, aAttackerClass.weapon.level / 5));
        aAttackerClass.health -= lSelfDamage;
        if (aAttackerClass.health <= 0) { // Crit fail cant kill an entity
            lSelfDamage - (1 - aAttackerClass.health);
            aAttackerClass.health = 1;
        }

        // If attacker is player
        if (playerAttacker) {
            message = `You critically fail your attack and hurt yourself for ${lSelfDamage} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker} critically fails its attack and takes ${lSelfDamage} damage.`;
        }
    } else if (lAttackRoll == 20 || (lAttackRoll >= 18 && (aAttackerClass.weapon.attackType == "Ranged" || aAttackerClass.weapon.name == "Battleaxe"))) {
        lDamageTotal += lDamageMax;
        aDefenderClass.health -= lDamageTotal;
        window.sfx.play("attackSound");

        if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(1, 4);

        // If attacker is player
        if (playerAttacker) {
            message = `Your attack is perfect, striking the ${defender} for ${lDamageTotal} damage.`;
        } else { // attacker is enemy
            message = `The ${attacker}'s attack is perfect, striking you for ${lDamageTotal} damage.`;
        }
    } else {
        if (lAttackTotal > lDefenseTotal || aAttackerClass.weapon.name == "Magic Missile") {
            aDefenderClass.health -= lDamageTotal;
            window.sfx.play("attackSound");

            if (lAttackEffect != "") lApplyEffect = RNG.rollWeighted(1, 1);

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

    if (aDefenderClass.health <= 0) {
        message = message.replace(".", ", killing it.");
        if (playerAttacker) {
            switch (defender) {
                case "Zombie":
                    player.score += 5;
                    break;

                case "Skeleton":
                    player.score += 10;
                    break;

                case "Shaman":
                    player.score += 20;
                    break;

                case "Minotaur":
                    player.score += 35;
                    break;

                case "Dragon":
                    player.score += 100;
                    break;
            }
        }
    }
    window.terminal.log(message, window.colors.combat);
    if (lApplyEffect) {
        aDefenderClass.status.effect = lAttackEffect;
        aDefenderClass.status.timer = 3;
        window.terminal.log(`The ${defender} is now ${lAttackEffect}.`, window.colors.combat);
    }
}

CombatController.prototype.handleStatus = function (aCombatClass) {
    switch (aCombatClass.status.effect) {
        case "Burned":
        case "Poisoned":
            if (aCombatClass.status.timer > 0) {
                aCombatClass.status.timer--;
                var damage = RNG.rollMultiple(1, 5, Math.max(1, window.player.level / 5));
                aCombatClass.health -= damage;
                window.terminal.log(`${damage} ${aCombatClass.status.effect.substring(0, aCombatClass.status.effect.length - 2)} damage.`, window.colors.combat);
            } else {
                aCombatClass.status.effect == "None";
            }
            break;

        case "Stunned":
        case "Frozen":
            if (aCombatClass.status.timer > 1) {
                aCombatClass.status.timer--;
                window.terminal.log(`The ${aCombatClass.name} is ${aCombatClass.status.effect}.`, window.colors.combat);
            } else if (aCombatClass.status.timer == 1) {
                if (RNG.rollWeighted(1, 1)) aCombatClass.status.timer--;
                else window.terminal.log(`The ${aCombatClass.name} is ${aCombatClass.status.effect}.`, window.colors.combat);
            } else {
                aCombatClass.status.effect = "None";
            }
            break;

        default:
            return;
    }
}

CombatController.prototype.randomDrop = function (aPosition) {
    var lDrop = new Object();
    var lRand = RNG.rollRandom(1, 20);
    var level = window.player.level + RNG.rollWeighted(5, 4, 1);

    if (lRand > 17) {                           // spawn armor
        var armorArray = getArmors();
        var robesChance = (window.player.class == "Mage") ? 30 : 10;
        var armorRand = RNG.rollWeighted(robesChance, 35, 35, 10, 5);
        lDrop = new Armor(armorArray[armorRand], level);
    } else if (lRand > 1 && lRand < 17) {       // spawn weapon
        var classRand = getClass(window.player.class);
        var weaponArray = getWeapons()[classRand];
        var weaponRand = RNG.rollRandom(0, weaponArray.length - 1);
        lDrop = new Weapon(weaponArray[weaponRand], level);
    } else {                                    // dont spawn anything
        lDrop.type = "None";
    }
    lDrop.position = { x: aPosition.x, y: aPosition.y };
    return lDrop;
}

CombatController.prototype.getPercentArray = function (aDragonLevel) {
    if (aDragonLevel) {
        // damage, health, defense, attack, zombie, skeleton, minotaur, shaman, empty
        var baseWeights = [15, 25, 15, 15, 0, 0, 0, 0, 5];
        return baseWeights;
    } else {
        // damage, health, defense, attack, zombie, skeleton, minotaur, shaman, empty
        var baseWeights = [10, 10, 15, 15, 20, 10, 3, 2, 5];
        var level = window.player.level;
        var diff = this.getDifficulty(level);

        var damageWeight = baseWeights[0];
        var healthWeight = baseWeights[1];
        var defenseWeight = baseWeights[2];
        var attackWeight = baseWeights[3];

        var zombieWeight = baseWeights[4] + diff;
        var skeletonWeight;
        var minotaurWeight;
        var shamanWeight;
        switch (level) {
            case 1:
                skeletonWeight = 0;
                minotaurWeight = 0;
                shamanWeight = 0;
                break;

            case 2:
                skeletonWeight = baseWeights[5] / 2;
                minotaurWeight = 0;
                shamanWeight = 0;
                break;

            case 3:
                skeletonWeight = baseWeights[5];
                minotaurWeight = 0;
                shamanWeight = 0;
                break;

            default:
                skeletonWeight = baseWeights[5] + diff;
                minotaurWeight = diff * baseWeights[6];
                shamanWeight = diff * baseWeights[7];
                break;
        }

        var emptyWeight = baseWeights[8];

        return [damageWeight, healthWeight, defenseWeight, attackWeight,
            zombieWeight, skeletonWeight, minotaurWeight, shamanWeight, emptyWeight];
    }

}

CombatController.prototype.getDifficulty = function (aLevel) {
    return Math.max(0, Math.floor(aLevel / 3));
}

CombatController.prototype.healthPotion = function (aLevel) {
    return RNG.rollMultiple(1, 4, Math.max(2, this.getDifficulty(aLevel))) + 2;
}

function getClass(aClass) {
    switch (aClass) {
        case "Knight":
            return RNG.rollWeighted(5, 1, 1);
        case "Archer":
            return RNG.rollWeighted(1, 5, 1);
        case "Mage":
            return RNG.rollWeighted(1, 1, 5);
    }
}

function getArmors() {
    return ["Robes", "Hide Armor", "Leathers", "Chainmail", "Plate Armor"];
}

function getWeapons() {
    return [
        ["Longsword", "Morning Star", "Halberd", "Battleaxe"],
        ["Bodkin", "Broadhead", "Poison-Tipped", "Heavy Bolts"],
        ["Magic Missile", "Fireball", "Frostbolt", "Eldritch Blast"]
    ];
}
