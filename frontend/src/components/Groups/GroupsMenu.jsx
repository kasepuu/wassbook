import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

export const GroupsMenu = ({ groups }) => {
  return (
    <>
      <h1>Groups</h1>
      <div className="group-names">
        {groups.map((group) => (
          <Link to={`/groups/${group.Id}`}>
            <h3>{group.Name}</h3>
          </Link>
        ))}
      </div>
    </>
  );
};
