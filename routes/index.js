var express = require('express');
var path = require('path');
var router = express.Router();
var crypto = require('crypto');

var login = require(path.join(__dirname, '/login'));
var wx = require(path.join(__dirname, '/wx'));
var resUtil = require(path.join(__dirname, '/resUtil'));

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

// 微信平台服务器自动校验接口
/*
router.get('/wx', function(req, res, next) {
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
*/
router.get('/wx', function(req, res, next) {
    var params = req.query;
    var echostr = params.echostr;
    if (wx.checkSignature(params)) {
        res.send(echostr);
    } else {
        console.log('not weixin server!');
        res.send('not weixin server~');
    }
});
router.get('/signature', function (req, res) {
    console.log('url:' + req.query.url);
    wx.createJsSignature(req.query.url, function (signatureObj) {
        console.log(signatureObj);
        resUtil.responseCrossDomain(res);
        resUtil.responseWithJson(res, signatureObj);
    });
});
router.get('/wxpage/index.html', function(req, res, next) {
  res.render('wxindex', { title: 'test' });
});
/* 
 * copy from get
 * tobo verify
 */
router.post('/wx', function(req, res, next) {
    var params = req.query;
    var echostr = params.echostr;
    if (wx.checkSignature(params)) {
        res.send(echostr);
    } else {
        console.log('not weixin server!');
        res.send('not weixin server~');
    }
});
module.exports = router;
