import { useContext, useEffect, useState } from "react"
import Navbar from "../Navbar/Navbar";
import { loggedInContextProvider, socketProvider } from "../../App";
import { useHistory } from "react-router";
import { serverURL } from "../../serverUrl";
import { joinGame } from "../../joinGame";

export default function Invitations( {setRoomJoined, setBothPlayersJoinedRoom, setMyVar} ) {
    const [message, setMessage] = useState("");
    const [invites, setInvites] = useState([]);

    const { setLoggedIn } = useContext(loggedInContextProvider);
    const socket=useContext(socketProvider);
    const history=useHistory();



    useEffect(() => {
        fetch(serverURL+"/invitations", { method: "GET", credentials: "include" })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => {
                console.log(data);
                if (data.error == null) {
                    setInvites(data.invites);
                }
                else {
                    console.log(data.error);
                    setMessage(data.error);
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }, [])


    function handleJoinButtonClick(game_id,betAmount) {
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

    let jsx = invites.map((invite) => {
        return (
            <>
                <div style={{ padding: "10px", fontSize: "large" }}>
                    <p style={{marginBottom:"2px"}}>{invite.From.username} invited you to a game.</p>
                    <p style={{marginBottom:"2px"}}>Number of rounds - {invite.Game.NumberOfRounds}</p>
                    <p>Bet - {invite.Game.BetAmount}</p>
                    {invite.Game.Player2 == null ? <button onClick={() => handleJoinButtonClick(invite.Game._id,invite.Game.BetAmount)} className="btn btn-light">Join</button> : ""}
                    <hr />
                </div>
            </>
        )
    })

    return (
        <>
            <Navbar setLoggedIn={setLoggedIn} />
            {message != "" ? <p className="alert alert-danger" style={{width:"70%",margin:"auto",fontSize:"large"}}>{message}</p> : ""}
            {
                (invites.length != 0) ?
                    <div>
                        <h2 style={{ textAlign: "center" }}>Invitations</h2>
                        {jsx}
                    </div> :
                    <p className="alert alert-success" style={{ width: "70%", margin: "20px auto", fontSize: "large" }}>No invitations</p>
            }
        </>
    )
}
// Stripe