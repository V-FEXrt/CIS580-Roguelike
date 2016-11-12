"use strict";

const MapGenerator = require('./map_generator');

module.exports = exports = Tilemap;


function Tilemap(canvas, width, height, tileset, options){

  this.tiles = [];
  this.tileWidth = tileset.tilewidth;
  this.tileHeight = tileset.tileheight;
  this.mapWidth = width;
  this.mapHeight = height;

  this.draw = {};
  this.draw.origin = {x: 0, y: 0};

  // We add one so that we go slightly beyond the canvas
  this.draw.size = {
    width: Math.floor(canvas.width / this.tileWidth) + 1,
    height: Math.floor(canvas.height / this.tileHeight) + 1
  }

  // Load the tileset(s)

  var map = new MapGenerator(tileset.edges, this.mapWidth, this.mapHeight);
  var tset = new Image();
  tset.onload = function() {
    if(options.onload) options.onload();
  }
  tset.src = tileset.image;

  // Create the tileset's tiles
  var colCount = Math.floor(tileset.imagewidth / this.tileWidth),
      rowCount = Math.floor(tileset.imageheight / this.tileHeight),
      tileCount = colCount * rowCount;

  for(var i = 0; i < tileCount; i++) {
    var tile = {
      // Reference to the image, shared amongst all tiles in the tileset
      image: tset,
      // Source x position.  i % colCount == col number (as we remove full rows)
      sx: (i % colCount) * this.tileWidth,
      // Source y position. i / colWidth (integer division) == row number
      sy: Math.floor(i / colCount) * this.tileHeight,
    }
    this.tiles.push(tile);
  }

  // Set up the layer's data array.  We'll try to optimize
  // by keeping the index data type as small as possible
  if(this.tiles.length < Math.pow(2,8))
    this.data = new Uint8Array(map.map);
  else if (this.tiles.length < Math.pow(2, 16))
    this.data = new Uint16Array(map.map);
  else
    this.data = new Uint32Array(map.map);

  for(var i = 0; i < this.mapWidth * this.mapHeight; i++){
    var tileId = this.data[i];
    // tiles with an id of 0 get painted as background
    if(tileId == 0) {
      this.data[i] = (Math.random() > 0.1) ? 49 : 50 + rand(7);
    }
  }

}

Tilemap.prototype.moveTo = function(position){
  var origin = {
    x: position.x,
    y: position.y
  }
  // don't allow the map to move beyond the edge
  if(origin.x < 0 || origin.y < 0) return;

  if(origin.x + this.draw.size.width > this.mapWidth || origin.y + this.draw.size.height > this.mapHeight) return;

  this.draw.origin = origin;
}

Tilemap.prototype.moveBy = function(position){
  this.moveTo(
    {
      x: this.draw.origin.x + position.x,
      y: this.draw.origin.y + position.y
    }
  );
}

Tilemap.prototype.getDrawOrigin = function(){
  return {x: this.draw.origin.x, y: this.draw.origin.y};
}

Tilemap.prototype.render = function(screenCtx) {
  // Render tilemap layers - note this assumes
  // layers are sorted back-to-front so foreground
  // layers obscure background ones.
  // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
  for(var y = this.draw.origin.y; y - this.draw.origin.y < Math.min(this.mapHeight, this.draw.size.height); y++) {
    for(var x = this.draw.origin.x; x - this.draw.origin.x < Math.min(this.mapWidth, this.draw.size.width); x++) {
      var tileId = this.data[x + this.mapWidth * y];

      var tile = this.tiles[tileId - 1];
      if(tile.image) { // Make sure the image has loaded
        screenCtx.drawImage(
          tile.image,     // The image to draw
          tile.sx, tile.sy, this.tileWidth, this.tileHeight, // The portion of image to draw
          (x-this.draw.origin.x)*this.tileWidth, (y-this.draw.origin.y)*this.tileHeight, this.tileWidth, this.tileHeight // Where to draw the image on-screen
        );
      }
    }
  }
}

Tilemap.prototype.isWall = function(x, y){
  //return this.data[x + this.mapWidth * y] != 0;

  //Tiles that are not solid are hard coded here for now
  //Potentially add "solid" property to tiles
  var type = this.data[x + this.draw.origin.x + this.mapWidth * (y+this.draw.origin.y)];
  return(!(type >= 49 && type <= 56 ))
}

Tilemap.prototype.tileAt = function(x, y) {
  // sanity check
  if(x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight)
    return undefined;
  return this.tiles[this.data[x + y*this.mapWidth] - 1];
}

function rand(max){
  return Math.floor(Math.random() * max);
}
