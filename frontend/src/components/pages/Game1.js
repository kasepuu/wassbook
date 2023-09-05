import Sidebar from "../Sidebar";
import FriendsList from "../FollowersList";
import Navbar from "../Navbar";
import { useAuthorization } from "../Authorization";
const Game1 = () => {
  const isAuthorized = useAuthorization();
  if (isAuthorized) {
    return (
      <>
        <Navbar />
        <Sidebar />

        <div className="game">
          <iframe
            className="center-vertically"
            src="http://joelsoft.eu:1111"
            title="make-your-game"
          />
        </div>
        <FriendsList />
      </>
    );
  }
};

export default Game1;
