"use strict";

const MAX_MSG_COUNT = 50;
const MAX_MSG_LENGTH = 29;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = {x: 1063, y: 649};
    this.clicked = false;
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
    ctx.fillText(">", 1063, 667);
    ctx.fillStyle = "#d3d3d3";
    if(!this.clicked) ctx.fillText("Click here to type", 1078, 667);
}

Terminal.prototype.processInput = function(string) {
    if(string.charAt(0) == "/") {
        var space = string.indexOf(" ");
        if(space == -1) {
            switch(string) {
                case "/stats":
                    window.terminal.log("Here are your current stats:");
                    break;
                case "/weapon":
                    window.terminal.log("Here are your weapon's current stats:");
                    break;
                case "/armor":
                    window.terminal.log("Here are your armor's current stats:");
                    break;
                case "/help":
                    window.terminal.log("/stats - Show's your current stats for your player");
                    window.terminal.log("/weapon - Show's the current stats of your weapon");
                    window.terminal.log("/armor - Show's the current stats of your armor");
                    break;
                default:
                    window.terminal.log("Command not found");
            }
        }
        else {
            switch(string.splice(1,string.indexof(" "))) {
                // This is for any commands we might add that have arguments
                // I can't think of any that we need at the moment
            }
        }
        
    }
    else {
        window.terminal.log(string, "yellow");
    }
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
