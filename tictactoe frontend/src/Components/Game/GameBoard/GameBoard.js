import Square from "../Square/Square";
import styles from "./style.module.css"
export default function GameBoard({squares,handleClick})
{
    
    let jsx = squares.map(function (data, i) {
        return <Square value={squares[i]} color={squares[i]=="X"?"red":"blue"} onClick={() => { handleClick(i) }} />
    });
    
    return <div className={styles.board}>{jsx}</div>;       
}