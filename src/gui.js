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
  this.startBackground = new Image();
  this.startBackground.src = './spritesheets/start_background.png';
  this.swordHighlights = [0, 0, 0];
  this.swordYPos = [480, 576, 672];

  this.playerHighlights = [0, 0, 0];
  this.playerXPos = [705, 849, 993];

  this.titleMinY = 267;
  this.titleY = 267;
  this.titleMaxY = 272;
  this.titleDirection = 1;

  this.chosenClass = "";
}

//declare gui elements
var crest = new Image();
var pow = new Image();
crest.src = encodeURI('healthbar/crest.png');
pow.src = encodeURI('healthbar/pow.png');

var x, y;
GUI.prototype.onmousemove = function(event)
{
	x = event.offsetX;
	y = event.offsetY;
	if(this.state == "start")
	{     
		if(x >= 753 && x <= 1041)
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
		if(y >= 480 && y <= 576)
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

		this.titleY += this.titleDirection/10;
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
		this.startBackground,
		0, 0,
		1728,
		1056,
		0, 0,
		1788,
		1116
	);

	//Shadow
	ctx.drawImage(
		this.startSprites,
		0, 1056,
		480, 480,
		654, 288, //369, 192
		480, 480
	);

	//Title
	ctx.drawImage(
		this.startSprites,
		0, 768,
		576, 288,
		649, this.titleY,
		576, 288
	);

	//Start Game
	ctx.drawImage(
		this.startSprites,
		0, 672,
		288, 96,
		753 - this.swordHighlights[0]/2, 480 - this.swordHighlights[0]/2,
		288 +this.swordHighlights[0], 96 + this.swordHighlights[0]
	);

	//Controls
	ctx.drawImage(
		this.startSprites,
		288, 672,
		288, 96,
		753 - this.swordHighlights[1]/2, 576 - this.swordHighlights[1]/2,
		288 +this.swordHighlights[1], 96 + this.swordHighlights[1]
	);

	//Credits
	ctx.drawImage(
		this.startSprites,
		576, 672,
		288, 96,
		753 - this.swordHighlights[2]/2, 672 - this.swordHighlights[2]/2,
		288 +this.swordHighlights[2], 96 + this.swordHighlights[2]
	);
  }
  else if(this.state == "choose class")
  {
  	//Background
    ctx.drawImage(
      this.startBackground,
      0, 0,
      1728,
      1056,
      0, 0,
      1788,
      1116
    );

    //Shadow
    ctx.drawImage(
        this.startSprites,
        672, 1248,
        480, 384,
        657, 357,
        480, 384
    );

    //Nameplates
    ctx.drawImage(
      this.startSprites,
      576, 768,
      672, 480,
      561, 288,
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
      this.playerXPos[0] - this.playerHighlights[0]/2, 474 - this.playerHighlights[0]/2,
      96 + this.playerHighlights[0], 96 + this.playerHighlights[0]
    );

	//Archer
    ctx.drawImage(
      this.playerSprites,
      96 * 7, 96 *6,
      96 , 96,
      this.playerXPos[1]  - this.playerHighlights[1]/2, 474  - this.playerHighlights[1]/2,
	  96 + this.playerHighlights[1], 96 + this.playerHighlights[1]
    );

	//Mage
    ctx.drawImage(
      this.playerSprites,
      96*9, 96 *5,
      96 , 96,
      this.playerXPos[2]  - this.playerHighlights[2]/2, 474  - this.playerHighlights[2]/2,
      96 + this.playerHighlights[2] , 96 + this.playerHighlights[2]
    );
  }
  else if(this.state == "paused")
  {

  }
  else if(this.state == "playing")
  {
    ctx.save();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 1056, 1057, 60);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 1056, 1057, 2);

    ctx.fillStyle = "red";
    ctx.fillRect(6, 1078, 40, 20);
    ctx.fillRect(16, 1068, 20, 40);

    ctx.font = "55px Arial black";
    ctx.fillStyle = "red"
    if(window.player.combat.health < 1000) ctx.fillText(window.player.combat.health, 50, 1107);
    else ctx.fillText(999, 50, 1107);

    ctx.drawImage(crest, 180, 1061);

    ctx.font = "25px Arial Black";
    ctx.fillStyle = "green";
    if(window.player.combat.armor.defense < 10) ctx.fillText(window.player.combat.armor.defense, 192.5, 1093);
    else ctx.fillText(window.player.combat.armor.defense, 184.5, 1093);

    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = "white";
    ctx.rect(235, 1066, 340, 40);
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillText(window.player.combat.armor.name, 242.5, 1094.5)

    ctx.fillStyle = "green";
    ctx.drawImage(pow, 580, 1061);
    if(window.player.combat.weapon.level < 10) ctx.fillText(window.player.combat.weapon.level, 607, 1095);
    else ctx.fillText(window.player.combat.weapon.level, 600, 1095)

    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = "white";
    ctx.rect(658, 1066, 391, 40);
    ctx.stroke();

    ctx.font = "14px Arial Black";
    ctx.fillStyle = "white";
    ctx.fillText(window.player.combat.weapon.name + " -- Damage Range: " + window.player.combat.weapon.damageMin + "-" + window.player.combat.weapon.damageMax, 665.5, 1082);
    ctx.fillText(window.player.combat.weapon.properties, 665.5, 1099);

    }
  else if(this.state == "game over")
  {

  }
}
