"use strict";

const Vector = require('./../vector');

module.exports = exports = RoomsHallways;

function RoomsHallways(width, height, percent, open, filled){
  this.map = [];
  this.width = width;
  this.height = height;

  this.numRoomTries = 50;
  this.increaseRoomSize = 0;
  this.windingPercent = 15;
  this.extraConnectorsPercent = 30;

  if(width % 2 == 0 || height % 2 == 0){
    throw new Error("Map must have odd demensions");
  }

  this.open = 0;
  this.filled = 1;

  this.rooms = [];
  this.regions = [];
  this.currentRegion = -1;

  this.cardinal = [
    {x: 0, y: -1},
    {x: 0, y: 1},
    {x: -1, y: 0},
    {x: 1, y: 0}
  ];
}

RoomsHallways.prototype.generate = function(){
  this.fillMap();
  this.placeRooms();
  this.carveHallways();
  this.connectRoomsAndHalls();
  this.removeDeadEnds();
  return this.map;
}

RoomsHallways.prototype.removeDeadEnds = function(){
  var done = false;
  while (done == false) {
    done = true;
    for(var y = 0; y < this.height; y++){
      for(var x = 0; x < this.width; x++){
        var point = {x: x, y: y};
        if(this.getTile(point) == this.filled) continue;
        var exits = 0;
        for(var i = 0; i < this.cardinal.length; i++){
          var pos = Vector.add(point, this.cardinal[i])
          if (this.getTile(pos) == this.open) exits++;
        }
        if (exits != 1) continue;

        done = false;
        this.fill(point);
      }
    }
  }
}

RoomsHallways.prototype.fillMap = function(){
  this.map = [];
  for(var i = 0; i < this.width * this.height; i++){
    this.map.push(this.filled);
    this.regions.push(-1);
  }
}

RoomsHallways.prototype.placeRooms = function(){
  for (var i = 0; i < this.numRoomTries; i++) {
      var size = rand(3 + this.increaseRoomSize) * 2 + 1;
      var rectangularity = rand(1 + Math.floor(size / 2)) * 2;
      var width = size;
      var height = size;

      if (Math.random() > 0.5) {
        width += rectangularity;
      } else {
        height += rectangularity;
      }

      var x = rand(Math.floor((this.width - width) / 2)) * 2 + 1;
      var y = rand(Math.floor((this.height - height) / 2)) * 2 + 1;

      var room = Rect(x, y, width, height);

      var overlaps = false;
      for(var i = 0; i < this.rooms.length; i++){
          if(collision(room, this.rooms[i])){
            overlaps = true;
            break;
          }
      }

      if (overlaps) continue;
      this.currentRegion++;
      this.rooms.push(room);

      var self = this;
      RectPoints(room).forEach(function(point){
        self.carve(point);
      });
    }
}

RoomsHallways.prototype.carveHallways = function(){
  for (var y = 1; y < this.height; y += 2) {
    for (var x = 1; x < this.width; x += 2) {
      var pos = {x: x, y: y};
      if (this.getTile(pos) != this.filled) continue;
      this.growMaze(pos);
    }
  }
}

RoomsHallways.prototype.connectRoomsAndHalls = function(){
  var mergingCells = [];

  // weird things so we ignore the borders
  for(var y = 1; y < this.height - 1; y++){
    for(var x = 1; x < this.width - 1; x++){
      var point = {x: x, y: y};
      if(this.getTile(point) != this.filled) continue;

      var surrRegions = new Set();
      for(var i = 0; i < this.cardinal.length; i++){
        var r = this.getRegion(Vector.add(point, this.cardinal[i]))
        if(r != -1) surrRegions.add(r);
      }

      if(surrRegions.size == 2){
        var mergible = {point: point, regions: []};
        surrRegions.forEach(function(region){
          mergible.regions.push(region);
        })
        mergingCells.push(mergible);
      }
    }
  }

  while(this.countRegions() > 1){

    if(this.countRegions() == 2){
      return;
    }

    var idx = rand(mergingCells.length);
    var merge = mergingCells[idx];
    this.carve(merge.point);
    var first = -1;
    var rest = [];

    merge.regions.forEach(function(value) {
      if(first == -1){
        first = value;
      }else{
        rest.push(value);
      }
    });

    mergingCells = mergingCells.filter(function(item){
      var hasOne = item.regions.indexOf(merge.regions[0]) > -1;
      var hasTwo = item.regions.indexOf(merge.regions[1]) > -1;
      return !(hasOne && hasTwo)
    });

    var self = this;
    rest.forEach(function(region) {
      self.replaceRegion(region, first);
    })

    mergingCells.forEach(function(item){
      rest.forEach(function(region) {
        var idx = item.regions.indexOf(region)
        if(idx > -1){
          item.regions[idx] = first;
        }
      });
    });

    this.regions[point.y * this.width + point.x] = first;
  }

return;
  // Add extra doors to 1/2 of the rooms
  var self = this;
  this.rooms.forEach(function(room){
    if(Math.random() > 1 - (self.extraConnectorsPercent / 100)) return;
    var point;
    do{
      point = pickAdjacent(room);
    } while (point.x == 0 || point.y == 0 || point.x >= self.width || point.y >= self.height);

    self.carve(point);
  });
}

RoomsHallways.prototype.growMaze = function(start){
  var cells = [];
  var lastDir = {x: 0, y: 0};

  this.currentRegion++;
  this.carve(start);

  cells.push(start);
  while (cells.length != 0) {
    var cell = cells[cells.length -  1];

    var openAdjacent = [];

    for(var i = 0; i < this.cardinal.length; i++){
      if (this.canCarve(cell, this.cardinal[i])) openAdjacent.push(this.cardinal[i]);
    }

    if (openAdjacent.length != 0) {
      var dir;
      if (openAdjacent.indexOf(lastDir) != -1 && (rand(100) + 1) > this.windingPercent) {
        dir = lastDir;
      } else {
        dir = openAdjacent[rand(openAdjacent.length)];
      }

      var pos = Vector.add(cell, dir);
      this.carve(pos);
      pos = Vector.add(pos, dir);
      this.carve(pos);

      cells.push(pos);
      lastDir = dir;
    } else {
      // No adjacent uncarved cells.
      cells.pop();

      // This path has ended.
      lastDir = {x: 0, y: 0};
    }
  }
}

RoomsHallways.prototype.canCarve = function(pos, direction) {
    var point = Vector.add(pos, Vector.scale(direction, 3));
    if(point.x >= this.width || point.y >= this.height) return false;

    point = Vector.add(pos, Vector.scale(direction, 2));
    // Destination must not be open.
    return this.getTile(point) == this.filled;
}
RoomsHallways.prototype.carve = function(pos){
  this.regions[pos.y * this.width + pos.x] = this.currentRegion;
  this.map[pos.y * this.width + pos.x] = this.open;
}
RoomsHallways.prototype.fill = function(pos){
  this.regions[pos.y * this.width + pos.x] = -1;
  this.map[pos.y * this.width + pos.x] = this.filled;
}
RoomsHallways.prototype.getTile = function(pos){
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) return -1;
  return this.map[pos.y * this.width + pos.x];
}
RoomsHallways.prototype.getRegion = function(pos){
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) return -1;
  return this.regions[pos.y * this.width + pos.x];
}
RoomsHallways.prototype.replaceRegion = function(region, replacement){
  for(var i = 0; i < this.width * this.height; i++){
    if(this.regions[i] == region) this.regions[i] = replacement;
  }
}

RoomsHallways.prototype.countRegions = function(){
  var x = new Set(this.regions);
  return x.size - 1;
}


function RectPoints(rect){
  var points = [];
  for(var i = rect.position.x; i < rect.position.x + rect.size.width; i++){
    for(var j = rect.position.y; j < rect.position.y + rect.size.height; j++){
      points.push({x: i, y: j});
    }
  }
  return points;
}

function Rect(x, y, width, height){
  return {
    position: {
      x: x,
      y: y
    },
    size: {
      width: width,
      height: height
    }
  }
}

function rand(upper){
  return Math.floor(Math.random() * upper);
}

function collision(rect1, rect2){
  return !(
    (rect1.position.y + rect1.size.height < rect2.position.y) ||
    (rect1.position.y > rect2.position.y + rect2.size.height) ||
    (rect1.position.x > rect2.position.x + rect2.size.width) ||
    (rect1.position.x + rect1.size.width < rect2.position.x))
}

function pickAdjacent(room) {
  var side = rand(4);
  var y;
  var x;
  if(side % 2 == 0){
    y = (side == 0) ? room.position.y - 1 : room.position.y + room.size.height;
    x = rand(room.size.width) + room.position.x;
  }else{
    x = (side == 1) ? room.position.x - 1 : room.position.x + room.size.width;
    y = rand(room.size.height) + room.position.y;
  }
  return {x: x, y: y};
}
