export const MemberInvite = ({ member, inviteHandler }) => {
  const submitHandler = (e) => {
    e.preventDefault();

    inviteHandler(member);
  };

  return (
    <form onSubmit={submitHandler}>
      <li>
        <h4>{member.Username}</h4>
        {member.Status === "invited" ? (
          <button disabled>Already Invited</button>
        ) : member.Status === "accepted" ? (
          <button disabled>Already Member</button>
        ) : member.Status === "pending" ? (
          <button disabled>Pending</button>
        ) : (
          <button>Invite</button>
        )}
      </li>
    </form>
  );
};
