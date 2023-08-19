import logo from './logo.svg';
import './css/Application.css';
import Navbar from './components/Navbar';
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import FriendsList from './components/Friends';

import Routing from './router';
function App() {
 
  return (
  <>
  <Navbar/>
  <Routing/>
  </>
    // <div className="Application">
      
    //   <Sidebar/>
    //   <Feed/>
    //   <FriendsList/>

    //   <img src={logo} className="App-logo" alt="logo" />
    // </div>
  );
}

export default App;
 