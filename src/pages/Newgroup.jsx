import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';

export const Newgroup = () => {
  const [groupName, setGroupName] = useState('');
  const [setProfilePic] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  const handleCreateGroup = async () => {
    if (!groupName) {
      alert('Please provide group name.');
      return;
    }

    if (loading) {
      alert('Please wait while we load your user data...');
      return;
    }

    if (!user) {
      alert('Please login to create a group.');
      navigate('/login');
      return;
    }

    setCreatingGroup(true);

    try {
      const groupData = {
        groupName: groupName,
      };

      const response = await authService.createGroup(groupData);

      const createdGroup = response.group;
      const groupId = createdGroup.group_id;

      const link = `${window.location.origin}/join/${groupId}`;
      setInviteLink(link);

      alert('Group Created!');

    } catch (err) {
      console.error('Error creating group:', err);
      alert(`Failed to create group: ${err.message || 'Server error'}`);
    } finally {
      setCreatingGroup(false);
    }
  };

  if (loading || creatingGroup) {
    return (
      <section className="page-container">
        <div className="bg-green-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{creatingGroup ? 'Creating Group...' : 'Loading...'}</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="bg-green-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Group</h2>

        {/* Group Name */}
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={creatingGroup}
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
            disabled={creatingGroup}
          />
        </div>

        <button
          onClick={handleCreateGroup}
          className="w-full green-button py-2 rounded-lg mt-4"
          disabled={creatingGroup}
        >
          {creatingGroup ? 'Creating...' : 'Create Group'}
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
