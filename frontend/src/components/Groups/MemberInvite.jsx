export const MemberInvite = ({ member, inviteHandler }) => {
  const submitHandler = (e) => {
    e.preventDefault();

    inviteHandler(member);
  };

  return (
    <form onSubmit={submitHandler}>
      <li>
        <h4 class>{member.Username}</h4>
        {member.Status === "null" ? ( 
          <button>invite</button>
        ) : (
          <button disabled>Already invited</button>
        )}
      </li>
    </form>
  );
};
