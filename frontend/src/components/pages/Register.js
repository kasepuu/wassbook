import { Link } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Navigate } from "react-router-dom";
// forms -> https://scrimba.com/scrim/cobc44a7ba60db603359ae530
import { backendHost } from "../../index.js";
const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false); // add loading state

  async function onSubmit(data) {
    console.log("Register attempt requested!");
    console.log(data);
    try {
      setLoading(true);

      const response = await fetch(`${backendHost}/register-attempt`, {
        method: "POST", // Specify the HTTP method as POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Navigate("/login");
      } else {
        console.log("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-form">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1>Register Form</h1>

        <Form.Field>
          <label>First Name</label>
          <input
            placeholder="First Name"
            type="text"
            {...register("firstName", {
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
          <label>Last Name</label>
          <input
            placeholder="Last Name"
            type="text"
            {...register("lastName", {
              required: true,
              maxLength: 20,
              minLength: 3,
            })}
          />
          <p className="ErrorMessage">
            {errors.lastName && (
              <>Last name must be longer than 3 characters!</>
            )}
          </p>
        </Form.Field>

        <Form.Field>
          <label>E-mail</label>
          <input
            placeholder="E-mail"
            {...register("email", {
              required: true,
              pattern:
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            })}
          />
          <p className="ErrorMessage">
            {errors.email && <>Bad Email format!</>}
          </p>
        </Form.Field>

        <Form.Field>
          <label>Password</label>
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
