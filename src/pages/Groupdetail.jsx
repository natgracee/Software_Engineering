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

export const Groupdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);

  const [showGalleryScan, setShowGalleryScan] = useState(false);
  const [selectedGalleryFile, setSelectedGalleryFile] = useState(null);

  // Ambil data grup dari localStorage saat komponen mount atau id berubah
  useEffect(() => {
    const storedGroups = JSON.parse(localStorage.getItem('groups')) || [];
    const selectedGroup = storedGroups.find((g, i) => g.id === id || i.toString() === id);
    setGroup(selectedGroup || null);
    setShowMembers(false);
    setEditIndex(null);
    setEditedName('');
  }, [id]);

  // Fungsi update group di localStorage dan state
  const updateGroupInStorage = (updatedGroup) => {
    setLoading(true);
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const index = groups.findIndex((g, i) => g.id === id || i.toString() === id);
    if (index !== -1) {
      groups[index] = updatedGroup;
      localStorage.setItem('groups', JSON.stringify(groups));
      setGroup(updatedGroup);
    }
    setLoading(false);
  };

  // Handle input foto dari kamera langsung (file input)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedGroup = { ...group, photo: reader.result };
      updateGroupInStorage(updatedGroup);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input agar bisa upload file sama lagi
  };


  // Setelah user pilih foto dari galeri, simpan file dan tampilkan GalleryScan
  const handleGalleryChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedGalleryFile(file);
    setShowGalleryScan(true);

    e.target.value = null; // reset input
  };

  // Callback dari GalleryScan setelah selesai scan bill
  const handleGalleryScanComplete = (textResult) => {
    setShowGalleryScan(false);
    setSelectedGalleryFile(null);

    // Contoh: kamu bisa simpan hasil scan ke state grup, atau tampilkan hasil, dll.
    alert('Hasil scan bill: ' + textResult);
    // Kalau mau simpan di group misal:
    // const updatedGroup = { ...group, lastBillScan: textResult };
    // updateGroupInStorage(updatedGroup);
  };

  // Handle simpan nama member yang diedit
  const handleSaveMemberName = () => {
    if (!editedName.trim()) return; // kalau kosong, jangan simpan

    const updatedMembers = [...group.members];
    updatedMembers[editIndex] = editedName.trim();
    const updatedGroup = { ...group, members: updatedMembers };
    updateGroupInStorage(updatedGroup);
    setEditIndex(null);
    setEditedName('');
  };

  if (!group) {
    return <p className="p-6 text-center">Group not found.</p>;
  }

  return (
    <section className="px-4 pt-6 pb-24 bg-gray-100 min-h-screen relative">
      {/* Input tersembunyi untuk galeri */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative">
        <button onClick={() => window.history.back()} className="text-gray-700 absolute left-0">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">{group.name}</h1>
      </div>

      {/* Info Grup */}
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
              {group.name?.charAt(0).toUpperCase()}
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

          {/* Input tersembunyi untuk kamera / upload foto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            disabled={loading}
          />

          <p className="text-sm text-gray-500 mt-2">{group.members.length} members</p>

          <button
            onClick={() => setShowMembers(!showMembers)}
            className="mt-4 px-4 py-2 rounded hover:underline transition"
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </button>
        </div>
      </div>

      {/* Daftar Member */}
      {showMembers && (
        <div className="bg-white p-4 rounded-lg shadow space-y-2 mb-20">
          {group.members?.map((member, idx) => (
            <div
              key={idx}
              className="flex text-left items-center gap-4 p-3 border-b last:border-b-0"
            >
              <div className="flex-1">
                {editIndex === idx ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveMemberName();
                      else if (e.key === 'Escape') {
                        setEditIndex(null);
                        setEditedName('');
                      }
                    }}
                  />
                ) : (
                  <p className="font-medium text-gray-800">{member}</p>
                )}
              </div>

              <div className="flex gap-2">
                {editIndex === idx ? (
                  <>
                    <button
                      onClick={handleSaveMemberName}
                      title="Save"
                      className="text-green-600 hover:text-green-800"
                    >
                      <MdCheck size={20} />
                    </button>

                    <button
                      onClick={() => {
                        setEditIndex(null);
                        setEditedName('');
                      }}
                      title="Cancel"
                      className="text-red-600 hover:text-red-800"
                    >
                      <MdClose size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditIndex(idx);
                      setEditedName(member);
                    }}
                    title="Edit Member Name"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <MdEdit size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Komponen GalleryScan muncul saat showGalleryScan true */}
      {showGalleryScan && selectedGalleryFile && (
        <GalleryScan
          file={selectedGalleryFile}
          onComplete={handleGalleryScanComplete}
          onCancel={() => {
            setShowGalleryScan(false);
            setSelectedGalleryFile(null);
          }}
        />
      )}

      {/* Tombol Scan & Galeri */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <div className="flex justify-between gap-4">

          {/* scan */}
          <button
            onClick={() => navigate('/quickscan')}
            className="flex-1 green-button font-semibold px-4 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
            disabled={loading}
          >
            <MdQrCodeScanner size={20} />
            Quick Scan
          </button>

          {/* gallery */}
          <button
            onClick={() => navigate('/galleryscan')}
            className="flex-1 black-button font-semibold px-4 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
            disabled={loading}
          >
            <MdPhotoLibrary size={20} />
            Select Photo
          </button>
        </div>
      </div>
    </section>
  );
};
