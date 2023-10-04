export const GroupForm = ({ handleSubmit }) => {
  const closeDialog = () => {
    const dialog = document.querySelector("dialog");

    dialog.close();
  };
  const submit = (e) => {
    e.preventDefault();
    const dialog = document.querySelector("dialog");

    let data = new FormData(e.target);

    handleSubmit(data);
    e.target.reset();
    dialog.close();
  };
  return (
    <>
      <dialog>
        <button onClick={closeDialog} autoFocus>
          Close
        </button>

        <h1>Create group</h1>
        <form onSubmit={submit}>
          <div className="form-control">
            <label>Name</label>
            <input type="text" name="name" />
          </div>
          <div className="form-control">
            <label>Description</label>
            <input type="text" name="description" />
          </div>

          <div className="form-control">
            <label></label>
            <button type="submit">Submit</button>
          </div>
        </form>
      </dialog>
    </>
  );
};
