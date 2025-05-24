import { MdArrowBack, MdEdit } from 'react-icons/md';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Account = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profilePic, setProfilePic] = useState('/path/to/profile-pic.jpg'); // Gambar default profil
  const [isProfilePicEditing, setIsProfilePicEditing] = useState(false); // State untuk mengontrol profil gambar edit
  const navigate = useNavigate(); // Hook untuk navigasi

  const handleConfirmEdit = () => {
    if (newUsername && newUsername !== username) setUsername(newUsername);
    if (newEmail && newEmail !== email) setEmail(newEmail);
    setIsEditing(false);
    setIsProfilePicEditing(false); // Menutup edit profil pic setelah simpan
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setIsProfilePicEditing(false); // Menutup profil pic edit setelah simpan
      };
      reader.readAsDataURL(file);
    }
  };

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

      {/* Profile Section */}
      <div className="bg-gray-200 p-6 rounded-lg shadow-sm space-y-4 max-w-md w-full">
        {/* Foto Profil */}
        <div className="relative flex justify-center group">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tombol Edit Profil Pic */}
          {isEditing && !isProfilePicEditing && (
            <button
              onClick={() => setIsProfilePicEditing(true)} // Memulai edit gambar profil
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
