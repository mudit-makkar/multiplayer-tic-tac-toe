import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { loggedInContextProvider } from "../../App";
import styles from "./style.module.css"
import { serverURL } from "../../serverUrl";

export default function MatchHistory() {
    const [games, setGames] = useState([]);
    const [loggedInUserId,setId]=useState("");
    const { setLoggedIn } = useContext(loggedInContextProvider);

    useEffect(() => {
        console.log("In game history")
        fetch(serverURL+"/gameHistory", { method: "GET", credentials: "include" })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((data) => {
                if(data.error==null)
                {
                    setGames(data.result);
                    setId(data.loggedInId);
                }
                else
                {
                    console.log(data.error);
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])


    let jsx = (games.length!=0) ? games.map((game) => {
        let opponentUsername=(game.Player1._id==loggedInUserId)?game.Player2.username:game.Player1.username;
        let status=null;
        if(game.Winner=="X")
        {
            status=(game.Player1._id==loggedInUserId)?"WON":"LOST";
        }
        else if(game.Winner=="O")
        {
            status=(game.Player2._id==loggedInUserId)?"WON":"LOST";
        }
        else
        { 
            status="DRAW";
        }
        return (
            <div className={styles.game}>
                <h3 className={styles.heading}>Tic Tac Toe</h3>
                <div style={{ float: "right", padding: "10px" ,display:"inline" }}>
                    <span style={{fontSize:"xx-large",color:"purple"}}>{status}</span>
                </div>
                <p style={{fontSize:"larger",color:"blue"}}>Opponent - <span style={{fontWeight:"bold"}}>{opponentUsername}</span></p>
                <p style={{fontSize:"larger",color:"blue"}}>Number of rounds - <span style={{fontWeight:"bold"}}>{game.NumberOfRounds}</span></p>
            </div>
        )
    }):"";
    
    return (
        <>
            <Navbar setLoggedIn={setLoggedIn} />
            <div>
                {jsx}
            </div>
        </>
    )
}