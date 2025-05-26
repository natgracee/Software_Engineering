import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { GalleryScan } from './Galleryscan';
import {
  MdArrowBack,
  MdPhotoLibrary,
  MdQrCodeScanner,
  MdEdit,
  MdCheck,
  MdClose
} from 'react-icons/md';
import { authService } from '../services/authService';

export const Groupdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showGalleryScan, setShowGalleryScan] = useState(false);
  const [selectedGalleryFile, setSelectedGalleryFile] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedGroup = await authService.getGroupById(id);
        setGroup(fetchedGroup);
        setEditedName(fetchedGroup.group_name);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details.');
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  const handleConfirmEdit = () => {
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditedName(group?.group_name || '');
    setEditIndex(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
    };
    reader.readAsDataURL(file);
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
            disabled={loading}
          >
            <MdEdit size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            disabled={loading}
          />

          <p className="text-sm text-gray-500 mt-2">{/*group.members.length*/ 0} members</p>

          <button
            onClick={() => setShowMembers(!showMembers)}
            className="mt-4 px-4 py-2 rounded hover:underline transition"
            disabled={loading}
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </button>

          {showMembers && (
            <div className="mt-4 text-left w-full">
              <p className="font-semibold mb-2">Members:</p>
              <ul>
                {/* {group.members.map((member, index) => (
                  <li key={index} className="text-sm text-gray-700">{member}</li>
                ))} */}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-around mb-4">
        <button
          onClick={() => navigate('/quickscan')}
          className="green-button py-2 px-4 rounded flex items-center space-x-2"
          disabled={loading}
        >
          <MdQrCodeScanner size={20} />
          <span>Quick Scan</span>
        </button>
        <button
          onClick={() => setShowGalleryScan(true)}
          className="green-button py-2 px-4 rounded flex items-center space-x-2"
          disabled={loading}
        >
          <MdPhotoLibrary size={20} />
          <span>Gallery Scan</span>
        </button>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-sm space-y-4 overflow-y-auto w-full flex-1">
        <p className="text-center text-gray-600">No bills yet.</p>
      </div>

      {showGalleryScan && (
        <GalleryScan
          onClose={() => setShowGalleryScan(false)}
          onFileSelect={setSelectedGalleryFile}
        />
      )}
    </section>
  );
};
