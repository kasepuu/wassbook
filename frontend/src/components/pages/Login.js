import { Link } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import "../../css/Login.css";
import { useState } from "react";
import { backendHost } from "../../index.js";
import { useNavigate } from "react-router-dom";
import { connectAndSendEvents } from "../../index.js";
import { loadUser } from "../../jwt";
// formid ümber teha!
// https://scrimba.com/scrim/cobc44a7ba60db603359ae530

const Login = () => {
  const navigate = useNavigate(); // Get the navigate function

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false); // add loading state

  function onSubmit(data) {
    console.log("Login attempt requested!");
    console.log(data);

    setLoading(true);

    fetch(`${backendHost}/login-attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log("on login submit:");
        return loginResponse(response, data.loginID);
      })
      .then((loginResp) => {
        if (loginResp) {
          console.log("navigating to: /");
          connectAndSendEvents();
          navigate("/");
        } else {
          console.log("something went wrong at loginResponse!");
        }
      })
      .catch((error) => {
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
              {...register("loginID", {
                required: true,
                maxLength: 20,
                minLength: 3,
              })}
            />
            {
              <p className="ErrorMessage">
                {errors.loginID && (
                  <>First name must be longer than 3 characters!</>
                )}
              </p>
            }
          </Form.Field>

          <Form.Field>
            <input
              placeholder="Password"
              type="password"
              {...register("password", {
                required: true,
                maxLength: 20,
                minLength: 3,
              })}
            />
            <p className="ErrorMessage">
              {errors.password && (
                <>Password is required and must be longer than 3 characters!</>
              )}
            </p>
          </Form.Field>

          <div id="LoginMessage"></div>

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

function loginResponse(response, username) {
  if (response.ok) {
    document.getElementById("LoginMessage").innerHTML = "";

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
        document.getElementById("LoginMessage").innerHTML = message;
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
