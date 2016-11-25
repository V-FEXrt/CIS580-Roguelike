"use strict";

const Enemy = require('./enemy');
const Powerup = require('./powerup');

/**
 * @module EntitySpawner
 * A class representing a EntitySpawner
 */
 module.exports = exports = {
   spawn: spawn
 }

 var pu = 0;
 var en = 0;
/**
 * @constructor EntitySpawner
 * Creates a EntitySpawner
 */
function spawn(em, player, tilemap, count, percentEnemy) {
  for(var i = 0; i < count; i++){
    (Math.random() < (percentEnemy/100)) ? spawnEnemy(em, tilemap, player) : spawnPowerup(em, tilemap);
  }
  if(window.debug){
    console.log(pu + " powerups spawned");
    console.log(en + " enemies spawned");
  }
}

function spawnPowerup(em, tilemap){
  pu++;
  em.addEntity(new Powerup(tilemap.findOpenSpace(), tilemap));
}

function spawnEnemy(em, tilemap, player){
  en++;
  em.addEntity(new Enemy(tilemap.findOpenSpace(), tilemap, "Zombie", player))
}
