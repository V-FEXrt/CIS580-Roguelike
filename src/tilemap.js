"use strict";

const MapGenerator = require('./map_generator');
// Tilemap engine defined using the Module pattern
module.exports = exports = Tilemap;


function Tilemap(canvas, smoothScroll, width, height, tileset, options){

  this.tiles = [];
  this.tileWidth = tileset.tilewidth;
  this.tileHeight = tileset.tileheight;
  this.mapWidth = width;
  this.mapHeight = height;

  this.smoothScroll = smoothScroll;

  this.draw = {};
  this.draw.origin = {x: 0, y: 0};

  // We add one so that we go slightly beyond the canvas
  this.draw.size = {
    width: Math.floor(canvas.width / this.tileWidth) + 1,
    height: Math.floor(canvas.height / this.tileHeight) + 1
  }
  this.draw.offset = {x: 0, y: 0};

  var self = this;

  // Load the tileset(s)

  var map = new MapGenerator(tileset.edges, this.mapWidth, this.mapHeight);
  var tset = new Image();
  tset.onload = function() {
    if(options.onload) options.onload();
  }
  tset.src = tileset.image;

  // Create the tileset's tiles
  var colCount = Math.floor(tileset.imagewidth / self.tileWidth),
      rowCount = Math.floor(tileset.imageheight / self.tileHeight),
      tileCount = colCount * rowCount;

  for(var i = 0; i < tileCount; i++) {
    var tile = {
      // Reference to the image, shared amongst all tiles in the tileset
      image: tset,
      // Source x position.  i % colCount == col number (as we remove full rows)
      sx: (i % colCount) * self.tileWidth,
      // Source y position. i / colWidth (integer division) == row number
      sy: Math.floor(i / colCount) * self.tileHeight,
    }
    self.tiles.push(tile);
  }
  // Set up the layer's data array.  We'll try to optimize
  // by keeping the index data type as small as possible
  if(self.tiles.length < Math.pow(2,8))
    this.data = new Uint8Array(map.map);
  else if (self.tiles.length < Math.pow(2, 16))
    this.data = new Uint16Array(map.map);
  else
    this.data = new Uint32Array(map.map);
}

Tilemap.prototype.moveTo = function(position){
  // Note: position should be in pixel coordinates
  //       and it should be the top left corner
  var origin = {
    x: Math.floor(position.x / this.tileWidth),
    y: Math.floor(position.y / this.tileHeight)
  }

  // don't allow the map to move beyond the edge
  if(origin.x < 0 || origin.y < 0) return;
  if(origin.x + this.draw.size.width > this.mapWidth || origin.y + this.draw.size.height > this.mapHeight) return;

  this.draw.origin = origin;

  if(this.smoothScroll){
    this.draw.offset.x = Math.floor(position.x - this.draw.origin.x * this.tileWidth)
    this.draw.offset.y = Math.floor(position.y - this.draw.origin.y * this.tileHeight)
  }
}

Tilemap.prototype.getDrawOrigin = function(){
  return {x: this.draw.origin.x, y: this.draw.origin.y};
}

Tilemap.prototype.render = function(screenCtx) {
  // Render tilemap layers - note this assumes
  // layers are sorted back-to-front so foreground
  // layers obscure background ones.
  // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
  var self = this;
  for(var y = self.draw.origin.y; y - self.draw.origin.y < Math.min(this.mapHeight, self.draw.size.height); y++) {
    for(var x = self.draw.origin.x; x - self.draw.origin.x < Math.min(this.mapWidth, self.draw.size.width); x++) {
      var tileId = this.data[x + this.mapWidth * y];

      // tiles with an id of 0 don't exist
      if(tileId != 0) {
        var tile = self.tiles[tileId - 1];
        if(tile.image) { // Make sure the image has loaded
          screenCtx.drawImage(
            tile.image,     // The image to draw
            tile.sx, tile.sy, self.tileWidth, self.tileHeight, // The portion of image to draw
            (x-self.draw.origin.x)*self.tileWidth - self.draw.offset.x, (y-self.draw.origin.y)*self.tileHeight - self.draw.offset.y, self.tileWidth, self.tileHeight // Where to draw the image on-screen
          );
        }
      }
    }
  }
}

Tilemap.prototype.isWall = function(x, y){
  return this.data[x + this.mapWidth * y] != 0;
}

Tilemap.prototype.tileAt = function(x, y) {
  // sanity check
  if(x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight)
    return undefined;
  return this.tiles[this.data[x + y*this.mapWidth] - 1];
}
