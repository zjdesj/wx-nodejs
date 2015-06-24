/**
 * @file 用于微信服务器验证
 * @author yaowuwang
 */
var crypto = require('crypto');
var path = require('path');
// 从外部加载app的配置信息
var appInfo = require(path.join(__dirname, '/appInfo'));

/**
 * 生成随机字符串。
 */
var createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};

/**
 * 时间戳产生函数
 */
var createTimeStamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
};

/**
 * 检查签名
 */
var checkSignature = function (query) {
    var token = appInfo.token;
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
    var ts = createTimeStamp();
    var ns = createNonceStr();
    var appId = appInfo.appId;
    
    return {
        timestamp: ts,
        signature: calculateSignature(ns, ts, appId),
        appid: appId,
        nonce: ns,
    };
};

/**
 * 计算签名2用于给js使用
 */
var calculateJsSignature = function (nonce, timestamp, ticket, url) {
    var shasum = crypto.createHash('sha1');
    var arr = [
        'jsapi_ticket=', ticket,
        '&noncestr=', nonce,
        '&timestamp=', timestamp,
        '&url=', url
    ];
    //console.log('拼起来的字符串' + arr.join(''));
    shasum.update(arr.join(''));

    return shasum.digest('hex');
};
var calculateCardSignature = function (opt) {
    var shasum = crypto.createHash('sha1');
    var arr = [];
    for (var e in opt) {
        if (typeof opt[e] === 'undefined') {
            arr.push('');
        } else {
            arr.push(opt[e]);
        }
    }
    arr = arr.sort();

    shasum.update(arr.join(''));
    return shasum.digest('hex');
};

module.exports.createTimeStamp = createTimeStamp;
module.exports.createNonceStr = createNonceStr;
module.exports.checkSignature = checkSignature;
module.exports.createSignature = createSignature;
module.exports.calculateJsSignature = calculateJsSignature;
module.exports.calculateCardSignature = calculateCardSignature;
