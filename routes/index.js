var express = require('express');
var path = require('path');
var router = express.Router();
var crypto = require('crypto');

var login = require(path.join(__dirname, '/login'));
var wx = require(path.join(__dirname, '/wx'));
var resUtil = require(path.join(__dirname, '/resUtil'));

/* GET home page. */
router.get('node/', function(req, res, next) {
  res.render('index', { title: 'just for test' });
});
/* 返回服务器时间 */
router.get('node/getTime', function(req, res, next) {
  //设置跨域访问
  res.header("Access-Control-Allow-Origin",  "*"); 
  res.json({code: 0, time: new Date().getTime()});
});

router.get('node/wx', function(req, res, next) {
    var params = req.query;
    var echostr = params.echostr;
    if (wx.checkSignature(params)) {
        res.send(echostr);
    } else {
        console.log('not weixin server!');
        res.send('not weixin server~');
    }
});
router.get('node/signature', function (req, res) {
    console.log('url:' + req.query.url);
    wx.createJsSignature(req.query.url, function (signatureObj) {
        console.log(signatureObj);
        resUtil.responseCrossDomain(res);
        resUtil.responseWithJson(res, signatureObj);
    });
});
router.get('node/wxpage/index.html', function(req, res, next) {
  res.render('wxindex', { title: 'test' });
});
/* 
 * copy from get
 * tobo verify
 */
router.post('node/wx', function(req, res, next) {
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
