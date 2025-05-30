import { MdArrowBack, MdEdit } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

export const Account = () => {
  const { user, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [isProfilePicEditing, setIsProfilePicEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Update local state when user context changes
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setProfilePic(user.profile_picture ? `http://localhost:5000/uploads/profile-photos/${user.profile_picture}` : null);
      setIsLoading(false);
    }
  }, [user]);

  const handleConfirmEdit = async () => {
    try {
      const updateData = {};
      if (newUsername && newUsername !== username) updateData.username = newUsername;
      if (newEmail && newEmail !== email) updateData.email = newEmail;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await authService.updateProfile(updateData);
      // Update the global user state
      updateUser(response.user);
      
      setUsername(response.user.username);
      setEmail(response.user.email);
      setNewUsername('');
      setNewEmail('');
      setIsEditing(false);
      setIsProfilePicEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await authService.deleteAccount();
        await authService.logout();
        navigate('/login');
      } catch (err) {
        setError('Failed to delete account');
        console.error('Account deletion error:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout(); // Clear user context
      navigate('/login');
    } catch (err) {
      setError('Failed to logout');
      console.error('Logout error:', err);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await authService.updateProfilePhoto(formData);
      
      // Update the profile picture in the UI
      setProfilePic(`http://localhost:5000/uploads/profile-photos/${response.profile_picture}`);
      
      // Update the user context with new profile picture
      updateUser({
        ...user,
        profile_picture: response.profile_picture
      });

      setIsProfilePicEditing(false);
    } catch (error) {
      setError('Failed to update profile picture');
      console.error('Error updating profile picture:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => window.history.back()}
            className="text-gray-700 hover:text-gray-900"
          >
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-xl font-semibold text-center flex-1">Profile</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-md">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-5xl text-gray-400">{username?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              {isEditing && !isProfilePicEditing && (
                <button
                  onClick={() => setIsProfilePicEditing(true)}
                  className="absolute bottom-0 right-0 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition"
                >
                  <MdEdit size={20} />
                </button>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">{username}</h2>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
              {!isEditing ? (
                <p className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg">{username}</p>
              ) : (
                <input
                  type="text"
                  value={newUsername || username}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new username"
                />
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
              {!isEditing ? (
                <p className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg">{email}</p>
              ) : (
                <input
                  type="email"
                  value={newEmail || email}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new email"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-sm hover:bg-blue-600 transition font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleConfirmEdit}
                className="w-full bg-green-500 text-white p-3 rounded-lg shadow-sm hover:bg-green-600 transition font-medium"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg shadow-sm hover:bg-gray-200 transition font-medium"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 text-white p-3 rounded-lg shadow-sm hover:bg-red-600 transition font-medium"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Profile Picture Edit Modal */}
      {isProfilePicEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Change Profile Picture</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsProfilePicEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsProfilePicEditing(false)}
                  className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
