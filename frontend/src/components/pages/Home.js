import Feed from "../Feed";
import Sidebar from "../Sidebar";
import FollowersList from "../FollowersList";
import Navbar from "../Navbar";

const Home = () => {
  return (
    <>
      <Navbar />
      <Sidebar />
      <Feed />
      <FollowersList />
    </>
  );
};

export default Home;
