import { useNavigate } from "react-router-dom";
import { clearAllCookies } from "./Logout";

const Error = () => {
  const navigate = useNavigate();

  const handleErrorClick = () => {
    navigate("/");
  };

  return (
    <>
      <h1>Error 404, page not found!</h1>
      <button onClick={handleErrorClick}>GO BACK</button>
    </>
  );
};

export default Error;
