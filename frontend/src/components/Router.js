import { Route, Routes } from "react-router-dom";
//pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import Game1 from "./pages/Game1";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* login, register & logout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/game-1" element={<Game1 />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/groups" element={<Groups />} />

      {/*   <Route path="*" element={<NotFound />} />    */}
    </Routes>
  );
};

export default Routing;

