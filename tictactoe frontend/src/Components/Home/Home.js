import { useContext} from "react";
import { loggedInContextProvider } from "../../App";
import AvailableGames from "../AvailableGames/AvailableGames";
import Navbar from "../Navbar/Navbar";

export default function Home({setBothPlayersJoinedRoom,setMyVar,setMyTurn,setRoomJoined,setGameSpectator})
{
    const {setLoggedIn}=useContext(loggedInContextProvider);
 
    return (   
    <>
       <Navbar setLoggedIn={setLoggedIn} />
       <AvailableGames setRoomJoined={setRoomJoined} setBothPlayersJoinedRoom={setBothPlayersJoinedRoom} setMyVar={setMyVar} setMyTurn={setMyTurn} setGameSpectator={setGameSpectator}/>
    </>
    )
}