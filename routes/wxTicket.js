// 从外部加载app的配置信息
var path = require('path');
var appInfo = require(path.join(__dirname, '/appInfo'));
var wxSign = require(path.join(__dirname, '/wxSign'));
var getDataFromWx = require(path.join(__dirname, '/wxGet')).getDataFromWx;
var calculateJsSignature  = require(path.join(__dirname, '/wxSign')).calculateJsSignature;
var calculateCardSignature  = require(path.join(__dirname, '/wxSign')).calculateCardSignature;

var cachedObj = function () {
}
/**
 * 获取access_token
 *
 * code 传入code 获取有scope 的高级accessToken
 */
var getAccessToken = function (callback, code) {
    var type = code ? 'code' : '';
    if (typeof (cachedObj['access_token' + type]) === 'undefined') {
        cachedObj['access_token' + type] = {};
        cachedObj['access_token' + type][appInfo.appId] = {};
    }
    var cached = cachedObj['access_token' + type][appInfo.appId];
    if (cached && (cached.timestamp + 7200 * 1000 - 100 * 1000 > new Date().getTime())) {
        console.log('缓存的token');
        if (code) {
            callback(cached);
            return cached;
        }
        callback(cached.accessToken);
        return cached.accessToken;
    }
    var url;
    if (!type) {
        url = ['https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=', 
        appInfo.appId, 
        '&secret=',  
        appInfo.appsecret].join('');
    } else {
        url = ['https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=', 
        appInfo.appId, 
        '&secret=',  
        appInfo.appsecret,
        '&code=',
        code].join('');
    }

    getDataFromWx(url, function (data) {
        if (!data.access_token) {
            cachedObj['access_token' + type][appInfo.appId] = {};
            callback(cached.accessToken);
            return;
        }
        if (code) {
            cachedObj['access_token' + type][appInfo.appId] = data;
            callback(data);
            return;
        }
        cachedObj['access_token' + type][appInfo.appId] = {
            accessToken: data.access_token,
            timestamp: new Date().getTime()
        };
        callback(data.access_token);
    });
};

/*
 * 获取各种类型的ticket
 * jsapi
 * wx_card
 */
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

            getDataFromWx(url, function (data) {
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
        });
    }
};

/**
 * 生成用于创造签名的函数
 */
var createJsTicketSignature = function () {
    var getTicket = getSomeTypeTicket('jsapi');
    var text ='获取的基本js ticket';
    return function (url, callback) {
        getTicket(function (ticket) {
            console.log(text + ':' + ticket);
            var ts = wxSign.createTimeStamp();
            var ns = wxSign.createNonceStr();
            var appId = appInfo.appId;
            
            console.log('获取基本js ticket时传入的参数url：' + url);
            callback({
                timestamp: ts,
                signature: calculateJsSignature(ns, ts, ticket, url),
                appid: appId,
                nonce: ns
            });
        });
    };
};


var createCardTicketSignature = function () {
    var getTicket = getSomeTypeTicket('wx_card');
    var text ='获取的微信卡券ticket';
    return function (url, callback) {
        getTicket(function (ticket) {
            console.log(text + ':' + ticket);
            var ts = wxSign.createTimeStamp();
            var ns = wxSign.createNonceStr();
            var appId = appInfo.appId;
            var obj = {
                timestamp: ts,
                api_ticket: ticket,
                card_id: 'pPeU8uHMB-ibFXmBjloSrKE8CDqQ'
            };
            
            callback({
                timestamp: ts,
                signature: calculateCardSignature(obj),
            });
        });
    }
}

module.exports.getAccessToken = getAccessToken;
module.exports.getJsApiTicket = getSomeTypeTicket('jsapi');
module.exports.getWxCardTicket = getSomeTypeTicket('wx_card');
module.exports.createJsSignature = createJsTicketSignature();
module.exports.createCardSignature = createCardTicketSignature();
