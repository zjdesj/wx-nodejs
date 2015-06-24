var http = require('https');

var getDataFromWx = function (url, callback) {
    http.get(url, function(res) {
        var arr = [];
        res.on('data', function(d) {
            arr.push(d);
        });
        res.on('end', function () {
            var data = arr.join('');
            data = JSON.parse(data);
            callback(data);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
};
module.exports.getDataFromWx = getDataFromWx;
