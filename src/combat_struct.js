"use strict";

module.exports = exports = CombatStruct;

function CombatStruct(aType) {
    switch (aType) {
        case "Player":
            this.Health = 10;
            this.WeaponLevel = 1; // Temporary until working
            this.ArmorLevel = 5; // Temporary until working
            this.AttackType = "Melee";
            this.AttackRange = 1;
            break;

        case "Enemy":
            this.Health = 10;
            this.WeaponLevel = 1;
            this.ArmorLevel = 3;
            this.AttackType = "Melee";
            this.AttackRange = 1;
            break;

        // case "PlayerMelee":
        // case "PlayerRange":
        // case "PlayerMagic":
        // case "EnemySimple":
    }
}