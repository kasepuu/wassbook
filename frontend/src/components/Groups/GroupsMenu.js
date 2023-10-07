import { Link } from "react-router-dom";

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
            <h3>
              {group.Name} ({group.Tag})
            </h3>
          </Link>
        ))}
      </div>
    </>
  );
};
