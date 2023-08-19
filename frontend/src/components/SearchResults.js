import "../css/SearchResults.css";

const SearchResults = ({ results }) => {
  return (
    <div className="results-list">
      {results.map((result) => {
        return <div key={result.id}>{result.name}</div>;
      })}
    </div>
  );
};

export default SearchResults;
