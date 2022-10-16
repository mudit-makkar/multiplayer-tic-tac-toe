import React,{useState} from "react";
import { Link } from "react-router-dom";
import styles from "./style.module.css";
import { serverURL } from "../../serverUrl";
function Signup()
{
    const [userInfo,setUserInfo] = useState(
        {
            username:"",
            email:"",
            password:""
        });
    
        const [errorMessage,setErrorMessage]=useState("");
        const [successMessage,setSuccessMessage]=useState("");

    function handleChange(event)
    {
        let name=event.target.name;
        let value=event.target.value;
        setUserInfo({...userInfo,[name]:value});
    }

    function ResetForm()
    {
        setUserInfo({username:"",password:"",email:""})
    }

    function RegisterUser(event)
    {
        event.preventDefault();
        
        fetch(serverURL+"/signup",
        {method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify(userInfo)})
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
                setErrorMessage("");
                setSuccessMessage(data.result);
                ResetForm();
            }
            else
            {
                setSuccessMessage("");
                setErrorMessage(data.error);
            }
        })
    }


    return (
    <>
    <div className={styles.signupForm}>
    <div>
        <h2 className={styles.heading}>Create Account</h2>  
        <form style={{width:"500px",margin:"20px"}} onSubmit={RegisterUser}>
    
            <div className={errorMessage?'text-danger':'d-none'}>
                <p>{errorMessage}</p>
            </div>
            <div style={{display:successMessage?'block':'none'}}>
                <p style={{color:"green"}}>{successMessage}</p>
            </div>


            <div className="form-group">
                <label className="form-label">Username</label>
                <input required type="text" className="form-control" name="username" value={userInfo.username} onChange={handleChange}/>
            </div><br/>
            <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" className="form-control" name="email" value={userInfo.email} onChange={handleChange}/>
            </div><br/>
            <div className="form-group">
                <label className="form-label">Password</label>
                <input required type="password" className="form-control" name="password" value={userInfo.password} onChange={handleChange}/>
            </div><br/>
            <button type="submit" className="btn btn-primary">Signup</button>
            <br/><br/>
            <Link to="/login">Click here to login</Link>
        </form>
        </div>
    
    </div>
    </>
    );
}
export default Signup;