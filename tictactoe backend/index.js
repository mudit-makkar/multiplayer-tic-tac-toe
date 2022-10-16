const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const mongo = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


//models
const users = require("./Models/User");
const invitations = require("./Models/Invitation");
const games = require("./Models/Game");


//routes
const user_routes = require("./routes/user_routes");
const game_routes = require("./routes/game_routes");
const invite_routes = require("./routes/invite_routes");

//initializations
const app = express();
const port = 3001;
const jwt_secret = "my_secret";

//connection with database
//var url = "mongodb+srv://mudit:mudit%40123@cluster0.vfut5.mongodb.net/tic-tac-toe?retryWrites=true&w=majority";
var url = "mongodb://localhost:27017/tictactoe";
mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
	console.log("connection successful");
}).catch((err) => {
	console.log(err);
})

//middlewares
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true })); 
app.use(express.static("public")); 
app.use(express.json());
app.use(function (req, res, next) {
	console.log(req.path);
	next();
})

//middlwares for routes
app.use(user_routes);
app.use(game_routes);
app.use(invite_routes);


const server = app.listen(port, () => {
	console.log("App listening at " + port);
})


//socket
const io = socketIo(server, { cors: { origin: "*" } });


io.on("connection", (socket) => {
	console.log("new client connected", socket.id);


	socket.on("create_room", (game_id, cb) => {
		let room_name = "room" + game_id;
		socket.join(room_name);
		socket.gamePlayer = true;
		cb({ "joined": true, "room": room_name });
	})

	socket.on("canJoinRoom", (game_id, cb) => {
		let room_name = "room" + game_id;
		let room = socket.adapter.rooms.get(room_name);
		if (room) {
			let number_of_users = room.size;
			if (number_of_users == 1) {
				games.findOne({ _id: game_id }, function (error, result) {
					if (result && result.Winner == null) {
						cb({ "can_join": true, "room": room_name });
					}
					else {
						cb({ "can_join": false });
					}
				})
			}
			else {
				cb({ "can_join": false });
			}
		}
		else {
			cb({ "can_join": false });
		}
	})

	socket.on("joinRoom", (room, cb) => {
		socket.join(room);
		socket.gamePlayer = true;
		cb();
		socket.to(room).emit("confirm_join", { "joined": true })
	})

	socket.on("joinChat", (game_id, cb) => {
		games.findOne({ _id: game_id }, function (error, result) {
			if (result && result.Winner == null) {
				let room = "room" + game_id;
				socket.gamePlayer = false;
				socket.join(room);
				cb({ "joined": true, "room": room });
			}
			else {
				cb({ "joined": false });
			}
		})
	})


	socket.on("getPlayersInfo", (room, cb) => {
		let game_id = room.slice(4);
		games.find({ _id: game_id }).populate("Player1", "username").populate("Player2", "username").exec(function (error, result) {
			if (error == null) {
				cb(result);
			}
		});
	})

	socket.on("clicked", (squares, room) => {
		socket.to(room).emit("recieve_click", squares);
	})

	socket.on("startNextRound", (roundNo, room) => {
		io.to(room).emit("startNextRound", roundNo + 1);
	})

	socket.on("setGameWinner", (symbol, room) => {
		socket.to(room).emit("setGameWinner", symbol);
	})

	socket.on("leave_room", (room) => {
		socket.leave(room);
	})

	socket.on("sendMessage", (message, room, cb) => {
		socket.to(room).emit("receiveMessage", message);
		cb(true);
	})

	socket.on("disconnecting", () => {
		console.log("disconnecting");
		if (socket.gamePlayer == true)                        //means the person leaving is the spectator not a game player
		{
			let rooms = Array.from(socket.rooms.keys());
			let [roomName] = rooms.filter((element) => {
				return element.startsWith("room");
			});

			if (roomName) {
				let game_id = roomName.slice(4)
				//checking whether the user was on the wait page or in the game when he got disconnected
				games.findOne({ _id: game_id }, function (error, result) {
					if (error) {
						console.log(error);
					}
					else {
						if (result.Player2 == null)           //means user was on the wait page
						{
							//recrediting the creator wallet
							users.updateOne({ _id: result.Player1 }, { $inc: { walletAmount: result.BetAmount } }).exec(function (error) {
								if (error == null) {
									deleteGameAndInvitations(game_id);
								}
							})
						}
						else {
							console.log("user left the game..")
							socket.to(roomName).emit("user_left");
						}
					}
				})
			}
		}
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	})
});

function deleteGameAndInvitations(game_id) {
	games.deleteOne({ _id: game_id }, function () {
		invitations.deleteMany({ Game: game_id }, function (error) {
			if (error == null) {
				console.log("successfully deleted");
			}
			else {
				console.log(error);
			}
		})
	})
}


