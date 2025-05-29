import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPhotoLibrary, MdClose } from 'react-icons/md';

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
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdPhotoLibrary className="text-green-500" size={24} />
            Gallery Scan
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label 
            htmlFor="file-upload" 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <MdPhotoLibrary className="text-gray-400 mb-2" size={32} />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
            </div>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => document.getElementById('file-upload').click()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
};
