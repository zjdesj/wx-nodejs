var express = require('express');
var path = require('path');
var router = express.Router();

var login = require(path.join(__dirname, '/login'));

console.log(login);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MaiBaiCai' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'MBC', msg: 'MaiBaiCai Login' });
});
router.post('/login-check', login.loadUser, login.restrictToSelf, function(req, res){            
  res.send('Editing user ' + req.body.username);            
});
module.exports = router;
