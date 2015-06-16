var express = require('express');
var path = require('path');
var router = express.Router();
var crypto = require('crypto');

var wx = require(path.join(__dirname, '/wx'));
var resUtil = require(path.join(__dirname, '/resUtil'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'just for test' });
});
/* 返回服务器时间 */
router.get('/getTime', function(req, res, next) {
  //设置跨域访问
  res.header("Access-Control-Allow-Origin",  "*"); 
  res.json({code: 0, time: new Date().getTime()});
});

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
    console.log('获取js api 签名；url:' + req.query.url);
    wx.createJsSignature(req.query.url, function (signatureObj) {
        console.log(signatureObj);
        resUtil.responseCrossDomain(res);
        resUtil.responseWithJson(res, signatureObj);
    });
});
router.get('/card-signature', function (req, res) {
    console.log('获取微信卡券签名;url:' + req.query.url);
    wx.createCardSignature(req.query.url, function (signatureObj) {
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
