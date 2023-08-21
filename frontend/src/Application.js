import "./css/Application.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import FriendsList from "./components/FriendsList";

import Routing from "./router";

let isAuthorized = false;
function App() {
  return (
    <>
      <div className="MainContainer">
        {isAuthorized && <Navbar />}
        {isAuthorized && <Sidebar />}
        <Routing />
        {isAuthorized && <FriendsList />}
      </div>
    </>
  );
}

export default App;
