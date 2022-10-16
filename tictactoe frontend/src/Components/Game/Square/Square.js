import styles from "./style.module.css";
export default function Square(props)
{
    return(
    <>
    <button onClick={props.onClick} className={styles.square} style={{color:props.color}}>
        {props.value}
    </button>
    </>
    )
}