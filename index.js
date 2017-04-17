"use strict";

var tileReduce = require("tile-reduce");
var path = require("path");

var featureCollection = require("turf-featurecollection");


tileReduce({
  bbox: [-178.2,6.6,-49.0,83.3], // usa
  zoom: 16,
  map: path.join(__dirname, "/map.js"),
  maxWorkers: 8,
  sources: [{
    name: 'usa',
    mbtiles: path.join(__dirname, "/america.mbtiles"),
    raw: false,
  }]
})
.on('reduce', function() {

})
.on('end', function() {

});
