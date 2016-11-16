"use strict";

module.exports = exports = CombatController;

const CombatStruct = require("./combat_struct");

function CombatController() {

}

CombatController.prototype.handleAttack = function (aAttackerStruct, aDefenderStruct) {
    var lAttackBase = aAttackerStruct.WeaponLevel;
    var lAttackBonus = 0;
    var lAttackRoll = rollRandom(1, 21);
    var lAttackTotal = lAttackBase + lAttackBonus + lAttackRoll;

    var lDefenseBase = aDefenderStruct.ArmorLevel;
    var lDefenseBonus = 0;
    var lDefenseTotal = lDefenseBase + lDefenseBonus;

    var lDamageBase = aAttackerStruct.WeaponLevel;
    var lDamageBonus = getWeaponBonus(aAttackerStruct.WeaponLevel);
    var lDamageRoll = rollRandom(1, 1 + getWeaponDamage(aAttackerStruct.WeaponLevel));
    var lDamageTotal = lDamageBase + lDamageBonus + lDamageRoll;

    // roll attack
    // 1, 20, else 

    // roll damage
}

// refactor later, just get it down
function getWeaponBonus(aLevel) {
    switch (aLevel % 3) {
        case 0:
            return 2;

        case 1:
            return 0;

        case 2:
            return 1;
    }
}

function getWeaponDamage(aLevel) {
    return 4 + 2 * Math.floor((aLevel - 1) / 3);
}

function rollRandom(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}