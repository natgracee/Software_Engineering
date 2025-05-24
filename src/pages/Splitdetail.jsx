import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';  // pastikan import CSS Swal

export const SplitDetail = () => {
  const navigate = useNavigate();

  const handleConfirmSplit = async () => {
    Swal.fire({
      title: 'Processing...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
    });

    // Simulasi delay 2 detik, bisa diganti API call async
    await new Promise(resolve => setTimeout(resolve, 2000));

    Swal.close();

    Swal.fire({
      icon: 'success',
      title: 'Split confirmed!',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 absolute left-0"
          aria-label="Back"
        >
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">Your Bills</h1>
      </div>

      <p>KONTENNYA</p>

      {/* Tombol submit atau konfirmasi di bawah */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          className="max-w-md w-full green-button font-semibold py-3 rounded shadow transition"
          onClick={handleConfirmSplit}
        >
          Confirm Split
        </button>
      </div>
    </div>
  );
};
