import "./css/Application.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import FriendsList from "./components/FriendsList";

import Routing from "./router";
function App() {
  return (
    <>
      <Navbar />
      <div className="MainContainer">
        <Sidebar />
        <Feed>
          <Routing />
        </Feed>
        <FriendsList />
      </div>
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
