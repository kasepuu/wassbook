import { Link } from "react-router-dom";
import "../../css/Login.css";

const Login = () => {
  return (
    <div className="login-form">
      <form className="login-box">
        <div className="login-credentials">
          <br />

          <h2>Login Form</h2>

          <input
            type="text"
            placeholder="Username or Email"
            name="username"
            id="username"
          />
          <br />

          <br />
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
          />
          <br />

          <br />
          <button type="submit" className="button">
            Sign in!
          </button>

          <br />
          <br />
          <Link to="/register">Create an account!</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
