import { useNavigate } from "react-router-dom";

import blank from "../../page-images/blank.png";
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
      <img
        className="search-result-image"
        alt="avatar"
        src={result.Avatar === "" ? blank : blank}
      ></img>
      {" " + result.FirstName + " " + result.LastName}
    </div>
  );
};

export default SearchResult;
