'use strict';

let User = require('./models/user');
let UserSecurity = require('./models/user_security');

/* This controller generate and return a private key. */
function auth(req, res)
{
	let body = req.body;

	if(!body.username || !body.password || !body.source)
	{
		res.sendError('You need to pass a valid username, password and a valid source name');
		return;
	}

	User.getUser(body.username, body.password, function(err, user)
	{
		if(err)
		{
			uShare.logError('Error on creating an auth', err, {ip:req.ip, body});
			return;
		}

		if(!user)
		{
			res.sendError('Your credentials are not right.');
			return;
		}

		let auth = new UserSecurity();
		auth.privateKey = auth.generateNewPrivateKey();
		auth.accountKey = user._id;
		auth.ipv4 = req.ip;
		auth.source = body.source;

		auth.save(function(err)
		{
			if(err)
			{
				let date = uShare.logError('Error on saving new auth', err, {body, auth, ip:req.ip});
				res.sendError(`Internal error. Please warn us with the following key : ${date}`)
				return;
			}

			uShare.logNotice('New private key generated.', {}, {ip:req.ip, user:user._id, 
				privateKey: auth.privateKey});
			res.json({accountKey:user._id, privateKey:auth.privateKey});
			return;
		});
	});
}

module.exports = auth;