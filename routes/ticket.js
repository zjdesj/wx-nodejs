var express = require('express');
var path = require('path');
var router = express.Router();
var crypto = require('crypto');

var login = require(path.join(__dirname, '/login'));
var wx = require(path.join(__dirname, '/wx'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MaiBaiCai' });
});
/* 返回服务器时间 */
router.get('/getTime', function(req, res, next) {
  //设置跨域访问
  res.header("Access-Control-Allow-Origin",  "*"); 
  res.json({code: 0, time: new Date().getTime()});
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'MBC', msg: 'MaiBaiCai Login' });
});
router.post('/login-check', login.loadUser, login.restrictToSelf, function(req, res){            
  res.send('Editing user ' + req.body.username);            
});
router.get('/wx', function(req, res, next) {
    console.log(req.query);
    var params = req.query;
    var signature = params.signature;
    var timestamp = params.timestamp;
    var nonce = params.nonce;
    var echostr = params.echostr;
    
    var tmpArr= ['zjdesj', timestamp, nonce];
    tmpArr.sort();
    var tmpStr = tmpArr.join('');
    var shaSum = crypto.createHash('sha1');
    shaSum.update(tmpStr);
    var shaResult = shaSum.digest('hex');
    if (shaResult === signature) {
        res.send(echostr);
    } else {
        console.log('not weixin server!');
        res.send('not weixin server~');
    }
});
router.get('/signature', funtction (req, res) {
    var responseWithJson = function (res, data) {
        // 允许跨域异步获取
        res.set({
            "Access-Control-Allow-Origin": "*"
            ,"Access-Control-Allow-Methods": "POST,GET"
            ,"Access-Control-Allow-Credentials": "true"
        });
        res.json(data);
    };

    // 随机字符串产生函数
    var createNonceStr = function() {
        return Math.random().toString(36).substr(2, 15);
    };

    // 时间戳产生函数
    var createTimeStamp = function () {
        return parseInt(new Date().getTime() / 1000) + '';
    };

    var errorRender = function (res, info, data) {
        if(data){
            console.log(data);
            console.log('---------');
        }
        res.set({
            "Access-Control-Allow-Origin": "*"
            ,"Access-Control-Allow-Methods": "POST,GET"
            ,"Access-Control-Allow-Credentials": "true"
        });
        responseWithJson(res, {errmsg: 'error', message: info, data: data});
    };

    // 2小时后过期，需要重新获取数据后计算签名
    var expireTime = 7200 - 100;

    var appIds = require('./apps-info'); // 从外部加载app的配置信息

    /**
        缓存在服务器的每个URL对应的数字签名对象
        {
            'http://game.4gshu.com/': {
                appid: 'wxa0f06601f194xxxx'
                ,secret: '097fd14bac218d0fb016d02f525dxxxx'
                ,timestamp: '1421135250'
                ,noncestr: 'ihj9ezfxf26jq0k'
            }
        }
    */
    var cachedSignatures = {};

    // 计算签名
    var calcSignature = function (ticket, noncestr, ts, url) {
        var timestamp = ts;
        var nonce = noncestr;
        
        var tmpArr= ['zjdesj', timestamp, nonce];
        tmpArr.sort();
        var tmpStr = tmpArr.join('');
        var shaSum = crypto.createHash('sha1');
        shaSum.update(tmpStr);
        var shaResult = shaSum.digest('hex');

        return shaResult;
    }

    // 获取微信签名所需的ticket
    var getTicket = function (url, index, res, accessData) {
        var serverUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ accessData.access_token +'&type=jsapi';
        https.get(serverUrl, function(data){
            var str = '';
            var  resp;
            _res.on('data', function(data){
                str += data;
            });
            _res.on('end', function(){
                console.log('return ticket:  ' + str);
                try{
                    resp = JSON.parse(str);
                }catch(e){
                    return errorRender(res, '解析远程JSON数据错误', str);
                }
                
                var appid = appIds[index].appid;
                var ts = createTimeStamp();
                var nonceStr = createNonceStr();
                var ticket = resp.ticket;
                var signature = calcSignature(ticket, nonceStr, ts, url);

                cachedSignatures[url] = {
                    nonceStr: nonceStr
                    ,appid: appid
                    ,timestamp: ts
                    ,signature: signature
                    ,url: url
                };
                
                responseWithJson(res, {
                    nonceStr: nonceStr
                    ,timestamp: ts
                    ,appid: appid
                    ,signature: signature
                    ,url: url
                });
            });
        });
    };

    // 服务根目录默认输出页
    app.get('/', function(req, res) {
        res.render('index');
    });

    // 通过请求中带的index值来判断是公司运营的哪个公众平台
    app.post('/rsx/:index', function(req, res) {
        var index = req.params.index;
        var _url = req.body.url;
        var signatureObj = cachedSignatures[_url];

        if(!_url){
            return errorRender(res, '缺少url参数');
        }
        
        // 如果缓存中已存在签名，则直接返回签名
        if(signatureObj && signatureObj.timestamp){
            var t = createTimeStamp() - signatureObj.timestamp;
            console.log(signatureObj.url, _url);
            // 未过期，并且访问的是同一个地址
            // 判断地址是因为微信分享出去后会额外添加一些参数，地址就变了不符合签名规则，需重新生成签名
            if(t < expireTime && signatureObj.url == _url){
                console.log('======== result from cache ========');
                return responseWithJson(res, {
                    nonceStr: signatureObj.nonceStr
                    ,timestamp: signatureObj.timestamp
                    ,appid: signatureObj.appid
                    ,signature: signatureObj.signature
                    ,url: signatureObj.url
                });
            }
            // 此处可能需要清理缓存当中已过期的数据
        }

        
        // 获取微信签名所需的access_token
        https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ appIds[index].appid +'&secret=' + appIds[index].secret, function(_res) {
            var str = '';
            _res.on('data', function(data){
                str += data;
            });
            _res.on('end', function(){
                console.log('return access_token:  ' + str);
                try{
                    var resp = JSON.parse(str);
                }catch(e){
                    return errorRender(res, '解析access_token返回的JSON数据错误', str);
                }

                getTicket(_url, index, res, resp);
            });
        })
        
    });
});
router.post('/wx', function(req, res, next) {
  console.log('post');
  console.log(req);
  res.send('post');
});
module.exports = router;
