import React, { useContext, useEffect, useState } from "react";
import { Link,useHistory } from "react-router-dom";
import {loggedInContextProvider} from "../../App";
import styles from "./style.module.css";
import { serverURL } from "../../serverUrl";
function Login({setLoggedInUsername})
{
    const [loginCredentials,setLoginCredentials]=useState({
        username:"",
        password:"",
    });
    const [errorMessage,setErrorMessage]=useState("");
    
    const history=useHistory();

    const {setLoggedIn}=useContext(loggedInContextProvider);


    function handleChange(event)
    {
        let name=event.target.name;
        let value=event.target.value;
        setLoginCredentials({...loginCredentials,[name]:value});
    }


    function loginUser(event)
    {
        event.preventDefault();
     
        fetch(serverURL+"/login",
        {method:"POST",credentials:"include",headers:{'Content-Type':'application/json'},body:JSON.stringify(loginCredentials)})
        .then((response)=>
        {
            if(response.ok)
            {
               return response.json();
            }
        })
        .then((data)=>
        {
            if(data.error===null)
            {
                setLoggedIn(true);
                history.push("/home");
            }
            else
            {
                setErrorMessage(data.error);
            }
        })
        .catch((error)=>{
            console.log(error);
        })
    }

    return (
    <>
    <div className={styles.loginForm}>
        <div>
        <h1 className={styles.heading}>Login</h1>  
        <form style={{width:"500px",margin:"20px"}} onSubmit={loginUser}>
            <div className={errorMessage?'text-danger':'d-none'}>
                <p>{errorMessage}</p>
            </div>
            <div className="form-group">
                <label className="form-label">Username</label>
                <input required type="text" className="form-control" name="username" value={loginCredentials.username} onChange={handleChange}/>
            </div><br/>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input required type="password" className="form-control" name="password" value={loginCredentials.password} onChange={handleChange} />
            </div>
            <br/>
            <button type="submit" className="btn btn-primary">Login</button>
            <br/><br/>
            <Link to="/signup">Click here to register</Link>
        </form>
        </div>
    </div>
    </>
    );
}
export default Login;