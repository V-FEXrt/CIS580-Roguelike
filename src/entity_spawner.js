"use strict";

const Enemy = require('./enemy');
const Powerup = require('./powerup');

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
function spawn(player, tilemap, count, percentEnemy) {
  for(var i = 0; i < count; i++){
    (Math.random() < (percentEnemy/100)) ? spawnEnemy(tilemap, player) : spawnPowerup(tilemap);
  }
  if(window.debug){
    console.log(pu + " powerups spawned");
    console.log(en + " enemies spawned");
  }
}

function spawnPowerup(tilemap){
  pu++;
  window.entityManager.addEntity(new Powerup(tilemap.findOpenSpace(), tilemap));
}

function spawnEnemy(tilemap, player){
  en++;
  window.entityManager.addEntity(new Enemy(tilemap.findOpenSpace(), tilemap, "Zombie", player, spawnDrop))
}

function spawnDrop(position){
  pu++;
  var drop = window.combatController.randomDrop(position);
  if(drop.type != "None") window.entityManager.addEntity(drop);
}

