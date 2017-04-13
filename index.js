"use strict";

var tileReduce = require("tile-reduce");
var path = require("path");

var featureCollection = require("turf-featurecollection");


tileReduce({
  bbox: [7.409038,43.516333,7.533167,43.7519311], // monaco
  zoom: 16,
  map: path.join(__dirname, "/map.js"),
  sources: [{
    name: 'moroco',
    mbtiles: path.join(__dirname, "/primary.mbtiles"),
    raw: false,
  }]
})
.on('reduce', function() {

})
.on('end', function() {

});
