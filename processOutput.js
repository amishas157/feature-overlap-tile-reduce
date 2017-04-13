var fs = require('fs');
var ndjson = require('ndjson')


var output = {};

fs.createReadStream('out5.text')
  .pipe(ndjson.parse())
  .on('data', function(obj) {
    obj.forEach(function(arr) {
        var key = JSON.stringify(arr[3]) + ',' + JSON.stringify(arr[4]);
        var reverse = JSON.stringify(arr[4]) + ',' + JSON.stringify(arr[3]);
        if (Object.keys(output).indexOf(key) !== -1) {
            output[key] += 1;
        } else if (Object.keys(output).indexOf(reverse) !== -1) {
            output[reverse] += 1;
        } else {
            output[key] = 1;
        }
    });
  })
  .on('end', function() {
    console.log(output);
  });
