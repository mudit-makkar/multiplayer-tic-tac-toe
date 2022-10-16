import React, { useContext, useEffect, useRef, useState } from "react";
import { socketProvider} from "../../App";
import styles from "./style.module.css";

export default function ChatSystem(props) {
    const socket = useContext(socketProvider);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

    const messageEndRef=useRef(null);


    useEffect(()=>{
        scrollToBottom();
        socket.on("receiveMessage",(message_rec)=>{
            setMessages([...messages,message_rec]);
        })
        return ()=>{
            socket.off("receiveMessage")
        }
    },[messages]);

    function scrollToBottom()
    {
        messageEndRef.current?.scrollIntoView({behaviour:"smooth"});
    }

    function sendMessage(event)
    {
        event.preventDefault();
        let messageToSend={message:currentMessage,username:props.username}  
        
        socket.emit("sendMessage",messageToSend,props.room,(response)=>{
            if(response==true)
            {
                setMessages([...messages,messageToSend]);         
                setCurrentMessage("");  
            }
        })
    }

    let jsx=messages.map((msg)=>{
        return (<>
        <p><span style={{fontFamily:"arial",color:"yellow"}}>{msg.username}</span>&nbsp;&nbsp; - <span style={{fontWeight:"bold"}}>{msg.message}</span></p>
        <hr/>
        </>)
    })


    return (<>
        <div className={styles.chatBox}>
            <div className={styles.previousChat}>
                {jsx}
            <div ref={messageEndRef}/>
            </div>

            <div className={styles.messageForm}>
                <form onSubmit={sendMessage}>

                    <input type="text"
                        value={currentMessage}
                        onChange={(event) => { setCurrentMessage(event.target.value) }}
                        className={styles.messageInput} required/>

                        &nbsp;

                    <button type="submit" className={styles.sendMessageButton}>Send</button>
                </form>
            </div>
        </div>
    </>)
}