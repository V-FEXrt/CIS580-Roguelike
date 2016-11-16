"use strict";

module.exports = exports = CombatStruct;

function CombatStruct(aType) {
    switch (aType) {
        case "Knight":
            this.Health = 10;
            this.WeaponLevel = 1; // Temporary until working
            this.ArmorLevel = 5; // Temporary until working
            this.AttackType = "Melee";
            this.AttackRange = 1;
            break;

        case "Archer":

            break;

        case "Mage":

            break;


        case "Enemy":
            this.Health = 10;
            this.WeaponLevel = 1;
            this.ArmorLevel = 3;
            this.AttackType = "Melee";
            this.AttackRange = 1;
            break;


    }
}