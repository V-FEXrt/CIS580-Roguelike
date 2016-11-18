"use strict";

module.exports = exports = CombatStruct;

function CombatStruct(aType) {
    switch (aType) {
        case "Knight":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1; // Temporary until working
            this.armorLevel = 5; // Temporary until working
            this.attackType = "Melee";
            this.attackRange = 1;
            break;

        case "Archer":

            break;

        case "Mage":

            break;


        case "Enemy":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1;
            this.armorLevel = 3;
            this.attackType = "Melee";
            this.attackRange = 1;
            break;


    }
}