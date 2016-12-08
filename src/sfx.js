"use strict;"

module.exports = exports = SFX;

var background = new Audio();
var healthPickup = new Audio();
var attackPowerup = new Audio();
var damageBonusPowerup = new Audio();
var defensePowerup = new Audio();
var click = new Audio();
var backgroundMusicOnLoop = new Audio('sounds/tempBGMusicLoop.wav');
var volume = 0.3;

function SFX() {
    background.src = encodeURI('sounds/tempBGMusic.wav');
    background.addEventListener('ended', function() {
        backgroundMusicOnLoop = new Audio('sounds/tempBGMusicLoop.wav');
        backgroundMusicOnLoop.volume = volume;
        backgroundMusicOnLoop.loop = true;
        backgroundMusicOnLoop.play();
    }, false);
    background.play();

    healthPickup.src = encodeURI('sounds/Powerup3.wav');
    attackPowerup.src = encodeURI('sounds/Powerup4.wav');
    damageBonusPowerup.src = encodeURI('sounds/Powerup1.wav');
    defensePowerup.src = encodeURI('sounds/Powerup2.wav');
    click.src = encodeURI("sounds/click.wav");

    this.setVolume(["volume", "3"]);
    window.terminal.addCommand("volume", "Set the volume", this.setVolume.bind(this));
}

SFX.prototype.play = function(aSound) {
    switch (aSound) {
        case "healthPickup":
            healthPickup.play();
            break;

        case "attackPickup":
            attackPowerup.play();
            break;

        case "damagePickup":
            damageBonusPowerup.play();
            break;

        case "defensePickup":
            defensePowerup.play();
            break;

        case "click":
            click.play();
            break;
    }
}

SFX.prototype.setVolume = function(args){
    if(args.length <= 1){
        window.terminal.log("Please provide volume level (0-3)", "red");
        return;
    }

    switch(args[1]){
        case "0":
            volume = 0;
            break;
        case "1":
            volume = 0.1;
            break;
        case "2":
            volume = 0.2;
            break;
        case "3":
            volume = 0.3;
            break;
        default:
            window.terminal.log(args[1] + " is not a valid volume. Please enter between 0-3.", "red");
            return;
    }

    background.volume = volume;
    click.volume = volume;
    backgroundMusicOnLoop.volume = volume;

    var v = volume / 3;

    healthPickup.volume = v;
    attackPowerup.volume = v;
    defensePowerup.volume = v;
}

