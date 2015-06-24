/*
 * 用于判断是否是微信环境以及是否支持微信卡券api
 */
module.exports.getWxEnv = function (req) {
    var WXREG = /MicroMessenger\/([\d\.]*)[\s]?$/;
    var matchArr = (function (req) {
        var ua = req.headers['user-agent'];
        console.log('访问' + req.originalUrl + '的user-agent: ' + ua);
        return ua.match(WXREG);
    }(req));
    var isWx = true;
    var wxVer = '';
    var hasCardApi = false;
    if (!matchArr) {
        isWx = false;
    } else {
        wxVer = matchArr[1];
        console.log('match到的wx版本字段:' + wxVer);
        
        var wxVerNumber = wxVer.split('.').slice(0, 3).join('');

        if (wxVerNumber >= 602) {
            hasCardApi = true;
        }
    }

    return {
        isWx: isWx,
        wxVer: wxVer,
        hasCardApi: hasCardApi
    };
};
