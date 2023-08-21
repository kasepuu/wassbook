import { Route, Routes, Navigate } from "react-router-dom";
//pages
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Logout from "./components/pages/Logout";
import Game1 from "./components/pages/Game1";
const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* login, register & logout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/game-1" element={<Game1 />} />
      {/*   <Route path="*" element={<NotFound />} />    */}
    </Routes>
  );
};

export default Routing;
