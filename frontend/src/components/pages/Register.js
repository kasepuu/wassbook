import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="login-form">
      <form className="login-box">
        <div className="login-credentials">
          <br />

          <h2>Register Form</h2>

          <input
            type="text"
            placeholder="First name"
            name="f-name"
            id="username"
          />
          <br />

          <br />
          <input
            type="text"
            placeholder="Last name"
            name="e-mail"
            id="username"
          />
          <br />

          <br />
          <input type="text" placeholder="E-mail" name="l-name" id="username" />
          <br />

          <br />

          <input
            type="password"
            placeholder="Password"
            name="r-password"
            id="password"
          />
          <br />

          <br />
          <button type="submit" className="button">
            Sign in!
          </button>
          <br />
          <br />
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
