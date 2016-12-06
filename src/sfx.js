"use strict;"

module.exports = exports = SFX;

var background = new Audio();
var healthPickupSound = new Audio();
var attackPowerupSound = new Audio();
var damageBonusPowerupSound = new Audio();
var defensePowerupSound = new Audio();

function SFX() {
    background.src = encodeURI('sounds/tempBGMusic.wav');
    background.volume = 0.3;
    background.addEventListener('ended', function () {
        var backgroundMusicOnLoop = new Audio('sounds/tempBGMusicLoop.wav');
        backgroundMusicOnLoop.volume = 0.3;
        backgroundMusicOnLoop.loop = true;
        backgroundMusicOnLoop.play();
    }, false);
    background.play();

    healthPickupSound.src = encodeURI('sounds/Powerup3.wav');
    healthPickupSound.volume = 0.1;

    attackPowerupSound.src = encodeURI('sounds/Powerup4.wav');
    attackPowerupSound.volume = 0.1;

    damageBonusPowerupSound.src = encodeURI('sounds/Powerup1.wav');
    damageBonusPowerupSound.volume = 0.1;

    defensePowerupSound.src = encodeURI('sounds/Powerup2.wav');
    defensePowerupSound.volume = 0.4;
}

SFX.prototype.play = function (aSound) {
    switch (aSound) {
        case "healthPickup":
            healthPickupSound.play();
            break;

        case "attackPickup":
            attackPowerupSound.play();
            break;

        case "damagePickup":
            damageBonusPowerupSound.play();
            break;

        case "defensePickup":
            defensePowerupSound.play();
            break;
    }
}

