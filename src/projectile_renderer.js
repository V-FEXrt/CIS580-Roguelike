"use strict";

const Vector = require('./vector.js');
const Tilemap = require('./tilemap.js');
const PROJECTILE_SPEED = 1/5;
module.exports = exports = Projectile;

/**
 * @constructor Projectile
 * Creates a new projectile object
 * @param {start} desired sprites start Y index on the spritesheet
 * @param {state} the state of the entity to animate
 * @param {entityClass} the kind of entity being animated
 */
function Projectile() {
  this.projectiles = [];
  this.spritesheet = new Image();
  this.spritesheet.src = './spritesheets/projectile_sprites.png';
}

Projectile.prototype.createProjectile = function(start, target, type)
{

  var direction = Vector.subtract(
    target,
    start
   );
  var velocity = Vector.scale(Vector.normalize(direction), PROJECTILE_SPEED);

  if(type == "Archer" || type == "Skeleton")
  {
    var spriteLoc = {x: 0, y: 0};
  }
  else if(type == "Mage" || type == "Shaman")
  {
    var spriteLoc = {x: 1, y: 0};
  }
  var angle =
  this.projectiles.push({position: start, target: target, velocity: velocity, spriteLoc: spriteLoc, angle: angle });
}

Projectile.prototype.update = function(time){
  this.projectiles.forEach(function(projectile, i){
    projectile.position = Vector.add(projectile.position, projectile.velocity);
  });

}

Projectile.prototype.render = function (elapsedTime, ctx) {
  var self = this;
  this.projectiles.forEach(function(projectile, i){

  ctx.drawImage(
      self.spritesheet,
      96 * projectile.spriteLoc.x, 96 * projectile.spriteLoc.y,
      96, 96,
      projectile.position.x * 96, projectile.position.y * 96,
      96, 96
    );
  });
}
