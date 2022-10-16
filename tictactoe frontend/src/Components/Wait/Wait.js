import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { socketProvider } from "../../App";
import { serverURL } from "../../serverUrl";
import styles from "./style.module.css";

export default function Wait({ setBothPlayersJoinedRoom, setMyTurn, setMyVar}) {
    const socket = useContext(socketProvider);
    const {state}=useLocation();
   
    const [username, setUsername] = useState("");
    const [Message, setMessage] = useState("");
    const history = useHistory();

    useEffect(() => {
        socket.on("confirm_join", (res) => {
            if (res.joined == true) {
                setBothPlayersJoinedRoom(true);
                setMyTurn(true);
                setMyVar("X");
                history.push("/game");
            }
        })
        return ()=>{
            socket.off("confirm_join");
        }
    }, [])

    function inviteUser(event) {
        event.preventDefault();
        console.log("game_id",state.game_id);
        let data = { "username": username , "game_id":state.game_id};
        fetch(serverURL+"/inviteFriend", { method: "POST",headers:{"Content-Type":"application/json"},credentials: "include", body: JSON.stringify(data) })
            .then((response) => {
                return response.json();
            })
            .then(response => {
                setMessage(response.message);
            })
            .catch((error)=>{
                console.log(error);
            })
    }

    return (<>
        <p style={{ fontWeight: "bolder", fontFamily: "cursive", fontSize: "40px", padding: "30px" }}>Waiting for another player to join the game..</p>
        <br /><br />
        <div className={styles.inviteForm}>
            <div>
                <h3 className={styles.heading}>Invite your friends</h3>
                <form style={{ width: "500px", margin: "20px" }} onSubmit={inviteUser}>
                    <div className={Message ? 'text-info' : 'd-none'}>
                        <p>{Message}</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input  type="text" className="form-control" name="username" value={username} onChange={(event) => { setUsername(event.target.value) }} required />
                    </div><br />
                    <button type="submit" className="btn btn-danger">Invite</button>
                    <br /><br />
                </form>
            </div>
        </div>
    </>)
}