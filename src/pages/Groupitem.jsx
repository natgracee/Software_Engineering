export const GroupItem = ({ groupName, inviteLink }) => {
  return (
    <div className="bg-white p-3 rounded-md shadow border">
      <h4 className="text-lg font-semibold">{groupName}</h4>
      <p className="text-sm text-gray-600">Invite Link: {inviteLink}</p>
    </div>
  );
};
