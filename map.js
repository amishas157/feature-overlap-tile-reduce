'use strict';

var featureFilter = require("feature-filter");
var explode = require('turf-explode');
var within  = require('turf-within');
var featureCollection = require('turf-featureCollection');

var filter = [
  'any',
  ['==', 'natural', 'water'],
  ['==', 'landuse', 'reservoir'],
  ['==', 'natural', 'bay'],
  ['==', 'waterway', 'dock'],
  ['==', 'waterway', 'riverbank'],
  ['==', 'natural', 'wetland']
];

var natural = featureFilter(filter);

module.exports = function(data, tile, writeData, done) {
  var layer = data.india.osm;
  var overlaps = [];

  var naturals = layer.features.filter(natural);
  naturals.forEach(function (natural) {
    var points = explode(natural);
    layer.features.forEach( function(feature) {
      if (natural.properties['@id'] != feature.properties['@id']) {
        var pointsWithin = within(points, featureCollection(feature));
        if (pointsWithin.length > 0) {
          overlaps.push([natural.properties['@type'], natural.properties['@id'], feature.properties['@type'], feature.properties['@id']]); 
        }
      }
    });
  });
  if (overlaps.length > 0) {
    writeData(JSON.stringify(overlaps) + '\n');
  }
  // writeData(JSON.stringify(overlaps.length) + "\n");

  done(null, null);
};
