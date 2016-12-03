"use strict";

module.exports = exports = {
    rollRandom: rollRandom,
    rollMultiple: rollMultiple,
    rollWeighted: rollWeighted
}

function rollRandom(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}

function rollMultiple(aMinimum, aMaximum, aNumber) {
    var total = 0;
    for (var i = 0; i < aNumber; i++) {
        total += this.rollRandom(aMinimum, aMaximum);
    }
    return total;
}

function rollWeighted() {
    var argLength = arguments.length;
    if (argLength < 1) throw new Error("At least one argument required.");
    var weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
    }
    var roll = this.rollRandom(0, weightSum + 1);
    weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
        if (roll <= weightSum) return i;
    }
}

