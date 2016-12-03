"use strict";

module.exports = exports = DebugMap;


function DebugMap(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;
  this.percent = percent;

  this.open = 0;
  this.filled = 1;
}

DebugMap.prototype.generate = function(){
  this.fillMap()
  return this.map
}

DebugMap.prototype.fillMap = function(){
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
      }else{
        this.map[row * this.width + column] = this.open;
      }
    }
  }
}
