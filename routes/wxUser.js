var path = require('path');
var appInfo = require(path.join(__dirname, '/appInfo'));
var wxTicket  = require(path.join(__dirname, '/wxTicket'));
var getDataFromWx = require(path.join(__dirname, '/wxGet')).getDataFromWx;
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
    wxTicket.getAccessToken(function (data, code) {
        console.log('获取的openid数据' + JSON.stringify(data));
        callback(data, code);
    }, code);
};

/*
 * 基础的access_token + openid 获取userinfo
 */
var getBaseUserInfo = function (code, callback, lang) {
    lang = lang || 'zh_CN'
    getOpenId(code, function (data) {
        wxTicket.getAccessToken(function (access_token) {
            var url = [
                'https://api.weixin.qq.com/cgi-bin/user/info?access_token=',
                access_token,
                '&openid=',
                data.openid,
                '&lang=',
                lang
            ].join('');
            console.log('使用通用access_token获取用户信息的url：' + url);
            getDataFromWx(url, callback);
            /*
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
            */
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
        getDataFromWx(url, callback);
        /*
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
        */
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
    getUserBaseInfo(data, function (msg) {
        return msg.subscribe;
    });    
};

module.exports.getOpenId = getOpenId;
module.exports.relayBase = middle();
module.exports.relayUserInfo = middle(true);
module.exports.getUserInfo = getBaseUserInfo;
module.exports.getScopeUserInfo = getScopeUserInfo;
