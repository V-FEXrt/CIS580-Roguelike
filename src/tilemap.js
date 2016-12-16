"use strict";

const MapGenerator = require('./map_generator');
const Vector = require('./vector')

module.exports = exports = Tilemap;


function Tilemap(canvas, width, height, tileset, isBoss, options) {

  this.tiles = [];
  this.tileWidth = tileset.tilewidth;
  this.tileHeight = tileset.tileheight;
  this.mapWidth = width;
  this.mapHeight = height;
  this.tileset = tileset

  this.draw = {};
  this.draw.origin = { x: 0, y: 0 };

  this.idx = 0;

  this.isBoss = isBoss;

  // We add one so that we go slightly beyond the canvas
  this.draw.size = {
    width: Math.floor(canvas.width / this.tileWidth),
    height: Math.floor(canvas.height / this.tileHeight)
  }

  // Load the tileset(s)

  var tset = new Image();
  tset.onload = function () {
    if (options.onload) options.onload();
  }
  tset.src = tileset.image;

  // Create the tileset's tiles
  var colCount = Math.floor(tileset.imagewidth / this.tileWidth),
    rowCount = Math.floor(tileset.imageheight / this.tileHeight),
    tileCount = colCount * rowCount;

  for (var i = 0; i < tileCount; i++) {
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

  this.generateMap();

}

Tilemap.prototype.changeTileset = function () {
  this.idx++;
  this.idx %= this.tileset.images.length;
  var tset = new Image();
  tset.src = this.tileset.images[this.idx];
  this.tiles.forEach(function (tile) {
    tile.image = tset;
  })
}
Tilemap.prototype.generateMap = function () {
  var map = new MapGenerator(this.tileset.edges, this.mapWidth, this.mapHeight, this.isBoss);

  // Set up the layer's data array.  We'll try to optimize
  // by keeping the index data type as small as possible
  if (this.tiles.length < Math.pow(2, 8))
    this.data = new Uint8Array(map.map);
  else if (this.tiles.length < Math.pow(2, 16))
    this.data = new Uint16Array(map.map);
  else
    this.data = new Uint32Array(map.map);

  for (var i = 0; i < this.mapWidth * this.mapHeight; i++) {
    var tileId = this.data[i];
    // tiles with an id of 0 get painted as background
    if (tileId == 0) {
      this.data[i] = (Math.random() > 0.1) ? 49 : 50 + rand(7);
    }
  }
}

Tilemap.prototype.moveTo = function (position) {
  var origin = {
    x: position.x,
    y: position.y
  }
  // don't allow the map to move beyond the edge
  if (origin.x < 0) {
    origin.x = 0
  }

  if (origin.y < 0) {
    origin.y = 0;
  }

  if (origin.x + this.draw.size.width > this.mapWidth) {
    origin.x = this.mapWidth - this.draw.size.width;
  }

  if (origin.y + this.draw.size.height > this.mapHeight) {
    origin.y = this.mapHeight - this.draw.size.height;
  }

  this.draw.origin = origin;
}

Tilemap.prototype.moveBy = function (position) {
  this.moveTo(
    {
      x: this.draw.origin.x + position.x,
      y: this.draw.origin.y + position.y
    }
  );
}

Tilemap.prototype.getDrawOrigin = function () {
  return { x: this.draw.origin.x, y: this.draw.origin.y };
}

Tilemap.prototype.render = function (screenCtx) {
  // Render tilemap layers - note this assumes
  // layers are sorted back-to-front so foreground
  // layers obscure background ones.
  // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
  for (var y = this.draw.origin.y; y - this.draw.origin.y < Math.min(this.mapHeight - this.draw.origin.y, this.draw.size.height); y++) {
    for (var x = this.draw.origin.x; x - this.draw.origin.x < Math.min(this.mapWidth - this.draw.origin.x, this.draw.size.width); x++) {
      var tileId = this.data[x + this.mapWidth * y];

      var tile = this.tiles[tileId - 1];
      if (tile.image) { // Make sure the image has loaded
        screenCtx.drawImage(
          tile.image,     // The image to draw
          tile.sx, tile.sy, this.tileWidth, this.tileHeight, // The portion of image to draw
          (x - this.draw.origin.x) * this.tileWidth, (y - this.draw.origin.y) * this.tileHeight, this.tileWidth, this.tileHeight // Where to draw the image on-screen
        );
      }
    }
  }
}

Tilemap.prototype.toScreenCoords = function (position) {
  return Vector.subtract(position, this.draw.origin);
}

Tilemap.prototype.toWorldCoords = function (position) {
  return Vector.add(position, this.draw.origin);
}

Tilemap.prototype.isWall = function (x, y) {
  //return this.data[x + this.mapWidth * y] != 0;

  //Tiles that are not solid are hard coded here for now
  //Potentially add "solid" property to tiles
  var type = this.data[x + this.mapWidth * y];

  return (!(type >= 49 && type <= 56))
}

Tilemap.prototype.tileAt = function (x, y) {
  // sanity check
  if (x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight)
    return undefined;
  return this.tiles[this.data[x + y * this.mapWidth] - 1];
}

function rand(max) {
  return Math.floor(Math.random() * max);
}

//Finds an open tile space randomly across the entire map
Tilemap.prototype.findOpenSpace = function () {
  var randIndex = 0;
  var spotFound = false;
  var tileIndexes = [];
  var tile;

  for (var i = 0; i < this.mapWidth * this.mapHeight; i++) {
    tileIndexes.push(i);
  }

  do {
    randIndex = Math.floor(Math.random() * tileIndexes.length);
    tile = tileIndexes[randIndex];
    spotFound = !this.isWall(tile % this.mapWidth, Math.floor(tile / this.mapWidth));
    tileIndexes.splice(randIndex, 1);
  } while (!spotFound && tileIndexes.length > 0);

  if (!spotFound) {
    throw new Error("Could not find free space. Check map generation algorithms and definition of empty spaces.")
  }

  return { x: tile % this.mapWidth, y: Math.floor(tile / this.mapWidth) };
}

// Finds an random open tile adjacent to a given tile.
Tilemap.prototype.getRandomAdjacent = function (aTile) {
  var adjacents = this.getRandomAdjacentArray(aTile);
  if (adjacents.length == 0) {
    return aTile;
  } else {
    return adjacents[rand(adjacents.length)];
  }
}

Tilemap.prototype.getRandomAdjacentArray = function (aTile) {
  var adjacents = [
    { x: aTile.x - 1, y: aTile.y - 1, wall: this.isWall(aTile.x - 1, aTile.y - 1) },
    { x: aTile.x, y: aTile.y - 1, wall: this.isWall(aTile.x, aTile.y - 1) },
    { x: aTile.x + 1, y: aTile.y - 1, wall: this.isWall(aTile.x + 1, aTile.y - 1) },
    { x: aTile.x - 1, y: aTile.y, wall: this.isWall(aTile.x - 1, aTile.y) },
    { x: aTile.x + 1, y: aTile.y, wall: this.isWall(aTile.x + 1, aTile.y) },
    { x: aTile.x - 1, y: aTile.y + 1, wall: this.isWall(aTile.x - 1, aTile.y + 1) },
    { x: aTile.x, y: aTile.y + 1, wall: this.isWall(aTile.x, aTile.y + 1) },
    { x: aTile.x + 1, y: aTile.y + 1, wall: this.isWall(aTile.x + 1, aTile.y + 1) }
  ];
  adjacents = adjacents.filter(tile => !tile.wall);
  return adjacents;
}
