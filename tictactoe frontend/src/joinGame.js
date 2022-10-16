import { serverURL } from "./serverUrl";

export function joinGame(game_id,betAmount,socket,cb)
{
    let body = JSON.stringify({ "game_id": game_id, "betAmount":betAmount });
    return socket.emit("canJoinRoom", game_id, async(res) => {
        if (res.can_join == true) {
            const response=await fetch(serverURL + "/joinGame", { headers: { "Content-Type": "application/json" }, method: "POST", credentials: "include", body: body });
            const data=await response.json();
            cb({error:data.error,room:res.room,can_join:true});
        } 
        else{
            cb({can_join:false});
        }
    });
} 