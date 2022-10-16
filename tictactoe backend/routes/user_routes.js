const express=require('express');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');

const router=express.Router();
const users = require("../Models/User");
const jwt_secret="my_secret";

function getHashedString(data)
{
	const hash=crypto.createHash("sha256");
	const hashed_string=hash.update(data).digest("hex");
	return hashed_string;
}

router.post('/signup', function (req, res) {
	let body = req.body;
	users.find({ $or: [{ username: body.username }, { email: body.email }] }, function (error, result) {
		if (result.length == 0) {
			body.password=getHashedString(body.password);
			let new_user = new users(body);
			new_user.save(function (err) {
				if (err) {
					console.log(err);
					res.json({ "error": "Something went wrong..Try again later" });           //internal server error
				}
				else {
					res.json({ "result": "Successfully Registered", "error": null }); //user saved successfully
				}
			})
		}
		else {
			res.json({ "error": "User already exist" });
		}
	});
});

router.post('/login', function (req, res) {
	let body = req.body;
	users.find({ username: body.username }, function (error, result) {
		if (result.length == 0) {
			res.json({ "error": "User does not exist" });
		}
		else {
			body.password=getHashedString(body.password);
			if (result[0].password == body.password) {
				jwt.sign({ username: body.username, password: body.password, id: result[0]._id }, jwt_secret, {}, function (err, token) {
					res.cookie("token", token);
					res.cookie("user", body.username);
					res.json({ "error": null });
				});
			}
			else {
				res.json({ "error": "Incorrect Password" });  //bad request //invalid password
			}
		}
	})
});

router.get("/verifyUser", function (req, res) {
	let token = req.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error) {
			console.log(error);
			res.json({ "user_verified": false });
		}
		else {
			res.json({ "user_verified": true });
		}
	})
})

router.get("/wallet", (request, response) => {
	let token = request.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error) {
			response.json({ "error": "Something went wrong" });
		}
		else {
			users.findOne({ _id: token.id }).select("walletAmount").exec(function (error, result) {
				if (error == null) {
					response.json(result);
				}
				else {
					console.log(error);
				}
			})
		}
	});
})

module.exports=router;