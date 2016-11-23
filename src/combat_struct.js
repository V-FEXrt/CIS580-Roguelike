"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');

module.exports = exports = CombatStruct;

function CombatStruct(aType) {
    switch (aType) {
        case "Knight":
            this.health = 20;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1; // Temporary until working
            this.armorLevel = 5; // Temporary until working
            this.attackType = "Melee";
            this.attackRange = 1;
            break;

        case "Archer":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1; // Temporary until working
            this.armorLevel = 3; // Temporary until working
            this.attackType = "Ranged";
            this.attackRange = 5;
            break;

        case "Mage":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1; // Temporary until working
            this.armorLevel = 3; // Temporary until working
            this.attackType = "Magic";
            this.attackRange = 255;
            break;


        case "Zombie":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1;
            this.armorLevel = 1;
            this.attackType = "Melee";
            this.attackRange = 1;
            this.senseRange = 15; // This might be too high, what if we keep the camera centered..?

            this.turnAI = function (aEnemy) {
                // console.log("\nenemy turn");
                // console.log(aEnemy.position.x + " " + aEnemy.position.y);
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.attackRange && distance.y <= aEnemy.combat.attackRange) {
                    console.log("player within attack range");
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    console.log("player within sense range");
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    console.log("moving randomly");
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
                // console.log(aEnemy.position.x + " " + aEnemy.position.y);
            }
            break;

        case "EnemyRanged":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1;
            this.armorLevel = 3;
            this.attackType = "Ranged";
            this.attackRange = 5;
            this.senseRange = 15;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.attackRange && distance.y <= aEnemy.combat.attackRange) {
                    console.log("player within attack range");
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    console.log("player within sense range");
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    console.log("moving randomly");
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Captain":
            this.health = 25;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1;
            this.armorLevel = 5;
            this.attackType = "Melee";
            this.attackRange = 1;
            this.senseRange = 20;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.attackRange && distance.y <= aEnemy.combat.attackRange) {
                    console.log("player within attack range");
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    console.log("player within sense range");
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    console.log("moving randomly");
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Shaman":
            this.health = 10;
            this.stamina = 100;
            this.someOtherPowerup = 50;
            this.weaponLevel = 1;
            this.armorLevel = 1;
            this.attackType = "Magic";
            this.attackRange = 10;
            this.senseRange = 15;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.attackRange && distance.y <= aEnemy.combat.attackRange) {
                    console.log("player within attack range");
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= aEnemy.combat.senseRange && distance.y <= aEnemy.combat.senseRange) {
                    console.log("player within sense range");
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    aEnemy.position = { x: path[1].x, y: path[1].y };
                } else {
                    console.log("moving randomly");
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;
    }
}

