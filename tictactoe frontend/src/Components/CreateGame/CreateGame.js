import { useContext, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { socketProvider } from "../../App";
import { useHistory } from "react-router";
import styles from "./style.module.css";
import { loggedInContextProvider } from "../../App";
import { serverURL } from "../../serverUrl";
import Wallet from "../Wallet/Wallet";

export default function CreateGame({ setRoomJoined }) {

    const [game,setGame] = useState({
        NumberOfRounds: null,
        Mode: "Public",
        BetAmount:0 
    });
    const [message,setMessage]=useState("");
    const { setLoggedIn } = useContext(loggedInContextProvider);

    const socket = useContext(socketProvider);
    const history = useHistory();


    function handleChange(event) 
    {
        let name=event.target.name;
        let value=event.target.value;
        setGame({...game,[name]:value});
    }

    function SubmitForm(event) {
        event.preventDefault();
    
        let data = JSON.stringify(game);
        fetch(serverURL + "/createGame", { method: "POST", credentials: "include", body: data, headers: { "Content-Type": "application/json" } })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((response) => {
                if (response.error == null) {
                    console.log(response);
                    socket.emit("create_room", response.result._id, (resp) => {
                        setRoomJoined(resp.room);
                        history.push("/wait", { game_id: response.result._id });
                    });
                }
                else {
                    setMessage(response.error);
                }
            });
    }

    return (
        <>
            <Navbar setLoggedIn={setLoggedIn} /><br/>
            <Wallet/>
            {message?<p style={{textAlign:"center"}}  className="text-danger">{message}</p>:""} 
            <div className={styles.createGameForm}>
                <div>
                    <form style={{ width: "200px", margin: "20px" }} onSubmit={SubmitForm}>
                        <div className="form-group">
                            <label className="form-label">Number of rounds-</label>
                            <input type="number" min="1" max="10" value={game.NumberOfRounds} onChange={(event)=>handleChange(event)} name="NumberOfRounds" className="form-control" required />
                        </div>
                        <br />
                        <div className="form-group">
                            <label className="form-label">Game Mode - &nbsp;&nbsp;&nbsp;</label>
                            <select className="form-check-control" value={game.Mode} onChange={(event)=>handleChange(event)} name="Mode" style={{ width: "200px", height: "35px", borderRadius: "3px" }}>
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                            </select>
                        </div>
                        <br />
                        <div className="form-group">
                            <label className="form-label">Bet Amount-</label>
                            <input type="number" value={game.BetAmount} className="form-control" onChange={(event)=>handleChange(event)} name="BetAmount" required />
                        </div>
                        <br/>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </>)
}