export default function GameInfo({ player1_username, player2_username, Rounds, my_char, gameSpectator }) {

    function RoundsWinners() {
        if (Rounds.length == 0) {
            return;
        }
        else {
            let jsx;
            if (gameSpectator == false) {
                    jsx = Rounds.map((element, index) => {
                    if (element != null) {

                        let other_char = (my_char == "X") ? "O" : "X";

                        let status = null;
                        if (element == my_char) {
                            status = "WIN";
                        }
                        else if (element == other_char) {
                            status = "LOSE"
                        }
                        else {
                            status = "DRAW";
                        }
                        return <p>Round {index + 1} - <span style={{ color: "red" }}> {status}</span> </p>
                    }
                })
            }
            else
            {
                jsx = Rounds.map((element, index) => {
                    if(element!=null)
                    {
                        return <p>Round {index + 1} - <span style={{ color: "red" }}>{(element=="None"?"Draw":element)}</span></p>
                    }
                });
            }
            return jsx;
        }
    }

        return <>
            <div style={{ color: "black", fontSize: "large", width: "fit-content", backgroundColor: "lightgrey", padding: "20px" }}>
                <p>Player1 - <span style={{ color: "blue" }}> {player1_username} (X)</span></p>
                <p>Player2 - <span style={{ color: "blue" }}>{player2_username}  (O)</span></p>
                {RoundsWinners()}
            </div>
        </>
    }