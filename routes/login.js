var users = {'tj': 123};
function loadUser(req, res, next) {            
	console.log(req.body);
	// You would fetch your user from the db            
	var user = users[req.body.username];            
	if (user) {            
		req.user = user;            
		next();            
	} else {            
		next(new Error('Failed to load user ' + user));            
	}            
}            
function andRestrictToSelf(req, res, next) {            
	var pwd = req.body.password;
	if (pwd === 'foobar') {
		next();            
	}
	else {
	    next(new Error('Unauthorized'));            
	}
}            

module.exports = {
  loadUser: loadUser,
  restrictToSelf: andRestrictToSelf
}
