import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';  // pastikan import CSS Swal

export const SplitDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billItems = [], assignments = {}, membersData = [], tax, discount, additionalFee } = location.state || {};

  // Format rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  // Hitung subtotal
  const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

      {/* Daftar item */}
      <div className="bg-gray-100 p-4 rounded shadow min-h-[150px] font-mono text-sm whitespace-pre-wrap">
        {billItems.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada item.</p>
        ) : (
          billItems.map((item, index) => {
            const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
            const assignedMembers = assignments[itemId] || [];

            return (
              <div key={itemId} className="mb-4 border-b border-gray-300 pb-2">
                <div className="font-semibold">
                  {item.quantity}x {item.name} - Rp {item.price}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {assignedMembers.length === 0 ? (
                    <span className="text-xs italic text-gray-400">Belum diassign</span>
                  ) : (
                    assignedMembers.map(memberId => {
                      const member = membersData.find(m => m.id === memberId);
                      return (
                        <span
                          key={memberId}
                          className="text-xs bg-green-300 px-2 py-0.5 rounded-full"
                        >
                          {member?.name}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* TAX, DISCOUNT, ADDITIONAL FEES */}
        {(tax !== undefined || discount !== undefined || additionalFee !== undefined) && (
          <div className="mt-6 border-t border-gray-400 pt-4 space-y-2 text-sm text-gray-800">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {tax !== undefined && (
              <div className="flex justify-between">
                <span>Tax ({(tax * 100).toFixed(2)}%)</span>
                <span>{formatRupiah(subtotal * tax)}</span>
              </div>
            )}
            {discount !== undefined && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>- {formatRupiah(discount)}</span>
              </div>
            )}
            {additionalFee !== undefined && (
              <div className="flex justify-between">
                <span>Additional Fee</span>
                <span>{formatRupiah(additionalFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-gray-400 pt-2">
              <span>Total</span>
              <span>
                {formatRupiah(
                  subtotal +
                  (tax ? subtotal * tax : 0) +
                  (additionalFee || 0) -
                  (discount || 0)
                )}
              </span>
            </div>
          </div>
        )}
      </div>

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
  