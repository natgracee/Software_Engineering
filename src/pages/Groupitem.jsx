import { useNavigate } from 'react-router-dom';

export const GroupItem = ({ groupName, inviteLink, id }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/group/${id}`);
  };

  return (
    <div 
      className="bg-white p-3 rounded-md shadow border cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <h4 className="text-lg font-semibold">{groupName}</h4>
      <p className="text-sm text-gray-600">Invite Link: {inviteLink}</p>
    </div>
  );
};
