"use strict";

var tileReduce = require("tile-reduce");
var path = require("path");

var turf = require("turf");

var featureArray = [];

tileReduce({
  bbox: [68.027, 7.798, 97.690, 36.067], // india
  zoom: 12,
  map: path.join(__dirname, "/map.js"),
  sources: [{
    name: 'india',
    mbtiles: path.join(__dirname, "/india.mbtiles"),
    raw: false,
  }]
})
.on('reduce', function(amenities) {
  amenities.forEach(function(feature) {
    featureArray.push(feature);
  });
})
.on('end', function(fc) {
  var fc = JSON.stringify(turf.featureCollection(featureArray));
  // console.log(fc + '\n');
});
