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
      {result.name}
    </div>
  );
};

export default SearchResult;
