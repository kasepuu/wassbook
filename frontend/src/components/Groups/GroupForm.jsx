export const GroupForm = ({ handleSubmit }) => {
  return (
    <>
      <h1>Create group</h1>
      <form onSubmit={handleSubmit}>
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
