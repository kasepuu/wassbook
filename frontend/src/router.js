import { Route, Routes, Navigate } from "react-router-dom";
//pages
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";

import { isAuthorized } from "./Application.js";
const Routing = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={isAuthorized ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isAuthorized ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthorized ? <Navigate to="/" /> : <Register />}
      />

      {/*   <Route path="*" element={<NotFound />} />    */}
    </Routes>
  );
};

export default Routing;
