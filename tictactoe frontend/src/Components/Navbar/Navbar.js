import { Link } from "react-router-dom"
import Cookies from "js-cookie";
import { useHistory } from "react-router";

export default function Navbar(props) {
    const history = useHistory();
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="collapse navbar-collapse justify-content-start" id="navbarText">
                    <a className="navbar-brand" href="#">TicTacToe</a>
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <Link to="/home" className="nav-link">Home</Link>
                        </li>
                        <li class="nav-item">
                            <Link to="/createGame" className="nav-link">Create Game</Link>
                        </li>
                        <li class="nav-item">
                            <Link to="/matchHistory" className="nav-link">Match History</Link>
                        </li>
                        <li class="nav-item">
                            <Link to="/invitations" className="nav-link">Invitations</Link>
                        </li>
                        <li className="nav-item">
                            <a onClick={() => {
                                Cookies.remove("token");
                                Cookies.remove("user");
                                props.setLoggedIn(false);
                                history.push("/login");
                            }} className="nav-link" style={{cursor:"pointer"}}>Logout</a>
                        </li>
                    </ul>
                </div>
                <div className="collapse navbar-collapse justify-content-end" id="navbarText">
                    <ul className="navbar-nav">
                        <li>
                            <span style={{paddingRight:"20px",fontSize:"x-large",color:"black"}}>Welcome {Cookies.get("user")}</span>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}