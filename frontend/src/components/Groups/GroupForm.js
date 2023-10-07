import { useState } from "react";

export const GroupForm = ({ handleSubmit }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const closeDialog = () => {
    const dialog = document.querySelector("dialog");

    dialog.close();
  };
  const validateField = (value, min, max, fieldName) => {
    if (!value) {
      return `${fieldName} is missing!`;
    } else if (value.length < min) {
      return `${fieldName} cannot be this short!`;
    } else if (value.length > max) {
      return `${fieldName} cannot be this long!`;
    }
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const dialog = document.querySelector("dialog");

    let data = new FormData(e.target);

    let name = data.get("name"); // Assuming the form field name is "name"
    let tag = data.get("tag"); // Assuming the form field name is "tag"
    let desc = data.get("description"); // Assuming the form field name is "description"

    // Validate the form fields
    const nameError = validateField(name, 5, 20, "Group name");
    const tagError = validateField(tag, 2, 5, "Clan tag");
    const descError = validateField(desc, 1, 1000, "Group description");

    if (nameError) {
      setErrorMessage(nameError);
      return;
    } else if (tagError) {
      setErrorMessage(tagError);
      return;
    } else if (descError) {
      setErrorMessage(descError);
      return;
    }

    handleSubmit(data);
    e.target.reset();
    dialog.close();
  };
  return (
    <>
      <dialog className="form-container">
        <button className="form-close" onClick={closeDialog} autoFocus>
          Close
        </button>

        <h1 className="form-title">Create group</h1>
        <form onSubmit={submit}>
          {/* <div className="form-label">Name</div> */}
          <div className="form-control">
            <input type="text" name="name" placeholder="name (max 20)" />
          </div>

          {/* <div className="form-label">Tag</div> */}

          <div className="form-control">
            <input type="text" name="tag" placeholder="clan tag (max 5)" />
          </div>

          {/* <div className="form-label">Description</div> */}
          <div className="form-control">
            <input type="text" name="description" placeholder="description" />
          </div>

          <div className="form-error">
            <p className="ErrorMessage">{errorMessage}</p>
          </div>

          <div className="form-control">
            <button className="form-submit" type="submit">
              Submit
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};
