import { Link } from "react-router-dom";
import { Form, FormField } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// forms -> https://scrimba.com/scrim/cobc44a7ba60db603359ae530
import { backendHost } from "../../index.js";
const Register = () => {
  console.log("REGISTER PAGEEEE");
  const navigate = useNavigate(); // Get the navigate function

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false); // add loading state

  function onSubmit(data) {
    console.log("Register attempt requested!");
    console.log(data);

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

  const minAllowedDate = "1900-01-01";
  const maxAllowedDate = new Date().toISOString().split("T")[0];
  console.log(
    "register limitations:",
    `(${minAllowedDate})`,
    "&",
    `(${maxAllowedDate})`
  );
  return (
    <div className="register-form">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1>Register Form</h1>

        <Form.Field>
          <input
            placeholder="Username"
            type="text"
            {...register("userName", {
              required: true,
              maxLength: 20,
              minLength: 3,
            })}
          />
          <p className="ErrorMessage">
            {errors.firstName && (
              <>First name must be longer than 3 characters!</>
            )}
          </p>
        </Form.Field>

        <Form.Field>
          <input
            placeholder="First Name"
            type="text"
            {...register("firstName", {
              required: true,
              maxLength: 20,
              minLength: 3,
              pattern: /^[A-Za-z]+$/, // disallow number usage in first name
            })}
          />
          <p className="ErrorMessage">
            {errors.firstName && (
              <>First name must be longer than 3 characters!</>
            )}
          </p>
        </Form.Field>

        <Form.Field>
          <input
            placeholder="Last Name"
            type="text"
            {...register("lastName", {
              required: true,
              maxLength: 20,
              minLength: 3,
              pattern: /^[A-Za-z]+$/, // disallow number usage in first name
            })}
          />
          <p className="ErrorMessage">
            {errors.lastName && (
              <>Last name must be longer than 3 characters!</>
            )}
          </p>
        </Form.Field>

        <Form.Field>
          <input
            placeholder="E-mail"
            {...register("email", {
              required: true,
              pattern:
                /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            })}
          />
          <p className="ErrorMessage">
            {errors.email && <>Bad Email format!</>}
          </p>
        </Form.Field>

        <Form.Field>
          <input
            placeholder="Password"
            type="password"
            {...register("password", {
              required: true,
              minLength: 3,
              // pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/, //  <- liiga rets :')
            })}
          />
          <p className="ErrorMessage">
            {errors.password && <>Password cannot be this short!</>}
          </p>
        </Form.Field>

        <Form.Field>
          <label>Date of Birth</label>

          <input
            type="date"
            {...register("dateofbirth", {
              required: true,
            })}
            min={minAllowedDate}
            max={maxAllowedDate}
          />
          <p className="ErrorMessage">{errors.dateofbirth && <>Bad Date!</>}</p>
        </Form.Field>

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
