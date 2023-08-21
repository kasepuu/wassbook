import { Route, Routes, Navigate } from "react-router-dom";
//pages
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";

let isAuthorized = false;

const Routing = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={isAuthorized ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*   <Route path="*" element={<NotFound />} />    */}
    </Routes>
  );
};

export default Routing;
