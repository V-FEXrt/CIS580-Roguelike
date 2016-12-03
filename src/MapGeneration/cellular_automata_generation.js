"use strict";

module.exports = exports = CellularAutomata;


function CellularAutomata(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;
  this.percent = percent;

  this.open = 0;
  this.filled = 1;
}

CellularAutomata.prototype.generate = function(){
  this.randomFillMap();
  this.makeCaverns();
  return this.map
}

CellularAutomata.prototype.randomFillMap = function(){
  var mapMiddleX = Math.floor(this.height / 2);
  var mapMiddleY = Math.floor(this.width / 2);

  this.map = [];
  for(var i = 0; i < this.width * this.height; i++){
    this.map.push(this.open);
  }

  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      //column is x, row is y

      // If coordinants lie on the the edge of the map (creates a border)
      if (column == 0 || row == 0 || column == this.width - 1 || row == this.height - 1){
        // y * width + x
        this.map[row * this.width + column] = this.filled;
      }else if(row == mapMiddleX || column == mapMiddleY){
        this.map[row * this.width + column] = this.open;
      }
      else{
        this.map[row * this.width + column] = this.pickTile();
      }
    }
  }
}

CellularAutomata.prototype.pickTile = function() {
  if(this.percent >= rand(100) + 1) return this.filled;
  return this.open;
}

CellularAutomata.prototype.makeCaverns = function(){
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      this.map[row * this.width + column] = this.pickCavernTile(column, row);
    }
  }
}

CellularAutomata.prototype.pickCavernTile = function(x, y){
  var wallCount = this.countAdjacentWalls(x, y, 1, 1);

  if(this.map[y * this.width + x] == this.filled){
    if(wallCount >= 4) return this.filled;
    if(wallCount < 2) return this.open;
  }
  else{
    if(wallCount >= 5) return this.filled;
  }
  return this.open;
}

CellularAutomata.prototype.countAdjacentWalls = function(x, y, scopeX, scopeY){
  var startX = x - scopeX;
  var startY = y - scopeY;
  var endX = x + scopeX;
  var endY = y + scopeY;

  var count = 0;

  for(var iY = startY; iY <= endY; iY++){
    for(var iX = startX; iX <= endX; iX++){
      if(iX == x && iY == y) continue;
      if(this.isWallOrOutOfBounds(iX, iY)) count++;
    }
  }

  return count;
}

CellularAutomata.prototype.isWallOrOutOfBounds = function(x, y){
  return (this.isOutOfBounds(x, y) || this.isWall(x, y));
}

CellularAutomata.prototype.isWall = function(x, y){
  return (this.map[y * this.width + x] != this.open);
}

CellularAutomata.prototype.isOutOfBounds = function(x, y){
  return (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1);
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}
