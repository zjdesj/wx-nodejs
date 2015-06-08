var crypto = require('crypto');
var path = require('path');
// 从外部加载app的配置信息
var appInfo = require(path.join(__dirname, '/appInfo'));

/**
 * 检查签名
 */
var checkSignature = function (query) {
    var token = appInfo.appid;
    var signature = query.signature;
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    return calculateSignature(nonce, timestamp, token) === signature;
};
/**
 * 计算签名
 */
var calculateSignature = function (nonce, timestamp, token) {
    var shasum = crypto.createHash('sha1');
    var arr = [token, timestamp, nonce].sort();
    shasum.update(arr.join(''));

    return shasum.digest('hex');
};

/**
 * 生成签名及原料对象
 */
var createSignature = function () {
    // 随机字符串产生函数
    var createNonceStr = function() {
        return Math.random().toString(36).substr(2, 15);
    };

    // 时间戳产生函数
    var createTimeStamp = function () {
        return parseInt(new Date().getTime() / 1000) + '';
    };

    console.log(appInfo);

    var ts = createTimeStamp();
    var ns = createNonceStr();
    var appId = appInfo.appId;
    console.log(appId);
    
    return {
        timestamp: ts,
        signature: calculateSignature(ns, ts, appId),
        appid: appId,
        nonce: ns,
    };
};

module.exports.createSignature = createSignature;
module.exports.checkSignature = checkSignature;
