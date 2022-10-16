const express=require('express');
const jwt=require('jsonwebtoken');

const router=express.Router();
const users = require("../Models/User");
const games = require("../Models/Game");
const invitations = require("../Models/Invitation");

const jwt_secret="my_secret";

router.post("/inviteFriend", (req, res) => {
	let token = req.cookies.token;
	let username = req.body.username;
	let game_id = req.body.game_id;

	jwt.verify(token, jwt_secret, {}, function (err1, token) {
		if (err1) {
			console.log(err1);
			res.json({ "message": "Something went wrong.." });
		}
		else {
			users.findOne({ username: username }, function (err2, result) {
				if (err2) {
					console.log(err2);
					res.json({ "message": "Something went wrong.." });
				}
				else {
					if (result) {
						if (result._id != token.id) {
							let obj = { From: token.id, To: result._id, Game: game_id };
							invitations.findOne(obj, function (err3, data) {
								if (data) {
									res.json({ "message": "Invitation already sent.." });
								}
								else {
									let invite = new invitations(obj);
									invite.save(function (err4) {
										if (err4 == null) {
											res.json({ "message": "Invitation sent successfully" });
										}
										else {
											res.json({ "message": "Something went wrong.." });
										}
									});
								}
							});
						}
						else {
							res.json({ "message": "" });
						}
					}
					else {
						res.json({ "message": "User not found" });
					}

				}
			});
		}
	});
});

router.get("/invitations", (request, response) => {
	let token = request.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error) {
			response.json({ "error": "Something went wrong" });
		}
		else {
			invitations.find({ To: token.id }).populate("From", "username").populate("Game").sort({ _id: -1 }).exec(function (error, result) {
				if (error) {
					response.json({ "error": "Something went wrong" });
				}
				else {
					response.json({ "invites": result, "error": null });
				}
			});
		}
	});
})

module.exports=router;