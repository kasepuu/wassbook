import { Link, Navigate } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import "../../css/Login.css";
import { useState } from "react";
import { backendHost } from "../../index.js";
import { useNavigate } from "react-router-dom";
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

  async function getTokenJWT() {
    try {
      const response = await fetch(`${backendHost}/jwt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Access: "MegaTurvaline123",
        },
      });

      if (response.ok) {
        let token = await response.text();
        sessionStorage.setItem("Bearer", token);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    } finally {
      console.log("Token fetched!");
    }
  }

  async function loginResponse(response) {
    if (response.ok) {
      document.getElementById("LoginMessage").innerHTML = "";
      const validation = await getTokenJWT();
      if (validation) {
        console.log("You are authorized, welcome!");
        return true;
      } else {
        console.log("You are not authorized!");
        return false;
      }
    } else {
      console.log(response);
      let message = await response.text();
      document.getElementById("LoginMessage").innerHTML = message;
      return false;
    }
  }

  async function onSubmit(data) {
    console.log("Login attempt requested!");
    console.log(data);
    try {
      setLoading(true);

      const response = await fetch(`${backendHost}/login-attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const loginResp = await loginResponse(response);
      if (loginResp) {
        navigate("/");
      } else {
        console.log("something went wrong at loginResponse!");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
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

        <div id="LoginMessage">ERRRR</div>

        <Link to="/register" className="ReferLink">
          Create a new Account!
        </Link>
        <button type="submit" className="submitButton">
          {loading ? "Logging in..." : "Login!"}
        </button>
      </Form>
    </div>
  );
};

export default Login;
