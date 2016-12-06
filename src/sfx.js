"use strict;"

module.exports = exports = SFX;

var background = new Audio();
var healthPickup = new Audio();
var attackPowerup = new Audio();
var damageBonusPowerup = new Audio();
var defensePowerup = new Audio();
var click = new Audio();

function SFX() {
    background.src = encodeURI('sounds/tempBGMusic.wav');
    background.volume = 0.3;
    background.addEventListener('ended', function() {
        var backgroundMusicOnLoop = new Audio('sounds/tempBGMusicLoop.wav');
        backgroundMusicOnLoop.volume = 0.3;
        backgroundMusicOnLoop.loop = true;
        backgroundMusicOnLoop.play();
    }, false);
    background.play();

    healthPickup.src = encodeURI('sounds/Powerup3.wav');
    healthPickup.volume = 0.1;

    attackPowerup.src = encodeURI('sounds/Powerup4.wav');
    attackPowerup.volume = 0.1;

    damageBonusPowerup.src = encodeURI('sounds/Powerup1.wav');
    damageBonusPowerup.volume = 0.1;

    defensePowerup.src = encodeURI('sounds/Powerup2.wav');
    defensePowerup.volume = 0.4;

    click.src = encodeURI("sounds/click.wav");
    click.volume = 0.4;
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

