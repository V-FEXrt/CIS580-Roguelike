"use strict";

/**
 * @module exports the Car class
 */
module.exports = exports = EntityManager;

/**
 * @constructor car
 * Creates a new EntityManager object
 */
function EntityManager() {
    this.entities = [];
}

EntityManager.prototype.addEntity = function(entity) {
  checkType(entity);
  this.entities.push(entity);
}

EntityManager.prototype.destroyEntity = function(entity){
  var idx = this.entities.indexOf(entity);
  this.entities.splice(idx, 1);
}

EntityManager.prototype.reset = function() {
  this.entities = [];
}

EntityManager.prototype.update = function(elapsedTime) {
  var toBeDestroyed = [];
  var self = this;
  this.entities.forEach(function(entity){
    if(entity.retain()){
      entity.update(elapsedTime);
    }
    else{
      toBeDestroyed.push(entity);
    }
  });

  toBeDestroyed.forEach(function(entity){
    self.destroyEntity(entity);
  });

  this.entities.sort(function(a,b){return a.position.x - b.position.x});

  // The active list will hold all balls
  // we are currently considering for collisions
  var active = [];

  // The potentially colliding list will hold
  // all pairs of balls that overlap in the x-axis,
  // and therefore potentially collide
  var potentiallyColliding = [];

  // For each ball in the axis list, we consider it
  // in order
  this.entities.forEach(function(entity, aindex){
    // remove balls from the active list that are
    // too far away from our current ball to collide
    // The Array.prototype.filter() method will return
    // an array containing only elements for which the
    // provided function's return value was true -
    // in this case, all balls that are closer than 30
    // units to our current ball on the x-axis
    active = active.filter(function(oentity){
      var e1r = entity.size.width / 2;
      var e2r = oentity.size.width / 2;
      return ((entity.position.x * 96) + e1r) - ((oentity.position.x * 96) + e2r)  < e1r + e2r;
    });
    // Since only balls within colliding distance of
    // our current ball are left in the active list,
    // we pair them with the current ball and add
    // them to the potentiallyColliding array.
    active.forEach(function(oentity, bindex){
      potentiallyColliding.push({a: oentity, b: entity});
    });
    // Finally, we add our current ball to the active
    // array to consider it in the next pass down the
    // axisList
    active.push(entity);
  });

  // At this point we have a potentaillyColliding array
  // containing all pairs overlapping in the x-axis.  Now
  // we want to check for REAL collisions between these pairs.
  // We'll store those in our collisions array.
  var collisions = [];
  potentiallyColliding.forEach(function(pair){
    if(collision(pair.a, pair.b)) {
      // Color the collision pair for visual debugging
      pair.a.color = 'red';
      pair.b.color = 'red';
      // Push the colliding pair into our collisions array
      collisions.push(pair);
    }
  });

  collisions.forEach(function(pair){
	pair.a.resolveCollision = true;
    pair.a.collided(pair.b);
    pair.b.collided(pair.a);
  })
}

EntityManager.prototype.render = function(elapsedTime, ctx) {
  var player;
  this.entities.forEach(function(entity){
    if(entity.type == "Player"){
        player = entity;
        return; // because this is a function return is the same as continue
    }
    entity.render(elapsedTime, ctx);
  });

  // render player last so that it is rendered on top of items
  if(typeof player != "undefined") player.render(elapsedTime, ctx);
}

EntityManager.prototype.processTurn = function(input) {
  this.entities.forEach(function(entity){
    entity.processTurn(input);
  });
}

function checkType(entity){
  if(typeof entity == 'undefined') failType();
  if(typeof entity.position == 'undefined') failType();
  if(typeof entity.position.x == 'undefined') failType();
  if(typeof entity.position.y == 'undefined') failType();
  if(typeof entity.size == 'undefined') failType();
  if(typeof entity.size.width == 'undefined') failType();
  if(typeof entity.size.height == 'undefined') failType();
  if(typeof entity.collided == 'undefined') failType();
  if(typeof entity.processTurn == 'undefined') failType();
  if(typeof entity.retain == 'undefined') failType();
  if(typeof entity.update == 'undefined') failType();
  if(typeof entity.render == 'undefined') failType();
  if(typeof entity.type == 'undefined') failType();
  if(typeof entity.resolveCollision == 'undefined') failType();
}

function failType(){
  throw new Error("Object doesn't match type defination for 'Entity'");
  /*
  // Things that must be implemented for the entity manager

  // Properties used for collision
  entity.size.width
  entity.size.height
  entity.position.x
  entity.position.y

  // Informs entity that it collided with the other entity
  entity.collided(withEntity) // returns nothing

  // Handle turn based updates. i.e. moving or attacking
  entity.processTurn(input) // returns nothing

  // Tells entity manager if this entity should be destroyed.
  entity.retain() // return true to to stay in game, return false to be removed from the game

  // Name of the class as a string. Pascal case
  // entity.type = "Type"
  */
}

function collision(entity1, entity2){
  return !(
    ((entity1.position.y * 96) + (entity1.size.height - 1) < (entity2.position.y * 96)) ||
    ((entity1.position.y  * 96) > (entity2.position.y * 96) + (entity2.size.height - 1)) ||
    ((entity1.position.x  * 96) > (entity2.position.x * 96) + entity2.size.width) ||
    ((entity1.position.x  * 96) + entity1.size.width < (entity2.position.x * 96)))

}
