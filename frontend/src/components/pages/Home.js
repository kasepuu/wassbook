import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import { useAuthorization } from "../Authorization";

const Home = () => {
  const isAuthorized = useAuthorization();
  if (isAuthorized) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <Feed />
        <FriendsList />
      </>
    );
  }
};

export default Home;
