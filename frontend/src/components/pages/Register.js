import { Link } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// forms -> https://scrimba.com/scrim/cobc44a7ba60db603359ae530
import { backendHost } from "../../index.js";
const Register = () => {
  const navigate = useNavigate(); // Get the navigate function

  const { register, handleSubmit } = useForm();

  const [loading, setLoading] = useState(false); // add loading state
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("CurrentUser")) {
      navigate("/");
    }
  }, [navigate]);

  function onSubmit(data) {
    const { userName, firstName, lastName, email, password, dateofbirth } =
      data;

    // Validate userName
    if (!userName) {
      setErrorMessage("Username or email is required.");
      return;
    } else if (userName.length < 3) {
      setErrorMessage("Username cannot be this short!");
      return;
    } else if (userName.length > 20) {
      setErrorMessage("Username cannot be this long!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate firstName
    const namePattern = /^[A-Za-zöäõüÖÄÕÜ]+$/;
    if (!firstName) {
      setErrorMessage("First name is required.");
      return;
    } else if (firstName.length < 3) {
      setErrorMessage("First name must be at least 3 characters long");
      return;
    } else if (!namePattern.test(firstName)) {
      setErrorMessage("First name must contain only letters!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate lastName
    if (!lastName) {
      setErrorMessage("Last name is required.");
      return;
    } else if (lastName.length < 3) {
      setErrorMessage("Last name must be at least 3 characters long.");
      return;
    } else if (!namePattern.test(lastName)) {
      setErrorMessage("Last name must contain only letters!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate email
    const emailPattern =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email) {
      setErrorMessage("Email is required.");
      return;
    } else if (!emailPattern.test(email)) {
      setErrorMessage("Bad email format!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate password
    // const passwordPattern =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/, //  <- liiga rets :')
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    } else if (password.length < 3) {
      setErrorMessage("Password must be longer than 3 characters!");
      return;
    } else {
      setErrorMessage("");
    }

    // Validate date-of-birth
    const minAllowedDate = new Date("1900-01-01");
    const maxAllowedDate = new Date();
    const selectedDate = new Date(dateofbirth);

    if (!dateofbirth) {
      setErrorMessage("Date of birth is required.");
      return;
    } else if (selectedDate < minAllowedDate) {
      setErrorMessage("You must be born after January 1, 1900.");
      return;
    } else if (selectedDate > maxAllowedDate) {
      setErrorMessage("You cannot be born in the future!");
      return;
    } else {
      setErrorMessage("");
    }

    setLoading(true);

    fetch(`${backendHost}/register-attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          navigate("/login");
        } else {
          console.log("Registration failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="register-form">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1>Register Form</h1>

        <Form.Field>
          <input placeholder="Username" type="text" {...register("userName")} />
        </Form.Field>

        <Form.Field>
          <input
            placeholder="First Name"
            type="text"
            {...register("firstName")}
          />
        </Form.Field>

        <Form.Field>
          <input
            placeholder="Last Name"
            type="text"
            {...register("lastName")}
          />
        </Form.Field>

        <Form.Field>
          <input
            placeholder="E-mail"
            {...register("email")}
            autoComplete="username"
          />
        </Form.Field>

        <Form.Field>
          <input
            placeholder="Password"
            type="password"
            {...register("password")}
            autoComplete="current-password"
          />
        </Form.Field>

        <Form.Field>
          <label>Date of Birth</label>
          <input type="date" {...register("dateofbirth")} />
        </Form.Field>

        <div className="ErrorMessage">{errorMessage}</div>

        <button type="submit" className="submitButton">
          {loading ? "Registering..." : "Register!"}
        </button>

        <Link to="/login" className="ReferLink">
          Already have an Account?
        </Link>
      </Form>
    </div>
  );
};

export default Register;
