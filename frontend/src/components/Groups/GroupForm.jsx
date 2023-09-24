export const GroupForm = ({ handleSubmit }) => {
  const submit = (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    handleSubmit(data);
    e.target.reset();
  };
  return (
    <>
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
    </>
  );
};
