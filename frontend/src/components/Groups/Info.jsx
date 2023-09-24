export const Info = ({ data }) => {
  return (
    <>
      <h3>Description: {data.Description}</h3>
      <h3>Here are {data.Members.length} members</h3>
      <h3>Owner is {data.Owner}</h3>
    </>
  );
};
