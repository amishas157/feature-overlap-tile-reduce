'use strict';

var featureFilter = require('feature-filter');
var explode = require('turf-explode');
var within  = require('turf-within');
var featureCollection = require('turf-featurecollection');
var area = require('turf-area');
var ak = require('id-area-keys');
var polygon = require('turf-polygon');
var turf = require('turf');
var fs = require('fs');
var arrayIntersection = require('lodash.intersection');
var turfCircle = require('@turf/circle');

var primaryTags = ['aerialway', 'aeroway', 'amenity', 'barrier', 'boundary', 'building', 'craft', 'emergency'
, 'emergency', 'geological', 'highway', 'landuse', 'leisure', 'man_made', 'military', 'natural',
'office', 'man_made', 'places', 'power', 'public_transport', 'railway', 'route', 'shop', 'sport', 
'tourism','waterway'];

var relationsIndexFile = fs.readFileSync('relations.json');
var relationsIndex = JSON.parse(relationsIndexFile.toString());
module.exports = function(data, tile, writeData, done) {
  var layer = data.moroco.output;
  var overlaps = [];

  var naturals = layer.features;
  naturals.forEach(function (natural) {
    var naturalTagIntersectionArray = arrayIntersection(Object.keys(natural.properties), primaryTags);
    var naturalTagIntersection = {};
    naturalTagIntersectionArray.forEach(function(key) {
      naturalTagIntersection[key] = natural.properties[key];
    });
    naturals.forEach(function(feature) {
      var featureTagIntersectionArray = arrayIntersection(Object.keys(feature.properties), primaryTags);
      var featureTagIntersection = {};
      featureTagIntersectionArray.forEach(function(key) {
        featureTagIntersection[key] = feature.properties[key];
      });
      var naturalId = natural['properties']['id'];
      var featureId = feature['properties']['id'];
      if (naturalId !== featureId) {
        if (relationsIndex.hasOwnProperty(naturalId) && relationsIndex.hasOwnProperty(featureId)) {
          var arr = arrayIntersection(relationsIndex[naturalId], relationsIndex[featureId]);
          if (arr.length === 0) {
            overlaps = overlaps.concat(getOverlaps(natural, feature, naturalTagIntersection, featureTagIntersection));
          }
        } else {
          overlaps = overlaps.concat(getOverlaps(natural, feature, naturalTagIntersection, featureTagIntersection));
        }
      }
    });
  });
  if (overlaps.length > 0) {
    writeData(JSON.stringify(overlaps) + '\n');
  }
  done(null, null);
};

function getOverlaps(natural, feature, naturalTagIntersection, featureTagIntersection) {
    var overlap = [];
    var intersect;
    var naturalPoly, featurePoly;
    if (isClosedWay(natural.geometry.coordinates) && isClosedWay(feature.geometry.coordinates)) {
        // both overlapping and overlapped features are closed
        naturalPoly = polygon([natural.geometry.coordinates], natural.properties);
        featurePoly = polygon([feature.geometry.coordinates], feature.properties);
        intersect = turf.intersect(naturalPoly, featurePoly);
        if (intersect && intersect.geometry.type === 'Polygon' && (intersect.geometry.coordinates[0].length > 4)) {
            if (intersect.geometry.coordinates[0].length === 5) {
                var d1 = turf.distance(intersect.geometry.coordinates[0][0], intersect.geometry.coordinates[0][1]);
                var d2 = turf.distance(intersect.geometry.coordinates[0][1], intersect.geometry.coordinates[0][2]);
                if (!(d1 < 0.0001 || d2 < 0.0001)) {
                    overlap.push(['case1', natural['properties']['id'], feature['properties']['id'], naturalTagIntersection, featureTagIntersection]);            
                }
            } else {
                overlap.push(['case1', natural['properties']['id'], feature['properties']['id'], naturalTagIntersection, featureTagIntersection]);      
            }
        }
    } else if (isClosedWay(natural.geometry.coordinates) && (!isClosedWay(feature.geometry.coordinates))) {
        // only overlapping feature is closed
        naturalPoly = polygon([natural.geometry.coordinates], natural.properties);
        intersect = turf.intersect(naturalPoly, feature);
        if (intersect && intersect.geometry.type === 'LineString') {
            var center = turf.center(intersect);
            var centerBuffer = turfCircle(center, 0.1, 5, 'meters');
            var tempIntersect = turf.intersect(centerBuffer, natural);
            if (!tempIntersect) {
                overlap.push(['case2', natural['properties']['id'], feature['properties']['id'], naturalTagIntersection, featureTagIntersection]);          
            }
        }

    } else if ((!isClosedWay(natural.geometry.coordinates)) && isClosedWay(feature.geometry.coordinates)) {
        // only overlapped feature is closed
        // featurePoly = polygon([feature.geometry.coordinates], feature.properties);
        // intersect = turf.intersect(featurePoly, natural);
        // if (intersect && intersect.geometry.type === 'LineString') {
        //     var center = turf.center(intersect);
        //     var centerBuffer = turfCircle(center, 0.1, 5, 'meters');
        //     var tempIntersect = turf.intersect(centerBuffer, feature);
        //     if (!tempIntersect) {
        //         overlap.push(['case3', natural['properties']['id'], feature['properties']['id'], naturalTagIntersection, featureTagIntersection]);          
        //     }
        // }
    } else {
      // none of overlapping or overlapped feature is closed

    }
  return overlap;
}

function isClosedWay(nodes) {
  // Each LinearRing of a Polygon must have 4 or more Positions
  if (nodes.length > 3) {
    var firstNode = nodes[0];
    var lastNode = nodes[nodes.length - 1];
    return (firstNode[0] === lastNode[0] && firstNode[1] === lastNode[1]);
  }
  return false;
}
