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
            this.health = 25;
            this.attackBonus = 0;
            this.damageBonus = 1;
            this.defenseBonus = 2;
            this.weapon = new Weapon("Longsword", 1);
            this.armor = new Armor("Hide Armor", 1);
            this.status = { effect: "None", timer: 0 };
            break;

        case "Archer":
            this.health = 10;
            this.attackBonus = 2;
            this.damageBonus = 0;
            this.defenseBonus = 1;
            this.weapon = new Weapon("Broadhead", 1);
            this.armor = new Armor("Hide Armor", 1);
            this.status = { effect: "None", timer: 0 };
            break;

        case "Mage":
            this.health = 10;
            this.attackBonus = -1;
            this.damageBonus = 2;
            this.defenseBonus = 1;
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

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    aEnemy.playAttack();
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= senseRange && distance.y <= senseRange) {
                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                } else {
                    var nextTile = window.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Skeleton":
            this.health = Math.max(8, 8 * this.difficulty);
            this.attackBonus = this.difficulty - 1;
            this.damageBonus = this.difficulty - 2;
            this.defenseBonus = this.difficulty - 1;
            this.weapon = new Weapon("Ancient Nord", aLevel);
            this.armor = new Armor("Bones", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 10;
            var prefDist = 4;
            var attackCooldown = 2;
            var moveOrAttack = 0;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);

                if (distance.x > senseRange && distance.y > senseRange) {
                    var nextTile = window.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                } else {
                    if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                        var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                        var LoS = Vector.magnitude(distance) * 2 >= path.length;
                        if (LoS) {
                            if (moveOrAttack) {
                                if (attackCooldown <= 0) {
                                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                                    attackCooldown = 2;
                                }
                                moveOrAttack = 0;
                            } else {
                                if (distance.x < prefDist && distance.y < prefDist) {
                                    aEnemy.position = moveBack(aEnemy.position, aEnemy.target.position, window.tilemap.getRandomAdjacentArray(aEnemy.position));
                                } else if (distance.x >= prefDist && distance.y >= prefDist) {
                                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                                }
                                moveOrAttack = 1;
                                attackCooldown = 1;
                            }
                            attackCooldown--;
                        } else {
                            aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                        }
                    } else {
                        aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                    }
                }
            }
            break;

        case "Minotaur":
            this.health = Math.max(25, 25 * this.difficulty - 1);
            this.attackBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 2;
            this.damageBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 2;
            this.defenseBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 2;
            this.weapon = new Weapon("Battleaxe", aLevel);
            this.armor = new Armor("Chainmail", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 15;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);
                if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                    aEnemy.playAttack();
                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                } else if (distance.x <= senseRange && distance.y <= senseRange) {
                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                } else {
                    var nextTile = window.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                }
            }
            break;

        case "Shaman":
            this.health = Math.max(15, 15 * this.difficulty - 1);
            this.attackBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 1;
            this.damageBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 1;
            this.defenseBonus = (this.difficulty <= 1) ? 0 : this.difficulty + 1;
            this.weapon = new Weapon("Eldritch Blast", aLevel);
            this.armor = new Armor("Robes", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 10;
            var prefDist = 5;
            var attackCooldown = 2;
            var moveOrAttack = 0;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);

                if (distance.x > senseRange && distance.y > senseRange) {
                    var nextTile = window.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                } else {
                    if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                        var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                        var LoS = Vector.magnitude(distance) * 2 >= path.length;
                        if (LoS) {
                            if (moveOrAttack) {
                                if (attackCooldown <= 0) {
                                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                                    attackCooldown = 2;
                                }
                                moveOrAttack = 0;
                            } else {
                                if (distance.x < prefDist && distance.y < prefDist) {
                                    aEnemy.position = moveBack(aEnemy.position, aEnemy.target.position, window.tilemap.getRandomAdjacentArray(aEnemy.position));
                                } else if (distance.x >= prefDist && distance.y >= prefDist) {
                                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                                }
                                moveOrAttack = 1;
                                attackCooldown = 1;
                            }
                            attackCooldown--;
                        } else {
                            aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                        }
                    } else {
                        aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                    }
                }
            }
            break;

        case "Fucking Dragon":
            this.health = 30 + 2 * aLevel;
            this.attackBonus = 3;
            this.damageBonus = 5;
            this.defenseBonus = 3;
            this.weapon = new Weapon("Dragon's Breath", aLevel);
            this.armor = new Armor("Dragonscale", aLevel);
            this.status = { effect: "None", timer: 0 };
            var senseRange = 20;
            var prefDist = 3;
            var attackCooldown = 3;
            var moveOrAttack = 0;

            this.turnAI = function (aEnemy) {
                var distance = Vector.distance(aEnemy.position, aEnemy.target.position);

                if (distance.x > senseRange && distance.y > senseRange) {
                    var nextTile = aEnemy.tilemap.getRandomAdjacent(aEnemy.position);
                    aEnemy.position = { x: nextTile.x, y: nextTile.y };
                } else {
                    if (distance.x <= aEnemy.combat.weapon.range && distance.y <= aEnemy.combat.weapon.range) {
                        var path = pathfinder.findPath(aEnemy.position, aEnemy.target.position);
                        var LoS = Vector.magnitude(distance) * 2 >= path.length;
                        if (LoS) {
                            if (moveOrAttack) {
                                if (attackCooldown <= 0) {
                                    combatController.handleAttack(aEnemy.combat, aEnemy.target.combat);
                                    attackCooldown = 2;
                                }
                                moveOrAttack = 0;
                            } else {
                                if (distance.x < prefDist && distance.y < prefDist) {
                                    aEnemy.position = moveBack(aEnemy.position, aEnemy.target.position, aEnemy.tilemap.getRandomAdjacentArray(aEnemy.position));
                                } else if (distance.x >= prefDist && distance.y >= prefDist) {
                                    aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                                }
                                moveOrAttack = 1;
                                attackCooldown = 1;
                            }
                            attackCooldown--;
                        } else {
                            aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                        }
                    } else {
                        aEnemy.position = moveToward(aEnemy.position, aEnemy.target.position);
                    }
                }
            }

            break;
    }
}

function moveBack(a, b, array) {
    var adj;

    if (a.x < b.x && a.y < b.y) { adj = array.filter(tile => tile.x < a.x && tile.y < a.y) }
    else if (a.x == b.x && a.y < b.y) { adj = array.filter(tile => tile.x == a.x && tile.y < a.y) }
    else if (a.x > b.x && a.y < b.y) { adj = array.filter(tile => tile.x > a.x && tile.y < a.y) }
    else if (a.x < b.x && a.y == b.y) { adj = array.filter(tile => tile.x < a.x && tile.y == a.y) }
    else if (a.x > b.x && a.y == b.y) { adj = array.filter(tile => tile.x > a.x && tile.y == a.y) }
    else if (a.x < b.x && a.y > b.y) { adj = array.filter(tile => tile.x < a.x && tile.y > a.y) }
    else if (a.x == b.x && a.y > b.y) { adj = array.filter(tile => tile.x == a.x && tile.y > a.y) }
    else if (a.x > b.x && a.y > b.y) { adj = array.filter(tile => tile.x > a.x && tile.y > a.y) }
    else return { x: a.x, y: a.y };

    if (adj.length == 0) return { x: a.x, y: a.y };
    else {
        var newPos = adj[RNG.rollRandom(0, adj.length - 1)];
        return { x: newPos.x, y: newPos.y };
    }
}

function moveToward(a, b) {
    var path = pathfinder.findPath(a, b);
    if (path.length > 1) return { x: path[1].x, y: path[1].y };
    else return a;
}
