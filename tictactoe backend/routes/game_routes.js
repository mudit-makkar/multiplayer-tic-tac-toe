const express=require('express');
const mongo=require('mongodb');
const jwt=require('jsonwebtoken');

const router=express.Router();
const users = require("../Models/User");
const games = require("../Models/Game");
const jwt_secret="my_secret";

router.get("/availableGames", function (req, res) {
	let token = req.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error == null) {
			games.find({ Winner: null, Mode: "Public", Player1: { $ne: mongo.ObjectId(token.id) } }).populate('Player1').exec(function (error, result) {
				if (error == null) {
					res.json({ "available_games": result, "error": null });
				}
				else {
					console.log(error);
					res.json({ "error": error })
				}
			})
		}
		else {
			console.log(error);
		}
	})
})

router.post("/createGame", function (req, res) {
	let body = req.body;
	let token = req.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error) {
			console.log(error);
			res.json({ "error": "Something went wrong" });
		}
		else {
			users.findOne({ _id: token.id }, function (error, result) {
				if (error == null) {
					if (result.walletAmount < body.BetAmount) {
						res.json({ "error": "Not enough money" })
					}
					else {
						let remainingAmount = result.walletAmount - body.BetAmount;
						users.updateOne({ _id: token.id }, { walletAmount: remainingAmount }).exec(function (error) {
							if (error == null) {
								let game = new games({ Player1: token.id, ...body });
								game.save(function (error, result) {
									if (error == null) {
										res.json({ "error": null,"result":result});
									}
									else
									{
										console.log(error);
										res.json({"error":"Something went wrong"});
									}
								});
							}
						})
					}
				}
				else {
					res.json({ "error": "Something went wrong" });
				}
			})
		}
	})
})

router.post("/joinGame", function (req, res) {
	let token = req.cookies.token;
	let game_id = req.body.game_id;
	let betAmount = req.body.betAmount;

	jwt.verify(token, jwt_secret, {}, function (error, token) {
		if (error) {
			console.log(error);
			res.json({ "error": "Something went wrong" });
		}
		else {
			users.findOne({ _id: token.id }, function (error, user) {
				if (error == null) {
					if (user.walletAmount < betAmount)
						res.json({ "error": "Not enough money" });
					else {
						games.updateOne({ _id: game_id }, { Player2: token.id }, function (error) {
							if (error == null) {
								let remainingAmount = user.walletAmount - betAmount;
								users.updateOne({ _id: token.id }, { walletAmount: remainingAmount }).exec(function (error) {
									if (error == null) {
										res.json({ "error": null });
									}
									else {
										res.json({ "error": "Something went wrong" });
									}
								});
							}
							else {
								console.log(error);
								res.json({ "error": "Something went wrong" });
							}
						})
					}
				}
				else {
					res.json({ "error": "Something went wrong" });
				}
			})
		}
	})
})


function updateUserWallet(user_id,amount,cb)
{
	users.updateOne({ _id: user_id }, { $inc: { walletAmount: amount }}).exec(function (error,res) {
		if (error == null) {
			console.log(res);
			cb({"updated":true});
		}
		else {
			console.log(error);
			cb({"updated":false});
		}
	});
}
router.post("/saveGame", function (req, res) {
	let game_id = req.body.game_id;
	let winner = req.body.game_winner;
	let rounds = req.body.rounds;
	
	games.findOneAndUpdate({ _id: game_id }, { Rounds: rounds, Winner: winner }, function (error, updatedGame) {
		if (error != null) {
			console.log(error);
			res.json({ "error": error });
		}
		else {
			if(winner=="None")
			{
				let amount=updatedGame.BetAmount;
				users.updateMany({_id:{$in:[updatedGame.Player1,updatedGame.Player2]}},{ $inc:{walletAmount: amount}}).exec(function(error)
				{
					if(error==null){
						res.json({"error":null});
					}
					else{
						res.json({"error":"Something went wrong"});
					}
				})
			}
			else
			{
				let user_id=(winner=="X")?updatedGame.Player1:updatedGame.Player2;
				let amount=updatedGame.BetAmount*2;

				updateUserWallet(user_id,amount,(result)=>{
					if(result.updated==true){
						res.json({"error":null});
					}
					else{
						res.json({"error":"Something went wrong"});
					}
				});
			}
		}
	});
});

router.get("/gameHistory", function (req, res) {
	let token = req.cookies.token;
	jwt.verify(token, jwt_secret, {}, function (error, token) {
		games.find({ $or: [{ Player1: token.id }, { Player2: token.id }], $and: [{ winner: { $ne: null } }] }).populate("Player1", "username").populate("Player2", "username").sort({ _id: -1 }).exec(function (error, result) {
			if (error) {
				console.log(error);
				res.json({ "error": error });
			}
			else {
				res.json({ "error": null, "result": result, "loggedInId": token.id });
			}
		})
	});
})

module.exports=router;