import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { GalleryScan } from './Galleryscan';
import {
  MdArrowBack,
  MdPhotoLibrary,
  MdQrCodeScanner,
  MdEdit,
  MdContentCopy
} from 'react-icons/md';
import { authService } from '../services/authService';

export const Groupdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);
  const addMemberPhotoInputRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState('');

  const [showGalleryScan, setShowGalleryScan] = useState(false);
  const [selectedGalleryFile, setSelectedGalleryFile] = useState(null);

  // Form state untuk tambah member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);


  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const fetchedGroup = await authService.getGroupById(id);
        setGroup(fetchedGroup);
        setEditedName(fetchedGroup.group_name);
        setInviteLink(`${window.location.origin}/join/${fetchedGroup.group_id}`);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Implement upload or preview if needed
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemberPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMemberPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = () => {
    if (!newMemberName) return alert('Please enter member name.');

    const newMember = {
      id: Date.now(), // Simulasi ID unik
      username: newMemberName,
      photo: newMemberPhoto || null
    };

    const updatedGroup = {
      ...group,
      members: [...(group.members || []), newMember]
    };

    setGroup(updatedGroup);
    setNewMemberName('');
    setNewMemberPhoto('');
    alert('Member added successfully!');
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading group...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </section>
    );
  }

  if (!group) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Group not found.</div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 relative">
        <button onClick={() => window.history.back()} className="text-gray-700 absolute left-0">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">{group.group_name}</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-4 text-center relative">
        <div className="flex flex-col items-center relative">
          {group.photo ? (
            <img
              src={group.photo}
              alt="Group"
              className="w-24 h-24 rounded-full object-cover mb-2 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-2">
              {group.group_name?.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute right-6 top-6 text-gray-600 hover:text-black"
            title="Edit Group Photo"
          >
            <MdEdit size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <p className="text-sm text-gray-500 mt-2">{group.members?.length || 0} members</p>

          <button
            onClick={() => setShowMembers(!showMembers)}
            className="mt-4 px-4 py-2 rounded hover:underline transition"
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </button>

          {showMembers && group.members && (
            <div className="mt-4 text-left w-full">
              <p className="font-semibold mb-2">Members:</p>
              <ul>
                {group.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    {member.photo && (
                      <img
                        src={member.photo}
                        alt={member.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span>{member.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

    
      {/* TOMBOL ADD MEMBER */}
      <div className="mt-6 w-full text-left">
        {!showAddMemberForm ? (
          <button
            onClick={() => setShowAddMemberForm(true)}
            className="flex items-center gap-2 text-green-600 hover:underline text-sm"
          >
            <span className="text-xl">➕</span>
            <span>Add Member</span>
          </button>
        ) : (
          <div className="p-4 border rounded-md bg-gray-50 space-y-2">
            <input
              type="text"
              placeholder="Enter member name"
              className="w-full p-2 border rounded text-sm"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAddMemberPhoto}
              className="w-full text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddMemberForm(false);
                  setNewMemberName('');
                  setNewMemberPhoto('');
                }}
                className="text-gray-500 text-sm hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-sm"
              >
                Add Member
              </button>
            </div>
          </div>
        )}
      </div>

          {inviteLink && (
            <div className="mt-6 w-full text-left">
              <p className="text-sm font-semibold text-gray-700 mb-1">Invite Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm text-gray-600"
                  value={inviteLink}
                  readOnly
                />
                <button
                  onClick={copyInviteLink}
                  className="bg-green-500 text-white px-3 py-2 rounded flex items-center space-x-1 hover:bg-green-600"
                >
                  <MdContentCopy size={16} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-around mb-4">
        <button
          onClick={() => navigate('/quickscan', { state: { groupId: id } })}
          className="green-button py-2 px-4 rounded flex items-center space-x-2"
        >
          <MdQrCodeScanner size={20} />
          <span>Quick Scan</span>
        </button>
        <button
          onClick={() => setShowGalleryScan(true)}
          className="green-button py-2 px-4 rounded flex items-center space-x-2"
        >
          <MdPhotoLibrary size={20} />
          <span>Gallery Scan</span>
        </button>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-sm space-y-4 overflow-y-auto w-full flex-1">
        <p className="text-center text-gray-600">No bills yet.</p>
      </div>

      {showGalleryScan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              onClick={() => setShowGalleryScan(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <GalleryScan
              onClose={() => setShowGalleryScan(false)}
              onFileSelect={setSelectedGalleryFile}
              groupId={id}
            />
          </div>
        </div>
      )}
    </section>
  );
};
