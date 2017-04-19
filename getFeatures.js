var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var ndjson = require('ndjson');

if (!argv.primaryTag || !argv.anotherPrimaryTag) {
    process.exit(0);
}

var primaryTag = argv.primaryTag;
var anotherPrimaryTag = argv.anotherPrimaryTag;

var output = {};
var UniqueIds = [];

fs.createReadStream('outputFeatures.json')
  .pipe(ndjson.parse())
  .on('data', function(obj) {
    obj.forEach(function(arr) {
        var keyId = JSON.stringify(arr[1]) + ',' + JSON.stringify(arr[2]);
        var reverseId = JSON.stringify(arr[2]) + ',' + JSON.stringify(arr[1]);
        if (UniqueIds.indexOf(keyId) === -1 && UniqueIds.indexOf(reverseId) === -1) {
            UniqueIds.push(keyId);
            var primaryTagCollection = Object.keys(arr[3]);
            var anotherPrimaryTagCollection = Object.keys(arr[4]);
            if ((primaryTagCollection.indexOf(primaryTag) !== -1 && anotherPrimaryTagCollection.indexOf(anotherPrimaryTag) !== -1) ||
                (anotherPrimaryTagCollection.indexOf(primaryTag) !== -1 && primaryTagCollection.indexOf(anotherPrimaryTag) !== -1)) {
                if (output[arr[1]]) {
                    output[arr[1]].push(arr[2]);
                } else {
                    output[arr[1]] = [];
                    output[arr[1]].push(arr[2]);
                }

                if (output[arr[2]]) {
                    output[arr[2]].push(arr[1]);
                } else {
                    output[arr[2]] = [];
                    output[arr[2]].push(arr[1]);
                }
            }
            // var key = JSON.stringify(arr[3]) + ',' + JSON.stringify(arr[4]);
            // var reverse = JSON.stringify(arr[4]) + ',' + JSON.stringify(arr[3]);
            // if (Object.keys(output).indexOf(key) !== -1) {
            //     output[key] += 1;
            // } else if (Object.keys(output).indexOf(reverse) !== -1) {
            //     output[reverse] += 1;
            // } else {
            //     output[key] = 1;
            // }
        }
    });
  })
  .on('end', function() {
    console.log(output);
  });