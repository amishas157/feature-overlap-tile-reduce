"use strict";

var tileReduce = require("tile-reduce");
var path = require("path");
var fs = require('fs');

var featureCollection = require("turf-featurecollection");

fs.openSync('errors.json', 'w');
fs.openSync('outputFeatures.json', 'w');

tileReduce({
  bbox: [-137.8,46.1,-104.8,67.5], // usa
  zoom: 16,
  map: path.join(__dirname, "/map.js"),
  maxWorkers: 4,
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
