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
var getAccessToken = function (callback, code) {
    var type = code ? 'code' : '';
    if (typeof cachedObj['access_token'] === 'undefined') {
        cachedObj['access_token' + type] = {
        };
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
                callback(cached.accessToken);
                return;
            }
            if (code) {
                cached = data;
                callback(data);
                return;
            }
            cached = {
                accessToken: data.access_token,
                timestamp: new Date().getTime()
            };
            callback(data.access_token);
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

/**
 * 生成用于创造签名的函数
 */
var createTicketSignature = function (type) {
    var getTicket = getSomeTypeTicket(type);
    var map = {
        'jsapi': '基本js ticket',
        'wx_card': '微信卡券ticket'
    };
    var text ='获取的' + map[type];
    return function (url, callback) {
        getTicket(function (ticket) {
            console.log(text + ':' + ticket);
            var ts = createTimeStamp();
            var ns = createNonceStr();
            var appId = appInfo.appId;
            
            console.log('获取' + text + '时传入的参数url：' + url);
            callback({
                timestamp: ts,
                signature: calculateJsSignature(ns, ts, ticket, url),
                appid: appId,
                nonce: ns
            });
        });
    }
};

/*
 * 用于生成从入口地址获取code的函数;
 * type 默认snsapi_base
 *      snsapi_base  
 *      snsapi_userinfo
 */
var middle = function (type) {
    if (!type) {
        type = "snsapi_base"
    }
    /*
     * url 要跳转的地址
     * state 跳转地址状态 用于处理逻辑
     */
    return function (url, state) {
        var urlArr = [
            'https://open.weixin.qq.com/connect/oauth2/authorize?appid=',
            appInfo.appId,
            '&redirect_uri=',
            encodeURIComponent(url),
            '&response_type=code&scope=',
            type,
            '&state=',
            state,
            '#wechat_redirect'
        ];
        var turl = urlArr.join('');
        return turl;
    };
};

/*
 * 从code获取access_token 还有用户的openid 相关信息。
 */
var getOpenId = function (code, callback) {
    /*
     * data 格式
     * {
     *    "access_token":"ACCESS_TOKEN",
     *    "expires_in":7200,
     *    "refresh_token":"REFRESH_TOKEN",
     *    "openid":"OPENID",
     *    "scope":"SCOPE"
     * }
     */
    getAccessToken(function (data, code) {
        console.log('获取的openid数据' + JSON.stringify(data));
        callback(data, code);
    }, code);
};

var getBaseUserInfo = function (code, callback, lang) {
    lang = lang || 'zh_CN'
    getOpenId(code, function (data) {
        getAccessToken(function (access_token) {
            var url = [
                'https://api.weixin.qq.com/cgi-bin/user/info?access_token=',
                access_token,
                '&openid=',
                data.openid,
                '&lang=',
                lang
            ].join('');
            console.log('使用通用access_token获取用户信息的url：' + url);
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
        });
    });
};

/*
 * 使用scope为snsapi_userinfo 获取的用户信息。
 */
var getScopeUserInfo = function (code, callback, lang) {
    var lang = lang || 'zh_CN';
    getOpenId(code, function (data, code) {
        var url = [
            'https://api.weixin.qq.com/sns/userinfo?access_token=',
            data.access_token,
            '&openid=',
            data.openid,
            '&lang',
            lang
        ].join('');
        console.log('获取scope为userinfo用户信息的url：' + url);
        
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
    });
};

/*
 * todo
 * 增加一个map 10分钟清空，短时间内多次获取用户信息时候相当于多了一层缓存。
 *
 */
var CODEMAPINFO = {};
/*
 * 两种使用方法：1、传入使用基础access_token获取的用户信息
 *  2、直接传入code
 *
 */
var isSubscribe = function (data) {
    if (data && data.subscribe) {
        return data.subscribe;
    }
    getBaseUserInfo(data, function (msg) {
        return msg.subscribe;
    });    
};

module.exports.createSignature = createSignature;
module.exports.checkSignature = checkSignature;
module.exports.createJsSignature = createTicketSignature('jsapi');
module.exports.createCardSignature = createTicketSignature('wx_card');
module.exports.getOpenId = getOpenId;
module.exports.relayBase = middle();
module.exports.relayUserInfo = middle(true);
module.exports.getUserInfo = getBaseUserInfo;
module.exports.getScopeUserInfo = getScopeUserInfo;
