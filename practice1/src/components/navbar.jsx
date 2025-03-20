import "./navbar.css"

// function Navbar1(props){}
// OR
const Navbar = (props) => {
    return (
        <div id="nav">
            <div id="navText">{props.navText}</div>
            <ul id="nav-options">
                <li className="option">Home</li>
                <li className="option">About</li>
                <li className="option">Contact</li>
            </ul>
        </div>
    )
}

export default Navbar
