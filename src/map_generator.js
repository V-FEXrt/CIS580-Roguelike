"use strict";

const CellularAutomata = require('./MapGeneration/cellular_automata_generation');
const DebugMap = require('./MapGeneration/debug_map_generation');
const RoomsHallways = require('./MapGeneration/rooms_hallways_generation');

module.exports = exports = MapGenerator;

function MapGenerator(edges, width, height, isBoss){
  this.map = [];
  this.width = width;
  this.height = height;

  this.edges = edges;

  this.open = 0;
  this.filled = 1;

  if(window.debug || isBoss){
    this.map = (new DebugMap(width, height, 50, this.open, this.filled)).generate();
  }else{
    if(Math.random() > 0.5){
      this.map = (new RoomsHallways(width, height, 50, this.open, this.filled)).generate();
    }else{
      this.map = (new CellularAutomata(width, height, 50, this.open, this.filled)).generate();
    }

  }


  this.processEdges();
}

MapGenerator.prototype.processEdges = function(){
  var str = ""
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      if(!this.isWall(column, row)){
        str += "-1, ";
        continue;
      }
      this.map[row * this.width + column] = this.edges[this.countScore(column, row)];
      str += this.countScore(column, row) + ", ";
    }
  }
}

MapGenerator.prototype.toString = function(){
  var header = "Width: " + this.width + "\tHeight: " + this.height + "\n";
  var body = ""
  for(var row = 0; row < this.height; row++){
    for(var column = 0; column < this.width; column++){
      var val =  this.map[row * this.width + column]
      if(val < 10){
        //body += "0";
      }
      body += (this.map[row * this.width + column] == this.open) ? "." : "#"; //val + " "; //(this.map[row * this.width + column] == this.open) ? "." : "#";
    }
    body += "\n";
  }
  return header + body;
}

MapGenerator.prototype.countScore = function(x, y){
  var score = 0;

  if(!this.isOutOfBounds(x + 1, y - 1) && this.isWall(x + 1, y - 1)) score += 1;
  if(!this.isOutOfBounds(x + 1, y + 1) && this.isWall(x + 1, y + 1)) score += 2;
  if(!this.isOutOfBounds(x - 1, y + 1) && this.isWall(x - 1, y + 1)) score += 4;
  if(!this.isOutOfBounds(x - 1, y - 1) && this.isWall(x - 1, y - 1)) score += 8;

  if(!this.isOutOfBounds(x, y - 1) && this.isWall(x, y - 1)) score += 16;
  if(!this.isOutOfBounds(x + 1, y) && this.isWall(x + 1, y)) score += 32;
  if(!this.isOutOfBounds(x, y + 1) && this.isWall(x, y + 1)) score += 64;
  if(!this.isOutOfBounds(x - 1, y) && this.isWall(x - 1, y)) score += 128;

  return score
}

MapGenerator.prototype.isFillWall = function(x, y){
  return (this.map[y * this.width + x] == this.edges[15]);
}

MapGenerator.prototype.isWallOrOutOfBounds = function(x, y){
  return (this.isOutOfBounds(x, y) || this.isWall(x, y));
}

MapGenerator.prototype.isWall = function(x, y){
  return (this.map[y * this.width + x] != this.open);
}

MapGenerator.prototype.isOutOfBounds = function(x, y){
  return (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1);
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}
