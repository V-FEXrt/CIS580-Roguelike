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
  this.size = size;
  this.playerSprites = new Image();
  this.playerSprites.src = './spritesheets/sprites.png';
  this.startSprites = new Image();
  this.startSprites.src = './spritesheets/start.png';
  this.highlightSize = 10;
  
  this.swordHighlights = [0, 0, 0];
  this.swordYPos = [288, 384, 480];
  
  this.playerHighlights = [0, 0, 0];
  this.playerXPos = [336, 480, 624];
  
  this.titleMinY = 75;
  this.titleY = 75;
  this.titleMaxY = 80;
  this.titleDirection = 1;
  
  this.chosenClass = "";
}

var x, y;
GUI.prototype.onmousemove = function(event)
{
	x = event.offsetX;
	y = event.offsetY;
	if(this.state == "start")
	{
		if(x >= 384 && x <= 672)
		{
			if(y >= this.swordYPos[0] + 20 && y <= this.swordYPos[0] + 76)
			{
				this.swordHighlights[0] = this.highlightSize;
			}
			else if(y >= this.swordYPos[1] + 20 && y <= this.swordYPos[1] + 76)
			{
				this.swordHighlights[1] = this.highlightSize;
			}
			else if(y >= this.swordYPos[2] + 20 && y <= this.swordYPos[2] + 76)
			{
				this.swordHighlights[2] = this.highlightSize;
			}
			else this.swordHighlights = [0, 0, 0];
		}
		else this.swordHighlights = [0, 0, 0];
	}
	else if(this.state == "choose class")
	{
		if(y >= 288 && y <= 384)
		{
			if(x >= this.playerXPos[0] + 20 && x <= this.playerXPos[0] + 76)
			{
				this.playerHighlights[0] = this.highlightSize;
			}
			else if(x >= this.playerXPos[1] + 20 && x <= this.playerXPos[1] + 76)
			{
				this.playerHighlights[1] = this.highlightSize;
			}
			else if(x >= this.playerXPos[2] + 20 && x <= this.playerXPos[2] + 76)
			{
				this.playerHighlights[2] = this.highlightSize;
			}
			else this.playerHighlights = [0, 0, 0];
		}
		else this.playerHighlights = [0, 0, 0];
	}
}

GUI.prototype.onmousedown = function(event)
{
	if(this.state == "start")
	{
		if(this.swordHighlights[0] != 0)
		{
			this.state = "choose class";
		}
		else if(this.swordHighlights[1] != 0)
		{
            //this.state = "controls";
		}
		else if(this.swordHighlights[2] != 0)
		{
            //this.state = "credits";
		}
	}
    else if(this.state == "choose class")
    {
        if(this.playerHighlights[0] != 0)
		{
			//Knight
            this.chosenClass = "Knight";
            this.state = "playing";
		}
		else if(this.playerHighlights[1] != 0)
		{
            //Archer
            this.chosenClass = "Archer";
            this.state = "playing";
		}
		else if(this.playerHighlights[2] != 0)
		{
            //Mage
            this.chosenClass = "Mage";
            this.state = "playing";
		}
    }
}

/**
 * @function updates the GUI objects
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
GUI.prototype.update = function (time) {
	if(this.state == "start")
	{
		if(this.titleY >= this.titleMaxY)
		{
			this.titleDirection = -1;
		}
		else if(this.titleY <= this.titleMinY)
		{
			this.titleDirection = 1;
		}
		
		this.titleY += this.titleDirection * time/150;
	}
}

/**
 * @function renders the GUI into the provided context
 * {CanvasRenderingContext2D} ctx the context to render into
 */
GUI.prototype.render = function (elapsedTime, ctx) {
	ctx.imageSmoothingEnabled = false;

  if(this.state == "start")
  {
	//Background
	ctx.drawImage(
		this.startSprites,
		0, 0,
		this.size.width,
		this.size.height,
		0, 0,
		this.size.width,
		this.size.height
	);
	
	//Shadow
	ctx.drawImage(
		this.startSprites,
		0, 1056,
		480, 480,
		285, 96,
		480, 480
	);
	
	//Title
	ctx.drawImage(
		this.startSprites,
		0, 768,
		576, 288,
		285, this.titleY,
		576, 288
	);
	
	//Start Game
	ctx.drawImage(
		this.startSprites,
		0, 672,
		288, 96,
		384 - this.swordHighlights[0]/2, 288 - this.swordHighlights[0]/2,
		288 +this.swordHighlights[0], 96 + this.swordHighlights[0]
	);
	
	//Controls
	ctx.drawImage(
		this.startSprites,
		288, 672,
		288, 96,
		384 - this.swordHighlights[1]/2, 384 - this.swordHighlights[1]/2,
		288 +this.swordHighlights[1], 96 + this.swordHighlights[1]
	);
	
	//Credits
	ctx.drawImage(
		this.startSprites,
		576, 672,
		288, 96,
		384 - this.swordHighlights[2]/2, 480 - this.swordHighlights[2]/2,
		288 +this.swordHighlights[2], 96 + this.swordHighlights[2]
	);
  }
  else if(this.state == "choose class")
  {
  	//Background
	ctx.drawImage(
		this.startSprites,
		0, 0,
		this.size.width,
		this.size.height,
		0, 0,
		this.size.width,
		this.size.height
	);
	
    //Shadow
    ctx.drawImage(
        this.startSprites,
        672, 1248,
        480, 384,
        288, 165,
        480, 384
    );
    
	//Nameplates
	ctx.drawImage(
		this.startSprites,
		576, 768,
		672, 480,
		192, 96,
		672, 480
	);
	
	ctx.fillStyle = "lightgrey";   
    ctx.strokeStyle = "grey";
    ctx.lineWidth =  10;

    ctx.fillRect(x, y, this.size.width/2, this.size.height/3);
    ctx.strokeRect(x, y, this.size.width/2, this.size.height/3);
    var x = this.size.width/4;
    var y = this.size.height/3;
    ctx.font = "20px Arial"
    ctx.fillStyle = "black"
	
	//Knight
    ctx.drawImage(
      this.playerSprites,
      96, 96 *5,
      96 , 96,
      this.playerXPos[0] - this.playerHighlights[0]/2, 282 - this.playerHighlights[0]/2,
      96 + this.playerHighlights[0], 96 + this.playerHighlights[0]
    );
    
	//Archer
    ctx.drawImage(
      this.playerSprites,
      96 * 7, 96 *6,
      96 , 96,
      this.playerXPos[1]  - this.playerHighlights[1]/2, 282  - this.playerHighlights[1]/2,
	  96 + this.playerHighlights[1], 96 + this.playerHighlights[1]
    );
    
	//Mage
    ctx.drawImage(
      this.playerSprites,
      96*9, 96 *5,
      96 , 96,
      this.playerXPos[2]  - this.playerHighlights[2]/2, 282  - this.playerHighlights[2]/2,
      96 + this.playerHighlights[2] , 96 + this.playerHighlights[2]
    );
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
