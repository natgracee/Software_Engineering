import React, { useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';  // pastikan import CSS Swal
import api from '../config/api';  // Add this import

export const SplitDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billData, membersData = [] } = location.state || {};
  const [loading, setLoading] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('SplitDetail Received Data:', {
      billData,
      membersData
    });
  }, [location.state]);

  // Format rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  // Calculate subtotal
  const subtotal = billData?.items?.reduce((sum, item) => sum + (item.nominal), 0) || 0;

  const handleSave = async () => {
    try {
      setLoading(true);
      const billData = {
        group_id: location.state.billData.group_id,
        paid_by: location.state.billData.items[0].paid_by,
        items: location.state.billData.items.map(item => ({
          name: item.name,
          nominal: item.nominal,
          who_to_paid: item.who_to_paid
        })),
        bill_picture: location.state.billData.bill_picture,
        date_created: new Date()
      };

      console.log('Creating bill with data:', billData); // Debug log

      const response = await api.post('/api/bills', billData);
      
      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Bill saved successfully',
          showConfirmButton: false,
          timer: 1500
        });
        navigate(`/group/${location.state.billData.group_id}`);
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to save bill'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!billData) {
    return <div>No bill data available</div>;
  }

  // Get the payer's name
  const payer = membersData.find(m => m.id === billData.items[0]?.paid_by);

  // Calculate tax amount
  const taxAmount = billData.tax ? subtotal * billData.tax : 0;
  // Calculate service amount
  const serviceAmount = billData.service || 0;
  // Calculate discount amount
  const discountAmount = billData.discount || 0;
  // Calculate total
  const total = subtotal + taxAmount + serviceAmount - discountAmount;

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

      {/* Paid By Information */}
      {payer && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600">Paid by:</div>
          <div className="text-lg font-semibold text-green-700">{payer.name}</div>
        </div>
      )}

      {/* Daftar item */}
      <div className="bg-gray-100 p-4 rounded shadow min-h-[150px] font-mono text-sm whitespace-pre-wrap">
        {billData.items.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada item.</p>
        ) : (
          billData.items.map((item, index) => (
            <div key={index} className="mb-4 border-b border-gray-300 pb-2">
              <div className="font-semibold">
                {item.quantity}x {item.name} - {formatRupiah(item.nominal)}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.who_to_paid.length === 0 ? (
                  <span className="text-xs italic text-gray-400">Belum diassign</span>
                ) : (
                  item.who_to_paid.map(memberId => {
                    const member = membersData.find(m => m.id === memberId);
                    return member ? (
                      <span
                        key={memberId}
                        className="text-xs bg-green-300 px-2 py-0.5 rounded-full"
                      >
                        {member.name}
                      </span>
                    ) : null;
                  })
                )}
              </div>
            </div>
          ))
        )}

        {/* TAX, DISCOUNT, ADDITIONAL FEES */}
        <div className="mt-6 border-t border-gray-400 pt-4 space-y-2 text-sm text-gray-800">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {billData.tax > 0 && (
            <div className="flex justify-between">
              <span>Tax ({(billData.tax * 100).toFixed(2)}%)</span>
              <span>{formatRupiah(taxAmount)}</span>
            </div>
          )}
          {billData.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>
          )}
          {billData.service > 0 && (
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>{formatRupiah(serviceAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-gray-400 pt-2">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      {/* Tombol submit atau konfirmasi di bawah */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          className="max-w-md w-full green-button font-semibold py-3 rounded shadow transition"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Confirm Split'}
        </button>
      </div>
    </div>
  );
};
  