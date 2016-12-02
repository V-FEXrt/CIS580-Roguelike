"use strict";

const MAX_MSG_COUNT = 50;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = {x: 1063, y: 667};
}

Terminal.prototype.log = function(message) {
    this.messages.unshift(message);
    if(this.messages.length > MAX_MSG_COUNT) {
        this.messages.pop();
    }
    if(window.debug) console.log(message);
}

Terminal.prototype.update = function(time) {

}

Terminal.prototype.render = function(elapsedTime, ctx) {
    ctx.fillStyle = 'white';
    ctx.font = "15px Arial";
    var self = this;
    this.messages.forEach(function(message, i) {
        ctx.fillText(message, self.startPos.x, self.startPos.y - 18*i);
    });
}