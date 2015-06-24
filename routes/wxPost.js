var needle = require('needle');

var postData = function (url, data, callback) {
    needle.post(url, data, {json: true}, function(error, res) {
        if (!error && res.statusCode == 200) {
            console.log(res.body);
            callback(res.body);
        }
    });
}

module.exports.postData = postData;
