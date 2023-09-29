import { MemberInvite } from "./MemberInvite";
import { inviteMember } from "../utils/groups";

export const Members = ({ data }) => {
  const invitePeople = (e) => {
    const dialog = document.querySelector("dialog");

    dialog.showModal();
  };

  const closeDialog = () => {
    const dialog = document.querySelector("dialog");

    dialog.close();
  };

  const inviteHandler = (member) => {
    const formData = new FormData();
    const response = inviteMember(formData);
  };
  return (
    <div className="membersInvite">
      <h1>Members</h1>

      <dialog>
        <button onClick={closeDialog} autofocus>
          Close
        </button>

        <ul>
          {data.AllUsers.map((member) => (
            <MemberInvite inviteHandler={inviteHandler} member={member} />
          ))}
        </ul>
        <article></article>
      </dialog>

      <button onClick={invitePeople} type="button">
        Invite People
      </button>

      {data.Members.map((member) => (
        <h4>{member.Username}</h4>
      ))}
    </div>
  );
};
