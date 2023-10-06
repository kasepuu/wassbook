export const Info = ({ data }) => {
  return (
    <>
      <h3>Description: {data.Description}</h3>
      <h3>Tag: {data.Tag}</h3>
      <h3>
        We have {data.Members.length} member{data.Members.length > 1 ? "s" : ""}
      </h3>
      <h3>Owner is {data.Owner}</h3>
    </>
  );
};
