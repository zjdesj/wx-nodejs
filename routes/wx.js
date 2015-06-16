var http = require('https');
var crypto = require('crypto');
var path = require('path');
// 从外部加载app的配置信息
var appInfo = require(path.join(__dirname, '/appInfo'));

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
    console.log('拼起来的字符串' + arr.join(''));
    shasum.update(arr.join(''));

    return shasum.digest('hex');
};

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

var cachedObj = function () {
}
/**
 * 获取access_token
 */
var getAccessToken = function (callback) {
    if (typeof cachedObj['access_token'] === 'undefined') {
        cachedObj['access_token'] = {
        };
        cachedObj['access_token'][appInfo.appId] = {};
    }
    var cached = cachedObj['access_token'][appInfo.appId];
    if (cached && (cached.timestamp + 7200 * 1000 - 100 * 1000 > new Date().getTime())) {
        console.log('缓存的token');
        callback(cached.accessToken);
        return cacked.accessToken;
    }
    console.log('新获取token');
    var url = ['https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=', 
        appInfo.appId, 
        '&secret=',  
        appInfo.appsecret].join('');

    http.get(url, function(res) {
        var arr = [];
        res.on('data', function(d) {
            arr.push(d);
        });
        res.on('end', function () {
            var data = arr.join('');
            data = JSON.parse(data);
            if (!data.access_token) {
                cached = {};
                callback(cachedAccessToken[appInfo.appId].accessToken);
                return;
            }
            cached = {
                accessToken: data.access_token,
                timestamp: new Date().getTime()
            };
            callback(data.accessToken);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
};

var getSomeTypeTicket = function (type) {
    if (typeof cachedObj[type] === 'undefined') {
        cachedObj[type] = {};
    }

    var cached = cachedObj[type];
    return function (callback) {
        if (cached[appInfo.appId] && (cached[appInfo.appId].timestamp + 7200 * 1000 - 100 * 1000 > new Date().getTime())) {
            console.log('缓存的' + type + ' ticket');
            callback(cached[appInfo.appId].ticket);
            return ;
        }
        console.log('新获取' + type + 'ticket');
        getAccessToken(function (accessToken) {
            var url = [
                'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=',
                accessToken,
                '&type=',
                type
            ].join('');

            http.get(url, function(res) {
                var arr = [];
                res.on('data', function(d) {
                    arr.push(d);
                });
                res.on('end', function () {
                    var data = arr.join('');
                    data = JSON.parse(data);
                    if (!data.error_code) {
                        cached[appInfo.appId] = {
                            ticket: data.ticket,
                            timestamp: new Date().getTime()
                        };
                        callback(cached[appInfo.appId].ticket);
                        return data.ticket;
                    }
                    cachedTicket[appInfo.appId] = {};
                    callback(cached[appInfo.appId].ticket);
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        });
    }
};


/*
var getTicket = getSomeTypeTicket('jsapi');
var getCardTicket = getSomeTypeTicket('wx_card');

 * 生成用于js签名及原料对象
var createJsSignature = function (url, callback) {
    getTicket(function (ticket) {
        console.log('获取的js ticket:' + ticket);
        console.log('获取js ticket时url传入的参数url：' + url);
        if (!ticket) {
            callback({});
            return;
        }
        var ts = createTimeStamp();
        var ns = createNonceStr();
        var appId = appInfo.appId;
        
        callback({
            timestamp: ts,
            signature: calculateJsSignature(ns, ts, ticket, url),
            appid: appId,
            nonce: ns,
        })
    });
};
*/

/**
 * 生成用于创造签名的函数
 */
var createTicketSignature = function (type, url, callback) {
    var getTicket = getSomeTypeTicket(type);
    var map = {
        'jsapi': '基本js ticket',
        'wx_card': '微信卡券ticket'
    };
    var text = map[type];
    getTicket(function (ticket) {
        console.log('获取的' + text + ':' + ticket);
        var ts = createTimeStamp();
        var ns = createNonceStr();
        var appId = appInfo.appId;
        
        console.log('获取的js微信卡券ticket时url传入的参数url：' + url);
        callback({
            timestamp: ts,
            signature: calculateJsSignature(ns, ts, ticket, url),
            appid: appId,
            nonce: ns,
        })
    });
};

module.exports.createSignature = createSignature;
module.exports.checkSignature = checkSignature;
module.exports.createJsSignature = createJsSignature;
