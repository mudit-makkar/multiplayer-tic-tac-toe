import React from "react";

export default function GameStatus({gameWinner,my_char}) 
{
    let message = null;
    if (gameWinner == my_char) {
        message = "CONGRATULATIONS....YOU WON";
    }
    else if (gameWinner == "None") {
        message = "Match Draw";
    }
    else {
        message = "Opponent won the game....Better luck next time";
    }

    return (
        <>
            <p style={{fontSize:"larger"}}>{message}</p> <br/>        
        </>
    )
}
