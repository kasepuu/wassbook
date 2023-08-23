import "../css/SearchResult.css";
import { useNavigate } from "react-router-dom";
const SearchResult = ({ result }, { id }) => {
  const navigate = useNavigate(); // Get the navigate function

  if (!result) return;

  return (
    <div
      className="search-result"
      onClick={() => {
        navigate(`/profile/${result.UserName}`);
      }}
    >
      {result.UserName},{" " + result.FirstName + " " + result.LastName}
    </div>
  );
};

export default SearchResult;
