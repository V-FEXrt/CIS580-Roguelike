"use strict";

const MAX_MSG_COUNT = 50;
const MAX_MSG_LENGTH = 29;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = {x: 1063, y: 667};
}

Terminal.prototype.log = function(message) {
    splitMessage(message, this.messages);
    if(this.messages.length > MAX_MSG_COUNT) {
        this.messages.pop();
    }
    if(window.debug) console.log(message);
}

Terminal.prototype.update = function(time) {

}

Terminal.prototype.render = function(elapsedTime, ctx) {
    ctx.fillStyle = 'white';
    ctx.font = "15px Courier New";
    var self = this;
    this.messages.forEach(function(message, i) {
        ctx.fillText(message, self.startPos.x, self.startPos.y - 18*i);
    });
}

function splitMessage(message, messages) {
    if(message.length < 29) {
        messages.unshift(message);
    }
    else {
        messages.unshift(message.slice(0,MAX_MSG_LENGTH));
        splitMessage(message.slice(MAX_MSG_LENGTH,message.length), messages);
    }

}