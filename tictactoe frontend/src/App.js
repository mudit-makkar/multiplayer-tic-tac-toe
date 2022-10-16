import React, { createContext, useEffect, useState } from 'react';
import { Switch, BrowserRouter, Route, Redirect } from "react-router-dom"
import Cookies from "js-cookie";
import socketClient from "socket.io-client";
import { serverURL } from './serverUrl';
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
import Home from "./Components/Home/Home";
import CreateGame from "./Components/CreateGame/CreateGame";
import Board from './Components/Game/Board/Board';
import Wait from './Components/Wait/Wait';
import MatchHistory from './Components/MatchHistory/MatchHistory';
import Invitations from './Components/Invitations/Invitations';

export const loggedInContextProvider = createContext();
export const socketProvider = createContext();


export default function App() 
{
  const [socket, setSocket] = useState(null);
  const [roomJoined, setRoomJoined] = useState("");
  const [bothPlayersJoinedRoom, setBothPlayersJoinedRoom] = useState(false);
  const [gameSpectator,setGameSpectator]=useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [myVar, setMyVar] = useState("");
  

  const jwt_token = Cookies.get("token");
  let log_in = jwt_token != null ? true : false;

  const [loggedIn, setLoggedIn] = useState(log_in);

  useEffect(() => {
    setSocket(socketClient(serverURL))
  }
    , [])


  return (
    <>
      <socketProvider.Provider value={socket}>
        <loggedInContextProvider.Provider value={{ loggedIn, setLoggedIn }}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/">
                {<Redirect to="/login" />}
              </Route>

              <Route exact path="/login">
                {loggedIn ? <Redirect to="/home" /> : <Login />}
              </Route>

              <Route exact path="/signup"><Signup /></Route>

              <Route exact path="/home">
                {loggedIn ? <Home setRoomJoined={setRoomJoined} setBothPlayersJoinedRoom={setBothPlayersJoinedRoom} setMyTurn={setMyTurn} setMyVar={setMyVar} setGameSpectator={setGameSpectator}/> : <Redirect to="/login" />}
              </Route>

              <Route exact path="/createGame">
                {
                  loggedIn ?
                    <CreateGame setRoomJoined={setRoomJoined} /> :
                    <Redirect to="/login" />
                }
              </Route>

              <Route exact path="/matchHistory">
                {
                  loggedIn ? <MatchHistory /> : <Redirect to="/login" />
                }
              </Route>

              <Route exact path="/invitations">
                {
                  loggedIn ? <Invitations setBothPlayersJoinedRoom={setBothPlayersJoinedRoom} setRoomJoined={setRoomJoined} setMyVar={setMyVar} /> : <Redirect to="/login" />
                }
              </Route>

              <Route exact path="/wait">
                {loggedIn && roomJoined != "" ?
                  <Wait setBothPlayersJoinedRoom={setBothPlayersJoinedRoom} setMyTurn={setMyTurn} setMyVar={setMyVar}  /> :
                  <Redirect to="/login" />}
              </Route>

              <Route exact path="/game">
                {loggedIn && (bothPlayersJoinedRoom || gameSpectator) ?
                  <Board myTurn={myTurn} setMyTurn={setMyTurn} myVar={myVar} roomJoined={roomJoined} gameSpectator={gameSpectator}/> :
                  <Redirect to="/login" />}
              </Route>
              
            </Switch>
          </BrowserRouter>
        </loggedInContextProvider.Provider>
      </socketProvider.Provider>
    </>
  );
}
