"use strict";

const Tilemap = require('./tilemap');
const Vector = require('./vector');
const RNG = require("./rng");

// weapon/armor shouldnt be done here...
// they can still be stored here if necessary, but 
// I think it might make more sense to have them 
// directly on the player/enemy?
const Weapon = require("./weapon");
const Armor = require("./armor");

module.exports = exports = CombatClass;

function CombatClass(aName, aLevel) {
    this.name = aName;
    this.difficulty = window.combatController.getDifficulty(aLevel);
    // set up random ish weapons/armor for enemies

    switch (aName) {
        case "Knight":
            this.health = 20;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Longsword", 1);
            this.armor = new Armor("Hide Armor", 1);
            this.status = { effect: "None", timer: 0 };
            break;

        case "Archer":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Broadhead", 1);
            this.armor = new Armor("Hide Armor", 1);
            this.status = { effect: "None", timer: 0 };
            break;

        case "Mage":
            this.health = 10;
            this.attackBonus = 0;
            this.damageBonus = 0;
            this.defenseBonus = 0;
            this.weapon = new Weapon("Eldritch Blast", 1);
            this.armor = new Armor("Robes", 1);
            this.status = { effect: "None", timer: 0 };
            break;


        case "Zombie":
            this.health = Math.max(10, 10 * this.difficulty);
            this.attackBonus = this.difficulty;
            this.damageBonus = this.difficulty;
            this.defenseBonus = this.difficulty;
            this.weapon = new Weapon("Claw", aLevel);
            this.armor = new Armor("Flesh", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 5;

            this.turnAI = function(aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= senseRange && distance.y <= senseRange) {
                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Skeletal Bowman":
            this.health = Math.max(10, 10 * this.difficulty);
            this.attackBonus = this.difficulty - 1;
            this.damageBonus = this.difficulty - 1;
            this.defenseBonus = this.difficulty - 1;
            this.weapon = new Weapon("Ancient Nord", aLevel);
            this.armor = new Armor("Bones", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 10;
            var prefDist = 4;
            var attackCooldown = 2;
            var moveOrAttack = 0;

            this.turnAI = function(aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);

                // Move
                if (distance.x > senseRange && distance.y > senseRange) {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                } else if (!moveOrAttack) {
                    // Check preferred engagement distance
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    var LoS = Vector.magnitude(distance) * 2 >= path.length;
                    if (LoS) {
                        if (distance.x < prefDist && distance.y < prefDist) {
                            aEnemy.position = moveBack(aEnemy.position, aEnemy.target.position);
                        } else if (distance.x > prefDist && distance.y > prefDist) {
                            aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                        }
                        moveOrAttack = 1;
                    } else {
                        aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                    }
                    // attackCooldown = 1;
                }
                // Attack
                else if (moveOrAttack) {
                    if (attackCooldown <= 0) {
                        if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                            var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                            var LoS = Vector.magnitude(distance) * 2 >= path.length;
                            if (LoS) {
                                combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                                attackCooldown = 2;
                            }
                        }
                    } else {
                        attackCooldown--;
                    }
                    moveOrAttack = 0;
                }
            }
            break;

        case "Captain":
            this.health = Math.max(25, 25 * this.difficulty - 1);
            this.attackBonus = this.difficulty + 2;
            this.damageBonus = this.difficulty + 2;
            this.defenseBonus = this.difficulty + 2;
            this.weapon = new Weapon("Battleaxe", aLevel);
            this.armor = new Armor("Chainmail", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 15;

            this.turnAI = function(aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= senseRange && distance.y <= senseRange) {
                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                } else {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Shaman":
            this.health = Math.max(15, 15 * this.difficulty - 1);
            this.attackBonus = this.difficulty + 1;
            this.damageBonus = this.difficulty + 1;
            this.defenseBonus = this.difficulty + 1;
            this.weapon = new Weapon("Eldritch Blast", aLevel);
            this.armor = new Armor("Robes", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 10;
            var prefDist = 5;
            var attackCooldown = 2;
            var moveOrAttack = 0;

            this.turnAI = function(aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);

                // Move
                if (distance.x > senseRange && distance.y > senseRange) {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                } else if (!moveOrAttack) {
                    // Check preferred engagement distance
                    var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                    var LoS = Vector.magnitude(distance) * 2 >= path.length;
                    if (!LoS) {
                        if (distance.x < prefDist && distance.y < prefDist) {
                            aEnemy.position = moveBack(aEnemy.position, aEnemy.target.position);
                        } else if (distance.x > prefDist && distance.y > prefDist) {
                            aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                        }
                        moveOrAttack = 1;
                    } else {
                        aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                    }
                    // attackCooldown = 1;
                }
                // Attack
                else if (moveOrAttack) {
                    if (attackCooldown <= 0) {
                        if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                            var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                            var LoS = Vector.magnitude(distance) * 2 >= path.length;
                            if (LoS) {
                                combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                                attackCooldown = 2;
                            }
                        }
                    } else {
                        attackCooldown--;
                    }
                    moveOrAttack = 0;
                }
            }
            break;
    }
}

function moveBack(a, b) {
    var newPos = new Object();
    if (a.x > b.x) newPos.x = a.x + 1;
    else if (a.x < b.x) newPos.x = a.x - 1;
    else newPos.x = a.x;

    if (a.y > b.y) newPos.y = a.y + 1;
    else if (a.y < b.y) newPos.y = a.y - 1;
    else newPos.y = a.y;

    // return moveToward(a, newPos);
    return newPos;
}

function moveToward(a, b) {
    var path = pathfinder.findPath(a, b);
    if (path.length > 1) return { x: path[1].x, y: path[1].y };
    else return a;
}

