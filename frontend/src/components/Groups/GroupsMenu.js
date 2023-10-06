import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

export const GroupsMenu = ({ groups }) => {
  const openDialog = () => {
    const dialog = document.querySelector("dialog");

    dialog.showModal();
  };

  return (
    <>
      <h1>Groups</h1>
      <button onClick={openDialog}>Create group</button>
      <div className="group-names">
        {groups.map((group) => (
          <Link to={`/groups/${group.Id}`} key={group.Id}>
            <h3>{group.Name}</h3>
          </Link>
        ))}
      </div>
    </>
  );
};
