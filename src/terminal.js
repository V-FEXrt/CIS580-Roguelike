"use strict";

const MAX_MSG_COUNT = 50;
const MAX_MSG_LENGTH = 29;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = {x: 1063, y: 667};
}

Terminal.prototype.log = function(message, color) {
    if(typeof color == 'undefined') color = 'white';
    splitMessage(message, this.messages, color);
    if(this.messages.length > MAX_MSG_COUNT) {
        this.messages.pop();
    }
    if(window.debug) console.log(message);
}

Terminal.prototype.clear = function() {
    this.messages = [];
}

Terminal.prototype.update = function(time) {

}

Terminal.prototype.render = function(elapsedTime, ctx) {
    ctx.font = "15px Courier New";
    var self = this;
    this.messages.forEach(function(message, i) {
        ctx.fillStyle = message.color;
        ctx.fillText(message.text, self.startPos.x, self.startPos.y - 18*i);
    });
}

function splitMessage(message, messages, color) {
    if(message.length < 29) {
        messages.unshift({text: message, color: color});
    }
    else {
        messages.unshift({text: message.slice(0,MAX_MSG_LENGTH), color: color});
        splitMessage(message.slice(MAX_MSG_LENGTH,message.length), messages, color);
    }

}
