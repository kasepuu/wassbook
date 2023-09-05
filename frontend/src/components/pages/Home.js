import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FollowersList from "../FollowersList";
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
        <FollowersList />
      </>
    );
  }
};

export default Home;
