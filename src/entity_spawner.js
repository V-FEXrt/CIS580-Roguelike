"use strict";

const Enemy = require('./enemy');
const Powerup = require('./powerup');
const RNG = require('./rng');

/**
 * @module EntitySpawner
 * A class representing a EntitySpawner
 */
 module.exports = exports = {
   spawn: spawn,
   drop: spawnDrop
 }

 var pu = 0;
 var en = 0;
/**
 * @constructor EntitySpawner
 * Creates a EntitySpawner
 */
var spawnArray = [
  function(){ spawnPowerup(1); },
  function(){ spawnPowerup(2); },
  function(){ spawnPowerup(3); },
  function(){ spawnPowerup(4); },
  function(){ spawnEnemy("Zombie"); },
  function(){ spawnEnemy("EnemyRanged"); },
  function(){ spawnEnemy("Captain"); },
  function(){ spawnEnemy("Shaman"); },
]

var tilemap;
var player;
 // percents should be an array of the percent everything should be spawned. in this format
 // [ crystal, red potion, blue potion, green potion, Zombie, EnemyRanged, Captain, Shaman ]
function spawn(aPlayer, tmap, count, percents) {
  tilemap = tmap;
  player = aPlayer;
  for(var i = 0; i < count; i++){
    var idx = RNG.rollWeighted(
      percents[0],
      percents[1],
      percents[2],
      percents[3],
      percents[4],
      percents[5],
      percents[6],
      percents[7]
    );
    window.terminal.log(""+idx, 'lime');
    spawnArray[idx]()
  }
  if(window.debug){
    console.log(pu + " powerups spawned");
    console.log(en + " enemies spawned");
  }
}

function spawnPowerup(pType){
  pu++;
  window.entityManager.addEntity(new Powerup(tilemap.findOpenSpace(), tilemap, pType));
}

function spawnEnemy(eType){
  en++;
  window.entityManager.addEntity(new Enemy(tilemap.findOpenSpace(), tilemap, eType, player, spawnDrop))
}

function spawnDrop(position){
  pu++;
  var drop = window.combatController.randomDrop(position);
  if(drop.type != "None") window.entityManager.addEntity(drop);
}
