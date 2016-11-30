"use strict";

/**
 * @module exports the GUI class
 */
module.exports = exports = GUI;

/**
 * @constructor GUI
 * Creates a new GUI object
 * @param {postition} position object specifying an x and y
 */
function GUI(size) {
  this.state = "start";
  this.state = "";
  this.size = size;
  this.playerSprites = new Image();
  this.playerSprites.src = './spritesheets/sprites.png';
}

/**
 * @function updates the GUI objects
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
GUI.prototype.update = function (time) {

}

GUI.prototype.onmousemove = function(mousePos)
{
  
}

/**
 * @function renders the GUI into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
GUI.prototype.render = function (elapsedTime, ctx) {
  if(this.state == "start")
  {
    ctx.fillStyle = "lightgrey";   
    ctx.strokeStyle = "grey";
    ctx.lineWidth =  10;
    var x = this.size.width/4;
    var y = this.size.height/3;
    ctx.fillRect(x, y, this.size.width/2, this.size.height/3);
    ctx.strokeRect(x, y, this.size.width/2, this.size.height/3);
    
    ctx.font = "20px Arial"
    ctx.fillStyle = "black"
    ctx.drawImage(
      this.playerSprites,
      96, 96 *5,
      96 , 96,
      x+60, y + 50,
      96, 96
    );
    ctx.fillText("Knight", x+80, y+ 180);
    
    ctx.drawImage(
      this.playerSprites,
      96 * 7, 96 *6,
      96 , 96,
      x+210, y + 50,
      96, 96
    );
    ctx.fillText("Archer", x+230, y+ 180);
    
    ctx.drawImage(
      this.playerSprites,
      96*9, 96 *5,
      96 , 96,
      x+360, y + 50,
      96, 96
    );
    ctx.fillText("Mage", x+380, y+ 180);
  }
  else if(this.state == "paused")
  {
    
  }
  else if(this.state == "playing")
  {
    
  }
  else if(this.state == "game over")
  {
    
  }
}
