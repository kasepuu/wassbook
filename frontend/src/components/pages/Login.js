import { Link } from "react-router-dom";
import { Form, Button } from "semantic-ui-react";
import "../../css/Login.css";

// formid ümber teha!
// https://scrimba.com/scrim/cobc44a7ba60db603359ae530

const Login = () => {
  const handleSubmit = () => {};

  return (
    <div className="login-form">
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>First Name</label>
          <input placeholder="First Name" type="text" name="firstName" />
        </Form.Field>

        <Form.Field>
          <label>Last Name</label>
          <input placeholder="Last Name" type="text" name="lastName" />
        </Form.Field>

        <Button>Login!</Button>
      </Form>

      <Link to="/register">Create a new Account</Link>
    </div>
  );
};

export default Login;
