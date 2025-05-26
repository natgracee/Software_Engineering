import React from 'react';
import { useNavigate } from 'react-router-dom';

export const GalleryScan = () => {
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        navigate('/scannedbill', { state: { image: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-gray-100">
      <div className="bg-green-200 p-6 rounded shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-black">Gallery Scan</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
    </div>
);

};
