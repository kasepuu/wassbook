import { Link } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import "../../css/Login.css";
import { useEffect, useState } from "react";
import { backendHost } from "../../index.js";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../jwt";

const Login = () => {
  const navigate = useNavigate(); // Get the navigate function

  const { register, handleSubmit } = useForm();

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // add loading state

  useEffect(() => {
    if (sessionStorage.getItem("CurrentUser")) {
      navigate("/");
    }
  }, [navigate]);

  function loginResponse(response, username) {
    if (response.ok) {
      return getTokenJWT(username)
        .then((validation) => {
          if (validation) {
            console.log("You are authorized, welcome!");
            return true;
          } else {
            console.log("You are not authorized!");
            return false;
          }
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    } else {
      console.log(response);

      return response
        .text()
        .then((message) => {
          setErrorMessage(message);
          return false;
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    }
  }

  function getTokenJWT(username) {
    console.log("username- ", username);

    return fetch(`${backendHost}/jwt?User=${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Access: "MegaTurvaline123",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .then((token) => {
        document.cookie = `Bearer=${token}; Path=/`;
        loadUser();
        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  function onSubmit(data) {
    const { loginID, password } = data;

    // Validate loginID
    if (!loginID) {
      setErrorMessage("Username or email is required.");
      return;
    } else if (loginID.length < 3) {
      setErrorMessage("Username or email cannot be this short!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate password
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    } else if (password.length < 3) {
      setErrorMessage("Password must be at least 3 characters long.");
      return;
    } else {
      setErrorMessage("");
    }

    setLoading(true);

    fetch(`${backendHost}/login-attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return loginResponse(response, data.loginID);
      })
      .then((loginResp) => {
        if (loginResp) {
          console.log("navigating to: /");
          navigate("/");
        }
      })
      .catch((error) => {
        setErrorMessage("Internal issue, please try again later.");
        console.error("Login error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <div className="login-form">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <h1>Login Form</h1>

          <Form.Field>
            <input
              placeholder="Username or email"
              type="text"
              {...register("loginID")}
              autoComplete="username"
            />
          </Form.Field>

          <br></br>

          <Form.Field>
            <input
              placeholder="Password"
              type="password"
              {...register("password")}
              autoComplete="current-password"
            />
          </Form.Field>

          <div className="ErrorMessage">{errorMessage}</div>

          <Link to="/register" className="ReferLink">
            Create a new Account!
          </Link>
          <button type="submit" className="submitButton">
            {loading ? "Logging in..." : "Login!"}
          </button>
        </Form>
      </div>
    </>
  );
};

export default Login;
