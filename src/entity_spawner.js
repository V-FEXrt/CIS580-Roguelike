"use strict";

const Enemy = require('./enemy');
const Powerup = require('./powerup');
const RNG = require('./rng');
const Weapon = require('./weapon');
const Armor = require('./armor');

/**
 * @module EntitySpawner
 * A class representing a EntitySpawner
 */
module.exports = exports = {
  spawn: spawn,
  drop: spawnDrop,
  spawnCommand: spawnCommand
}

var pu = 0;
var en = 0;
/**
 * @constructor EntitySpawner
 * Creates a EntitySpawner
 */
var spawnArray = [
  function () { spawnPowerup(1); },
  function () { spawnPowerup(2); },
  function () { spawnPowerup(3); },
  function () { spawnPowerup(4); },
  function () { spawnEnemy("Zombie"); },
  function () { spawnEnemy("Skeleton"); },
  function () { spawnEnemy("Minotaur"); },
  function () { spawnEnemy("Shaman"); },
  function () { }
]


var player;
// percents should be an array of the percent everything should be spawned. in this format
// [ crystal, red potion, blue potion, green potion, Zombie, Skeleton, Minotaur, Shaman, Empty ]
function spawn(aPlayer, count, percents) {
  player = aPlayer;
  for (var i = 0; i < count; i++) {
    var idx = RNG.rollWeighted(
      percents[0],
      percents[1],
      percents[2],
      percents[3],
      percents[4],
      percents[5],
      percents[6],
      percents[7],
      percents[8]
    );
    spawnArray[idx]()
  }
  if (window.debug) {
    console.log(pu + " powerups spawned");
    console.log(en + " enemies spawned");
  }
}

function spawnPowerup(pType) {
  pu++;
  window.entityManager.addEntity(new Powerup(window.tilemap.findOpenSpace(), pType));
}

function spawnEnemy(eType) {
  en++;
  window.entityManager.addEntity(new Enemy(window.tilemap.findOpenSpace(), eType, player, spawnDrop))
}

function spawnDrop(position) {
  pu++;
  var drop = window.combatController.randomDrop(position);
  if (drop.type != "None") window.entityManager.addEntity(drop);
}

function spawnCommand(args) {
  if (args.length == 1) window.terminal.log("Requires parameters", window.colors.invalid);
  else {
    switch (args[1]) {
      case "weapon":
        if (args.length != 6) {
          window.terminal.log("Syntax: spawn weapon <weaponName(no spaces)> <weaponLevel(preferably less than 100)> <x> <y>", window.colors.invalid);
          break;
        }
        if (args[2] == "MorningStar") args[2] = "Morning Star";
        if (args[2] == "HeavyBolts") args[2] = "Heavy Bolts";
        if (args[2] == "MagicMissile") args[2] = "Magic Missile";
        if (args[2] == "EldritchBlast") args[2] = "Eldritch Blast";
        var weapon = new Weapon(args[2], args[3]);
        if (weapon.damageMin == "undefined" || parseInt(weapon.level) != weapon.level) {
          window.terminal.log("Invalid weapon", window.colors.invalid);
          break;
        }
        if(args[4] != parseInt(args[4]) || args[5] != parseInt(args[5])) {
          window.terminal.log("Invalid spawn location", window.colors.invalid);
          break;
        }
        weapon.position.x = args[4];
        weapon.position.y = args[5];
        window.terminal.log(`Spawned ${args[2]}`, window.colors.cmdResponse);
        window.entityManager.addEntity(weapon);
        break;
      case "armor":
        if (args.length != 6) {
          window.terminal.log("Syntax: spawn armor <armorName(no spaces)> <armorLevel(preferably less than 100)> <x> <y>", window.colors.invalid);
          break;
        }
        if (args[2] == "HideArmor") args[2] = "Hide Armor";
        if (args[2] == "LeatherArmor") args[2] = "Leather Armor";
        if (args[2] == "PlateArmor") args[2] = "Plate Armor";
        var armor = new Armor(args[2], args[3]);
        if (armor.defense == "undefined" || armor.level != parseInt(armor.level)) {
          window.terminal.log("Invalid armor", window.colors.invalid);
          break;
        }
        if(args[4] != parseInt(args[4]) || args[5] != parseInt(args[5])) {
          window.terminal.log("Invalid spawn location", window.colors.invalid);
          break;
        }
        armor.position.x = args[4];
        armor.position.y = args[5];
        window.terminal.log(`Spawned ${args[2]}`, window.colors.cmdResponse);
        window.entityManager.addEntity(armor);
        break;
      case "potion":
        if (args.length != 5) {
          window.terminal.log("Syntax: spawn potion <potionNum> <x> <y>", window.colors.invalid);
          break;
        }
        if(args[3] != parseInt(args[3]) || args[4] != parseInt(args[4])) {
          window.terminal.log("Invalid spawn location", window.colors.invalid);
          break;
        }
        window.entityManager.addEntity(new Powerup({ x: args[3], y: args[4] }, parseInt(args[2])));
        var potions = ["crystal", "health", "defense", "agility"];
        window.terminal.log(`Spawned ${potions[parseInt(args[2]) - 1]} potion`, window.colors.cmdResponse);
        break;
      case "enemy":
        if (args.length != 5) {
          window.terminal.log("Syntax: spawn enemy <enemyName> <x> <y>", window.colors.invalid);
          break;
        }
        if (args[2] != "Zombie" && args[2] != "Skeleton" && args[2] != "Minotaur" && args[2] != "Shaman") {
          window.terminal.log("Invalid enemy type. Please choose from Zombie, Skeleton, Minotaur, or Shaman", window.colors.invalid);
          break;
        }

        if(args[3] != parseInt(args[3]) || args[4] != parseInt(args[4])) {
          window.terminal.log("Invalid spawn location", window.colors.invalid);
          break;
        }
        window.entityManager.addEntity(new Enemy({ x: args[3], y: args[4] }, args[2], window.player, spawnDrop));
        window.terminal.log(`Spawned ${args[2]}`, window.colors.cmdResponse);
        break;
      default:
        window.terminal.log("Invalid entity name", window.colors.invalid);
        break;
    }
  }
}
