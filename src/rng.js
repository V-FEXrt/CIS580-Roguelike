"use strict";

module.exports = exports = {
    rollRandom: rollRandom,
    rollMultiple: rollMultiple,
    rollWeighted: rollWeighted,
    oneIn: oneIn
}

/**
 * @function rollRandom
 * Generates a random number using given bounds.
 * @param {Integer} aMinimum - inclusive lower bound
 * @param {Integer} aMaximum - inclusive upper bound
 */
function rollRandom(aMinimum, aMaximum) {
    return Math.floor(Math.random() * (aMaximum + 1 - aMinimum) + aMinimum);
}

/**
 * @function rollMultiple
 * Generates a sum of random numbers using gives bounds.
 * @param {Integer} aMinimum - inclusive lower bound
 * @param {Integer} aMaximum - inclusive upper bound
 * @param {Integer} aNumber - number of times to generate a random number
 */
function rollMultiple(aMinimum, aMaximum, aNumber) {
    var total = 0;
    for (var i = 0; i < aNumber; i++) {
        total += rollRandom(aMinimum, aMaximum);
    }
    return total;
}

/**
 * @function rollWeighted
 * Generates a weighted random number corresponding to the index of the weight given.
 * Accepts any number of arguments greater than 0.
 * Example: rollWeighted(10,50,20) might return 1 which corresponds to the weight of 50.
 * Note: weights are not necessarily percentages; they can add up to any amount.
 */
function rollWeighted() {
    var argLength = arguments.length;
    if (argLength < 1) throw new Error("At least one argument required.");
    var weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
    }
    var roll = rollRandom(0, weightSum);
    weightSum = 0;
    for (var i = 0; i < argLength; i++) {
        weightSum += arguments[i];
        if (!arguments[i]) continue;
        if (roll <= weightSum) return i;
    }
}

/**
 * @function oneIn
 * Returns true with a 1 in X chance.
 * @param {Integer} x - Chance to generate.
 */
function oneIn(x) {
    return rollWeighted(100 - (100 / x), 100 / x);
}

