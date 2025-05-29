import { MdArrowBack, MdEdit } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

export const Account = () => {
  const { user, updateUser } = useUser();
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
    <section className="px-4 py-6 min-h-screen flex items-center justify-center">
      {/* Header */}
      <div className="absolute left-0 top-6 flex items-center justify-between w-full mb-6 px-4">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700"
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">Profile</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-gray-200 p-6 rounded-lg shadow-sm space-y-4 max-w-md w-full">
        {/* Foto Profil */}
        <div className="relative flex justify-center group">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-4xl text-gray-400">{username?.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Tombol Edit Profil Pic */}
          {isEditing && !isProfilePicEditing && (
            <button
              onClick={() => setIsProfilePicEditing(true)}
              className="absolute bottom-0 translate-x-1/2 translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
            >
              <MdEdit size={16} />
            </button>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-1 text-left">Username</label>
          {!isEditing ? (
            <p className="text-base font-medium text-gray-800 text-left">{username}</p>
          ) : (
            <input
              type="text"
              value={newUsername || username}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-1 text-left">Email</label>
          {!isEditing ? (
            <p className="text-base font-medium text-gray-800 text-left">{email}</p>
          ) : (
            <input
              type="email"
              value={newEmail || email}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
          )}
        </div>

        {/* Edit / Confirm Button */}
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="green-button rounded-lg w-full shadow-md transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleConfirmEdit}
              className="bg-blue-500 text-white p-3 rounded-lg w-full shadow-md hover:bg-blue-600 transition"
            >
              Confirm Changes
            </button>
          )}
        </div>
      </div>

      {/* Delete Account Button */}
      <div className="absolute text-sm bottom-50 left-1/2 transform -translate-x-1/2 w-full px-4">
        <button
          onClick={handleDeleteAccount}
          className="red-button rounded-lg shadow-md transition"
        >
          Delete Account
        </button>
      </div>

      {/* Modal / Gallery Access */}
      {isProfilePicEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h2 className="text-xl font-semibold">Change Profile Picture</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="mt-2 w-full"
            />
            <button
              onClick={() => setIsProfilePicEditing(false)}
              className="mt-4 green-button text-white p-2 rounded-lg w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
