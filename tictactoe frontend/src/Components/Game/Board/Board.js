import { useContext, useEffect, useState } from "react";
import styles from "./style.module.css";
import { socketProvider } from "../../../App";
import GameInfo from "../GameInfo/GameInfo";
import GameBoard from "../GameBoard/GameBoard";
import { useHistory } from "react-router";
import { serverURL } from "../../../serverUrl";
import ChatSystem from "../../ChatSystem/ChatSystem";
import Cookies from "js-cookie";
import GameStatus from "../GameStatus/GameStatus";
import { findGameWinner } from "../../../findGameWinner";

export default function Board({ myTurn, myVar, roomJoined, gameSpectator }) {

    //initializations
    const history = useHistory();

    const [gameWinner, setGameWinner] = useState(null);
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [places_filled, setPlacesFilled] = useState(0);
    const [turn, setTurn] = useState(myTurn);
    const [my_char, setMyChar] = useState(myVar);
    const [winner, setWinner] = useState(null)
    const [currentRound, setCurrentRound] = useState(1);
    const [gameInfo, setGameInfo] = useState({
        _id: "",
        Player1: {},
        Player2: {},
        NumberOfRounds: 0,
        Rounds: [],
        Winner: null
    });
    const [player1_username, setP1Username] = useState("");
    const [player2_username, setP2Username] = useState("");
    const [roundCompleted, setRoundCompleted] = useState(false);

    const socket = useContext(socketProvider);
    const winning_indices = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    //sockets
    useEffect(() => {
        console.log("Turning on sockets");
        socket.emit("getPlayersInfo", roomJoined, (result) => {
            setP1Username(result[0].Player1.username);
            setP2Username(result[0].Player2.username);
            setGameInfo(result[0]);
        });
        socket.on("recieve_click", (new_squares) => {
            setSquares(new_squares);
            if (gameSpectator == false) {
                setTurn(true);
            }
        });

        socket.on("startNextRound", (roundNo) => {
            setRoundCompleted(false);
            setSquares(Array(9).fill(null));
            setPlacesFilled(0);
            setTurn(myTurn);
            setCurrentRound(roundNo);
            setWinner(null);
        });

        return () => {
            socket.off("recieve_click");
            socket.off("startNextRound");
        }
    }, []);


    useEffect(() => {
        socket.on("user_left", () => {                               //for game player if other one left
            if (gameWinner == null && gameSpectator == false) {
                socket.emit("setGameWinner",my_char,roomJoined);
                saveGameWinner(my_char, []);
            }
        })
        socket.on("setGameWinner",(symbol)=>{                              //for spectator if one of the user left tha other user will emit on this event
            console.log("in set game winner");
            if(gameSpectator)
            {
                saveGameWinner(symbol,[]);
            }
        })
        return () => {
            socket.off("user_left");
            socket.off("setGameWinner");
        }
    }, [gameInfo, gameWinner])


    //to check for winner on every click
    useEffect(() => {
        let pf = 0;
        for (var i in squares) {
            pf = (squares[i] != null) ? pf + 1 : pf;
        }
        setPlacesFilled(pf);
        let round_winner = null;
        for (let i = 0; i < winning_indices.length; i++) {
            const [a, b, c] = winning_indices[i];
            if (squares[a] && squares[a] == squares[b] && squares[b] == squares[c]) {
                round_winner = squares[a];
                setWinner(squares[a]);
                break;
            }
        }
        if (round_winner != null || pf == 9) {
            round_winner = round_winner == null ? "None" : round_winner;
            saveRoundInfo(round_winner);
        }
    }, [squares]);


    function saveRoundInfo(round_winner) {
        let rounds = gameInfo.Rounds.slice();
        rounds.push(round_winner);
        setGameInfo({ ...gameInfo, ["Rounds"]: rounds });

        if (currentRound == gameInfo.NumberOfRounds) {
            let game_winner = findGameWinner(rounds);
            if (gameSpectator == false && my_char=="X") {
                saveGameWinner(game_winner, rounds); //calling fn to save winner in db
            }
            else {
                setGameWinner(game_winner);
            }
        }
        else {
            setRoundCompleted(true);
        }
    }

    function saveGameWinner(game_winner, rounds) {
        fetch(serverURL + "/saveGame", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ "game_id": gameInfo._id, "game_winner": game_winner, "rounds": rounds }) })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((res) => {
                if (res.error == null) {
                    setGameWinner(game_winner);          //setting use state variable
                }
            })
    }

    function turnStatus()
    {
        if(gameSpectator==false)
        {
            return (turn)?"Your turn":"Opponent's turn";
        }
        return "";
    }

    function handleClick(i) {
        if (turn == true && squares[i] == null && winner == null && gameSpectator == false) {
            const new_squares = squares.slice();
            new_squares[i] = myVar;

            setTurn(false);
            setSquares(new_squares);
            //setPlacesFilled(pf);
            socket.emit("clicked", new_squares, roomJoined);
        }
        return;
    }

    return (
        <>
            <div className={styles.game}>

                {/* Round number */}
                <p className={styles.roundNo}>Round {currentRound}</p>

                {/* Players and rounds information in the left */}
                <div className={styles.leftBox}>
                    <span style={{backgroundColor:"white",color:"black",width:"fit-content",fontSize:"large",padding:"5px"}}>Welcome {Cookies.get("user")}</span>
                    <br/><br/>
                    <GameInfo player1_username={player1_username} player2_username={player2_username} Rounds={gameInfo.Rounds} my_char={my_char} gameSpectator={gameSpectator} />
                </div>

                {/* (game board and round status or turn info) or (game winner status and button to return to home page)*/}
                <div className={styles.middleBox}>
                    {
                        /*game winner is null   than the game board and round status*/
                        (gameWinner == null) ?
                            
                            <div>
                                {/* game board */}
                                <GameBoard handleClick={handleClick} squares={squares} />

                                {/* round status when round is completed */}
                                <p className={styles.roundStatus}>
                                    {
                                        roundCompleted == true
                                            ?
                                            (winner == null) ? "Match Draw"  : <p>Winner - {winner} </p>
                                            :
                                            <p></p>
                                    }
                                </p>
                                {/*button for next round or turn status */}
                                {
                                    roundCompleted == true && gameSpectator == false 
                                    ?
                                    <button className="btn btn-danger" onClick={() => { socket.emit("startNextRound", currentRound, roomJoined) }}>Next Round</button>
                                    : 
                                    <p className={styles.roundStatus}>
                                        {turnStatus()}
                                    </p>
                                }

                            </div> :

                            /*game winner is not null than the winner info and a button  */
                            <div style={{ fontSize: "larger" }}>
                                {
                                    (gameSpectator == true)
                                        ?
                                         (gameWinner=="None")?<p>Match Draw</p>:<p>WINNER - {gameWinner}</p>
                                        :              
                                        <GameStatus gameWinner={gameWinner} my_char={my_char} />
                                }
                                <button className="btn btn-secondary" onClick={() => { socket.emit("leave_room", roomJoined); history.push("/home"); }}>
                                    Return to home page
                                </button>                                
                            </div>
                    }
                </div>

                {/* Chat system on RHS */}
                <div className={styles.rightBox}>
                    <ChatSystem room={roomJoined} username={Cookies.get("user")} />
                </div>

            </div>
        </>)
}