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
    window.terminal.addCommand("weapon", "Get your current weapon stats", this.weaponCommand.bind(this));
    window.terminal.addCommand("armor", "Get your current armor atats", this.armorCommand.bind(this));
}

/**
 * @function processes a new weapon item
 *
 */
Inventory.prototype.addWeapon = function (weapon) {
    checkWeapon(weapon);
    weapon.shouldRetain = false;
    if (checkInvalidWeapon(window.player.class, weapon.attackType)) return;

    window.terminal.log("Picked up a " + weapon.toString(), window.colors.pickup);
    var weaponToDrop = this.inventory[0];
    this.inventory[0] = weapon;
    window.player.combat.weapon = weapon;
    weaponToDrop.position = { x: window.player.position.x, y: window.player.position.y };
    weaponToDrop.shouldRetain = true;
    window.entityManager.addEntity(weaponToDrop);
}

/**
 * @function processes a new armor item
 *
 */
Inventory.prototype.addArmor = function (armor) {
    checkArmor(armor);
    armor.shouldRetain = false;
    if (checkInvalidArmor(window.player.class, armor.name)) return;

    window.terminal.log("Picked up " + armor.toString(), window.colors.pickup);
    var armorToDrop = this.inventory[1];
    this.inventory[1] = armor;
    window.player.combat.armor = armor;
    armorToDrop.position = { x: window.player.position.x, y: window.player.position.y };
    armorToDrop.shouldRetain = true;
    window.entityManager.addEntity(armorToDrop);
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

Inventory.prototype.weaponCommand = function () {
    window.terminal.log(this.inventory[0].toString(), window.colors.cmdResponse);
}

Inventory.prototype.armorCommand = function () {
    window.terminal.log(this.inventory[1].toString(), window.colors.cmdResponse);
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
    if (typeof item.name == 'undefined') failArmor();
    if (typeof item.level == 'undefined') failArmor();
    if (typeof item.shouldRetain == 'undefined') failArmor();
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

function checkInvalidWeapon(aClass, aWeaponType) { // class just for cleanliness
    var lResult = false;
    switch (aClass) {
        case "Knight":
            if (aWeaponType == "Ranged") {
                lResult = true;
                window.terminal.log("These sharp feathery sticks will make nice kindling for my feast tonight.");
            } else if (aWeaponType == "Magic") {
                lResult = true;
                window.terminal.log("Oh look, a stick with a shiny rock attached. So mystical, much power.");
            }
            break;

        case "Archer":
            if (aWeaponType == "Melee") {
                lResult = true;
                window.terminal.log("This won't fit in my bow; perhaps if I can find a crossbow though?");
            } else if (aWeaponType == "Magic") {
                lResult = true;
                window.terminal.log("I am not in need of a walking stick.");
            }
            break;

        case "Mage":
            if (aWeaponType == "Ranged") {
                lResult = true;
                window.terminal.log("Me, use a bow? How plebian.");
            } else if (aWeaponType == "Melee") {
                lResult = true;
                window.terminal.log("That is far too heavy for me to concern myself with.");
            }
            break;
    }
    return lResult;
}

function checkInvalidArmor(aClass, aArmorName) { // class just for cleanliness
    var lResult = false;
    switch (aClass) {
        case "Knight":
            if (aArmorName == "Robes") {
                lResult = true;
                window.terminal.log("When was the last time you saw a Knight wearing silly frilly robes?");
            }
            break;

        case "Archer":
            if (aArmorName == "Robes") {
                window.terminal.log("While you are sure these wizard-pajamas are comfortable, it isn't bedtime.");
                lResult = true;
            } else if (aArmorName == "Chainmail" || aArmorName == "Plate Armor") {
                lResult = true;
                window.terminal.log("Oh! Big, heavy armor! That is just what I need for the dance off! Said no archer ever.");
            }
            break;

        case "Mage":
            if (aArmorName != "Robes") {
                lResult = true;
                window.terminal.log("Real Mages don't need to compensate for something with big shiny armor.");
            }
            break;
    }
    return lResult;
}

