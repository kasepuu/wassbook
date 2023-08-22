import "../css/SearchResult.css";
const SearchResult = ({ result }, { id }) => {
  const clickEvent = (event) => {
    console.log(event.name, event.id, "profile opened!");
  };

  return (
    <div
      className="search-result"
      onClick={() => {
        clickEvent(result);
      }}
    >
      {result.UserName},
      {' ' + result.FirstName + ' ' + result.LastName}
    </div>
  );
};

export default SearchResult;
