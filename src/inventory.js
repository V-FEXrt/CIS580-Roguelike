"use strict";

/**
 * @module exports the Inventory class
 */
module.exports = exports = Inventory;

/**
 * @constructor Inventory
 * Creates a new inventory
 */
function Inventory(weapon, armor) {
	this.inventory = [];
    this.inventory.push(weapon);
    this.inventory.push(armor);
}

/**
 * @function processes a new weapon item
 * 
 */
Inventory.prototype.addWeapon = function(weapon) {
    checkWeapon(weapon);
    if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    if(weapon.damage > this.inventory[0].damage) {
        this.push(this.inventory[0]);
        this.inventory[0] = weapon;
    }
    else {
        this.push(weapon);
    }
}

/**
 * @function processes a new armor item
 * 
 */
Inventory.prototype.addArmor = function(armor) {
    checkArmor(armor);
    if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    if(armor.strength > this.inventory[1].strength) {
        this.push(this.inventory[0]);
        this.inventory[0] = armor;
    }
    else {
        this.push(armor);
    }
}

/**
 * @function power up the equipped weapon
 * 
 */
Inventory.prototype.powerupWeapon = function(damage) {
    this.inventory[0].damage += damage;
}

/**
 * @function power up the equipped armor
 * 
 */
Inventory.prototype.powerupArmor = function(strength) {
    this.inventory[1].strength += strength;
}

/**
 * @function add item to inventory
 * 
 */
Inventory.prototype.addItem = function(item) {
    if(this.inventory.length >= 17) { /* Tell GUI inventory is full */ }
    this.inventory.push(item);
}

/**
 * @function remove item from inventory
 * 
 */
Inventory.prototype.removeItem = function(item) {
    this.inventory.remove(this.inventory.indexOf(item));
}

/**
 * @function makes sure item is a weapon
 * 
 */
function checkWeapon(item) {
    if(typeof item == 'undefined') failWeapon();
    if(typeof item.damage == 'undefined') failWeapon();
}

/**
 * @function makes sure item is armor
 * 
 */
function checkArmor(item) {
    if(typeof item == 'undefined') failArmor();
    if(typeof item.strength == 'undefined') failArmor();
}

function failWeapon() {
    throw new Error("Item doesn't match type definition for 'Weapon'");
}

function failArmor() {
    throw new Error("Item doesn't match type definition for 'Armor'");
}