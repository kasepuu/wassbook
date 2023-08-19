import './Navbar.css';
import logo from '../logo.svg';


const Navbar = () => {
    return ( 
        <nav className="Navbar">
            <img src={logo} className='NavbarLogo' alt='logo'></img><textarea placeholder='Search Wassbook'></textarea>
            <div className="links">
                <a href="/">Home</a>
                <a href="/about">About</a>
            </div>
        </nav>
     );
}
 
export default Navbar;