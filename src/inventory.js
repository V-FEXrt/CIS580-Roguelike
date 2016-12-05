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
Inventory.prototype.addWeapon = function (weapon) {
    checkWeapon(weapon);
    // check for invalids

    window.terminal.log(`Picked up a level ${weapon.level} ${weapon.name} with damage range ${weapon.damageMin}-${weapon.damageMax}, with ${weapon.properties}.`);
    var weaponToDrop = this.inventory[0];
    this.inventory[0] = weapon;
    window.player.combat.weapon = weapon;
    weaponToDrop.position = window.player.tilemap.getRandomAdjacent(weapon.position);
    weaponToDrop.shouldRetain = true;
    window.entityManager.addEntity(weaponToDrop);


    // Commented out until we figure out what to do...
    // if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    // if(weapon.type.damageMax > this.inventory[0].type.damageMax) { // This needs to be changed to prompting the user, I'll wait until there's a working GUI class to do that
    //     this.inventory.push(this.inventory[0]);
    //     this.inventory[0] = weapon;
    // }
    // else {
    //     this.inventory.push(weapon);
    // }
}

/**
 * @function processes a new armor item
 *
 */
Inventory.prototype.addArmor = function (armor) {
    checkArmor(armor);
    // check for invalids
    if (player.class == "Mage" && armor.name != "Robes") {
        window.terminal.log("Mages don't wear armor...");
        return;
    }

    window.terminal.log(`Picked up level ${armor.level} ${armor.name}.`);
    var armorToDrop = this.inventory[1];
    this.inventory[1] = armor;
    window.player.combat.armor = armor;
    armorToDrop.position = window.player.tilemap.getRandomAdjacent(armor.position);
    armorToDrop.shouldRetain = true;
    window.entityManager.addEntity(armorToDrop);


    // Commented out until we figure out what to do...
    // if(this.inventory.length >= 17) { /* Tell GUI that inventory is full */ }
    // if(armor.type.defense > this.inventory[1].type.defense) { // See line 25
    //     this.inventory.push(this.inventory[1]);
    //     this.inventory[1] = armor;
    // }
    // else {
    //     this.inventory.push(armor);
    // }
}

/**
 * @function power up the equipped weapon
 *
 */
Inventory.prototype.powerupWeapon = function (damage) {
    this.inventory[0].type.damageMax += damage;
}

/**
 * @function power up the equipped armor
 *
 */
Inventory.prototype.powerupArmor = function (defense) {
    this.inventory[1].type.defense += defense;
}

/**
 * @function add item to inventory
 *
 */
Inventory.prototype.addItem = function (item) {
    if (this.inventory.length >= 17) { /* Tell GUI inventory is full */ }
    this.inventory.push(item);
}

/**
 * @function remove item from inventory
 *
 */
Inventory.prototype.removeItem = function (item) {
    this.inventory.remove(this.inventory.indexOf(item));
}

/**
 * @function makes sure item is a weapon
 *
 */
function checkWeapon(item) {
    if (typeof item == 'undefined') failWeapon();
    if (typeof item.type == 'undefined') failWeapon();
    if (typeof item.name == 'undefined') failWeapon();
    if (typeof item.level == "undefined") failWeapon();
    if (typeof item.shouldRetain == 'undefined') failWeapon();
    if (typeof item.damageMax == "undefined") failWeapon();
    if (typeof item.damageMin == "undefined") failWeapon();
    if (typeof item.damageType == "undefined") failWeapon();
    if (typeof item.range == "undefined") failWeapon();
    if (typeof item.hitBonus == "undefined") failWeapon();
    if (typeof item.attackEffect == 'undefined') failWeapon();
    if (typeof item.properties == "undefined") failWeapon();
}

/**
 * @function makes sure item is armor
 *
 */
function checkArmor(item) {
    if (typeof item == 'undefined') failArmor();
    if (typeof item.type == 'undefined') failArmor();
    if (typeof item.name == 'undefined') failWeapon();
    if (typeof item.level == 'undefined') failWeapon();
    if (typeof item.shouldRetain == 'undefined') failWeapon();
    if (typeof item.defense == "undefined") failArmor();
    if (typeof item.strongType == "undefined") failArmor();
    if (typeof item.weakType == "undefined") failArmor();
}

function failWeapon() {
    throw new Error("Item doesn't match type definition for 'Weapon'");
}

function failArmor() {
    throw new Error("Item doesn't match type definition for 'Armor'");
}
