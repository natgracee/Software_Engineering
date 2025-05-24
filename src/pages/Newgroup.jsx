import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Newgroup = () => {
  const [groupName, setGroupName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [creatorName, setCreatorName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    if (!groupName || !creatorName) {
      alert('Please provide group name and your name as the creator.');
      return;
    }

    const groupId = `grp-${Date.now()}`;

    if (profilePic) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveGroup(reader.result);
      };
      reader.readAsDataURL(profilePic);
    } else {
      saveGroup('');
    }

    function saveGroup(photoBase64) {
      const newGroup = {
        id: groupId,
        name: groupName,
        photo: photoBase64,
        members: [creatorName],
        isNew: true,
      };

      const storedGroups = JSON.parse(localStorage.getItem('groups')) || [];
      storedGroups.push(newGroup);
      localStorage.setItem('groups', JSON.stringify(storedGroups));

      const link = `${window.location.origin}/join/${groupId}`;
      setInviteLink(link);

      alert('Group Created!');
    }
  };

  return (
    <section className="page-container">
      <div className="bg-green-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Group</h2>

        {/* Creator Name */}
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">Your Name (Creator)</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter your name"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
          />
        </div>

        {/* Group Name */}
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Group Photo */}
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">Group Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
        </div>

        <button
          onClick={handleCreateGroup}
          className="w-full green-button py-2 rounded-lg mt-4"
        >
          Create Group
        </button>

        {/* Show Invite Link */}
        {inviteLink && (
          <div className="mt-6">
            <p className="text-sm text-gray-700 mb-2">Invite Link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={inviteLink}
                readOnly
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Invite link copied to clipboard!');
                }}
                className="bg-green-500 text-white px-3 py-2 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tombol back */}
      {inviteLink && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/grouplist')}
            className="black-button px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to Group List
          </button>
        </div>
      )}
    </section>
  );
};
