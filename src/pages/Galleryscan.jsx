import React from 'react';
import { useNavigate } from 'react-router-dom';

export const GalleryScan = ({ groupId, onClose }) => {
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        navigate('/scannedbill', {
          state: { image: reader.result, groupId: groupId }
        });
        onClose(); // Tutup modal setelah navigate
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h1 className="text-xl font-bold mb-4 text-black">Gallery Scan</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
