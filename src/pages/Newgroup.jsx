import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { MdArrowBack, MdGroup, MdImage, MdContentCopy } from 'react-icons/md';

export const Newgroup = () => {
  const [groupName, setGroupName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        profilePicture: profilePic
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
      <section className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
            <p className="text-center mt-4 text-gray-600 font-medium">
              {creatingGroup ? 'Creating your group...' : 'Loading...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack size={24} />
            <span className="ml-2">Back</span>
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MdGroup size={24} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
          </div>

        {/* Group Name */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={creatingGroup}
          />
        </div>

        {/* Group Photo */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Group Photo (Optional)</label>
            <div className="relative">
          <input
            type="file"
            accept="image/*"
                className="hidden"
                id="group-photo"
                onChange={handleFileChange}
            disabled={creatingGroup}
          />
              <label
                htmlFor="group-photo"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Group preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <MdImage className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                  </div>
                )}
              </label>
            </div>
        </div>

        <button
          onClick={handleCreateGroup}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          disabled={creatingGroup}
        >
          {creatingGroup ? 'Creating...' : 'Create Group'}
        </button>

        {/* Show Invite Link */}
        {inviteLink && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Invite Link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-white"
                value={inviteLink}
                readOnly
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Invite link copied to clipboard!');
                }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                  <MdContentCopy size={20} />
                  <span>Copy</span>
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Back to Group List Button */}
      {inviteLink && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/grouplist')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Group List
          </button>
        </div>
      )}
      </div>
    </section>
  );
};
