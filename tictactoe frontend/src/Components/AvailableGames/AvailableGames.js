import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { socketProvider } from "../../App";
import styles from "./style.module.css";
import { serverURL } from "../../serverUrl";
import { joinGame } from "../../joinGame";
import Wallet from "../Wallet/Wallet";

export default function Games({ setRoomJoined, setBothPlayersJoinedRoom, setMyTurn, setMyVar, setGameSpectator }) {
    const socket = useContext(socketProvider);
    const history = useHistory();

    const [games, setGames] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(function () {
        fetch(serverURL + "/availableGames", { credentials: "include", method: "GET" })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => {
                setGames(data.available_games);
            })
            .catch((error) => {
                console.log(error)
            })
    }, []);


    function handleJoinButtonClick(game_id, betAmount) {
        joinGame(game_id, betAmount, socket,(response) => {
            console.log(response);
            if (response.can_join == true) {
                if (response.error != null) {
                    setMessage(response.error);
                }
                else {
                    socket.emit("joinRoom", response.room, () => {
                        setRoomJoined(response.room);
                        setBothPlayersJoinedRoom(true);
                        setMyVar("O");
                        history.push("/game");
                    })
                }
            }
            else {
                setMessage("This game might not be available. Please refresh your page.");
            }
        })
    }

    function joinChat(game_id) {
        socket.emit("joinChat", game_id, (response) => {
            if (response.joined == true) {
                setGameSpectator(true);
                setRoomJoined(response.room);
                history.push("/game");
            }
            else {
                setMessage("This game might not be available. Please refresh your page.");
            }
        })
    }


    let jsx = (games.length != 0) ? games.map(function (game) {
        return (
            <>
                <div className={styles.avail_game}>
                    <h3 className={styles.heading}>Tic Tac Toe</h3>

                    <div style={{ float: "right", padding: "10px" }}>
                        {
                            game.Player2 == null ?
                                <button className="btn btn-success" onClick={() => handleJoinButtonClick(game._id, game.BetAmount)}>
                                    Join Game
                                </button> :
                                <button className="btn btn-success" onClick={() => joinChat(game._id)}>
                                    Join Chat
                                </button>
                        }
                    </div>

                    <p>Created By - {game.Player1.username}</p>
                    <p>Number of rounds - {game.NumberOfRounds}</p>
                    <p style={{fontWeight:"bold"}}>Bet - {game.BetAmount}</p>
                </div>
            </>
        )
    }) : <p className="alert alert-success" style={{ width: "70%", margin: "auto", fontSize: "large" }}>No games available</p>;

    return (
        <>
            <br />
            {
                message != "" ?
                    <p className="alert alert-danger" style={{ width: "70%", margin: "auto", fontSize: "large" }}>
                        {message}
                    </p> :
                    ""
            }
            <Wallet />
            {jsx}
        </>
    );
}
