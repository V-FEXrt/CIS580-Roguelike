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

//SFX Varuable for speaker rendering
//const SFX = require("./sfx");
//var sfx = new SFX();

//declare gui elements
var crest = new Image();
var pow = new Image();
var volume1 = new Image();
var volume2 = new Image();
var volume3 = new Image();
var volumeMute = new Image();
crest.src = encodeURI('healthbar/crest.png');
pow.src = encodeURI('healthbar/pow.png');
volume1.src = encodeURI('healthbar/speakerVol1.png');
volume2.src = encodeURI('healthbar/speakerVol2.png');
volume3.src = encodeURI('healthbar/speakerVol3.png');
volumeMute.src = encodeURI('healthbar/speakerMute.png');


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
      this.state = "controls";
		}
		else if(this.swordHighlights[2] != 0)
		{
      this.state = "credits";
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
		288 + this.swordHighlights[0], 96 + this.swordHighlights[0]
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
  else if(this.state == "credits")
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
        1248, 768,
        384, 384,
        581, 338,
        576, 576
    );

    //Credits
    ctx.drawImage(
      this.startSprites,
      1248, 0,
      384, 384,
      581, 268,
      576, 576
    );
  }
  else if(this.state == "controls")
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
        1248, 768,
        384, 384,
        581, 338,
        576, 576
    );

    //Credits
    ctx.drawImage(
      this.startSprites,
      1248, 384,
      384, 384,
      581, 268,
      576, 576
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
    ctx.fillRect(7, 1082.5, 38, 12);
    ctx.fillRect(19, 1070, 12, 38);

    ctx.font = "35px Arial black";
    ctx.fillStyle = "red"
    if(window.player.combat.health < 0) ctx.fillText(0, 50, 1099.5);
    else if(window.player.combat.health < 1000) ctx.fillText(window.player.combat.health, 50, 1099.5);
    else ctx.fillText(999, 50, 1099.5);

    ctx.font = "25px Arial Black";
    ctx.fillStyle = "green";
    ctx.drawImage(crest, 136, 1061);
    if(window.player.combat.armor.level < 10) ctx.fillText(window.player.combat.armor.level, 148.5, 1093);
    else ctx.fillText(window.player.combat.armor.level, 140, 1093);

    ctx.fillStyle = "white";
    ctx.fillText(window.player.combat.armor.name, 187.5, 1094.5)

    ctx.fillStyle = "green";
    ctx.drawImage(pow, 370, 1061);
    if(window.player.combat.weapon.level < 10) ctx.fillText(window.player.combat.weapon.level, 397, 1095);
    else ctx.fillText(window.player.combat.weapon.level, 390, 1095)

    ctx.font = "25px Arial Black";
    ctx.fillStyle = "white";
    var str =`${window.player.combat.weapon.name}, ${window.player.combat.weapon.damageMin + window.player.combat.weapon.level}-${window.player.combat.weapon.damageMax+window.player.combat.weapon.level} Damage`;
    if(window.player.combat.weapon.proppropertiesShort !="") str = str.concat(`, ${window.player.combat.weapon.propertiesShort}`);
    ctx.fillText(str, 450, 1095);

    if(window.sfx.returnVolume() == 3) {
      ctx.drawImage(volume3, 1006, 1061.5, 50, 50);
    }
    else if(window.sfx.returnVolume() == 2){
      ctx.drawImage(volume2, 1006, 1061.5, 50, 50);
    }
    else if(window.sfx.returnVolume() == 1) {
      ctx.drawImage(volume1, 1006, 1061.5, 50, 50);
    }
    else {
      ctx.drawImage(volumeMute, 1006, 1061.5, 50, 50);
    }
    }
  else if(this.state == "game over")
  {

  }
}
