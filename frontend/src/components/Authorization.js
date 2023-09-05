import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectAndSendEvents } from "..";
import { loadUser, tokenValidation } from "../jwt"; // Import your authentication function

export const useAuthorization = (atRegister = false) => {
  console.log("authorization attempt at:", document.location.href);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function checkAuthorization() {
      tokenValidation()
        .then((authorized) => {
          setIsAuthorized(authorized);
          if (!authorized) {
            atRegister ? navigate("/register") : navigate("/login");
          }

          // setting up current user & ws connection
          if (!window.socket) connectAndSendEvents();
          loadUser();
          console.log("current user is:", authorized);
        })
        .catch((error) => {
          console.error("Authorization error:", error);
        });
    }
    checkAuthorization();
  }, [navigate, atRegister]);

  return isAuthorized;
};
