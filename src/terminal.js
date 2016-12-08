"use strict";

const MAX_MSG_COUNT = 62;
const MAX_MSG_LENGTH = 80;

module.exports = exports = Terminal;

function Terminal() {
    this.messages = [];
    this.startPos = { x: 1063, y: 1095 };
    this.active = false;
    this.input = "";
    this.commands = {};

    this.addCommand("help", "Print out all commands", this.helpCommand.bind(this));
}

Terminal.prototype.log = function (message, color) {
    if (typeof color == 'undefined') color = 'white';
    splitMessage(message, this.messages, color);
    if (this.messages.length > MAX_MSG_COUNT) {
        this.messages.pop();
    }
    if (window.debug) console.log(message);
}

Terminal.prototype.clear = function () {
    this.messages = [];
}

Terminal.prototype.update = function (time) {

}

Terminal.prototype.render = function (elapsedTime, ctx) {
    ctx.font = "15px Courier New";
    var self = this;
    this.messages.forEach(function (message, i) {
        ctx.fillStyle = message.color;
        ctx.fillText(message.text, self.startPos.x, self.startPos.y - 18 * i);
    });

    ctx.fillText(">", 1063, 1111);

    if (this.active){
      ctx.fillStyle = "white";
      ctx.fillText(this.input, 1078, 1111)
    } else{
      ctx.fillStyle = "#d3d3d3";
      ctx.fillText("Press / to type", 1078, 1111);
    }
}

Terminal.prototype.onkeydown = function (event) {
  switch (event.key) {
    case "/":
      this.active = true;
      break;
    case "Enter":
      if(!this.active) return;
      this.processInput();
      this.input = "";
      this.active = false;
      break;
    case "Backspace":
      this.input = this.input.substr(0, this.input.length - 1);
      break;
    case "Escape":
      this.input = "";
      this.active = false;
    default:
      if(event.key.length > 1) return;
      if(this.active) this.input = this.input.concat(event.key)
  }

  return this.active;
}

// Callback should accept a string and return true if it handles the Command
// else it should return false
Terminal.prototype.addCommand = function(command, description, callback){
  this.commands[command] = {command: command, description: description, callback: callback};
}

Terminal.prototype.removeCommand = function(command){
  if(command in this.commands){
      delete this.commands[command];
  }
}

Terminal.prototype.helpCommand = function(){
  var self = this;
  Object.keys(self.commands).forEach(function(command){
    var c = self.commands[command];
    self.log(c.command + " " + c.description);
  });
}

Terminal.prototype.processInput = function () {
    var args = this.input.split(' ');
    this.log(args[0], "yellow");

    if(args[0] in this.commands){
        this.commands[args[0]].callback(args);
        return;
    }

    this.log("Command not found", "red");
    /*switch (this.input) {
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
    }*/
}

function splitMessage(message, messages, color) {
    if (message.length < 29) {
        messages.unshift({ text: message, color: color });
    }
    else {
        messages.unshift({ text: message.slice(0, MAX_MSG_LENGTH), color: color });
        splitMessage(message.slice(MAX_MSG_LENGTH, message.length), messages, color);
    }

}
