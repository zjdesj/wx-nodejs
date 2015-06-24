var path = require('path');
var postData = require(path.join(__dirname, '/wxPost')).postData;
var wxTicket = require(path.join(__dirname, '/wxTicket'));
/**
 * set test whitelist with wechat username (用微信号来设置测试白名单)
 * @param {Array}   usernames [username list 微信号列表]
 * @param {Function} callback(error)
 */
exports.setWhiteListWithUsername = function(usernames, callback) {
    if(!usernames instanceof Array || typeof callback !== "function") {
        return callback(error.MISSING_PARAMS());
    }
    var data = {
        username: usernames
    }
    wxTicket.getAccessToken(function (access_token) {
        postData('https://api.weixin.qq.com/card/testwhitelist/set?access_token=' + access_token, data, function (msg) {
            callback(msg);
        });
    });
};
