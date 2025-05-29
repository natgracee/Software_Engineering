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

  // Ensure billData.items is a valid array, default to empty array if not
  // Add logging to debug the value before creating billItems
  console.log('Debug: billData before creating billItems:', billData);
  const billItems = Array.isArray(billData?.items) ? billData.items : [];
   console.log('Debug: billItems after creation:', billItems);

  // Debug logs
  useEffect(() => {
    console.log('SplitDetail Received Data:', {
      billData,
      membersData,
      paid_by: billData?.paid_by
    });
    console.log('Processed billItems in useEffect:', billItems);
  }, [billData, membersData, billItems]);

  // Format rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  // Calculate subtotal
  console.log('Debug: billItems before reduce for subtotal:', billItems);
  const subtotal = billItems.reduce((sum, item) => {
    const itemPrice = Number(item.nominal) || 0;
    const itemQuantity = Number(item.quantity) || 1;
    return sum + (itemPrice * itemQuantity);
  }, 0);

  // Get the payer's name from the first item's paid_by
  const payerId = billItems.length > 0 ? billItems[0].paid_by : null;
  console.log('Debug: payerId:', payerId);
  const payer = payerId ? membersData.find(m => m.id === payerId) : null;
  console.log('Debug: found payer:', payer);

  // Calculate total - assuming tax, discount, and additionalFee are present in billData
  const taxRate = Number(billData.tax) || 0;
  const discountRate = Number(billData.discount) || 0;
  const additionalFeeAmount = Number(billData.additionalFee) || 0;

  const taxAmount = subtotal * taxRate;
  const discountAmount = subtotal * discountRate;
  const total = subtotal + taxAmount + additionalFeeAmount - discountAmount;

  console.log('Debug: Calculation values:', {
    subtotal,
    taxRate,
    discountRate,
    additionalFeeAmount,
    taxAmount,
    discountAmount,
    total
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare items for backend, using the already calculated nominal
      const itemsForSave = billItems.map(item => ({
        name: item.name,
        nominal: item.nominal,
        who_to_paid: item.who_to_paid || []
      }));

      const billDataToSave = {
        group_id: billData?.group_id,
        paid_by: payerId, // Use the payerId from the first item
        items: itemsForSave,
        tax: taxRate,
        discount: discountRate,
        service: additionalFeeAmount,
        bill_picture: billData?.bill_picture || null,
        date_created: new Date()
      };

      console.log('Creating bill with data:', billDataToSave);

      const response = await api.post('/api/bills', billDataToSave);

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Bill saved successfully',
          showConfirmButton: false,
          timer: 1500
        });
        navigate(`/group/${billData?.group_id}`);
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
    return <div>Loading bill data...</div>; // Indicate loading or no data
  }

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
        {/* Use billItems for rendering, checking its length */}
        {billItems.length === 0 ? (
          <p className="text-gray-500 italic">Tidak ada item.</p>
        ) : (
          billItems.map((item, index) => (
            <div key={index} className="mb-4 border-b border-gray-300 pb-2">
              <div className="font-semibold">
                {/* Display quantity and nominal (total price per item) */}
                {item.quantity}x {item.name} - {formatRupiah(item.nominal)}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.who_to_paid?.length === 0 || !item.who_to_paid ? ( // Use optional chaining
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
          {taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
              <span>{formatRupiah(taxAmount)}</span>
            </div>
          )}
          {discountRate > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>
          )}
          {additionalFeeAmount > 0 && (
            <div className="flex justify-between">
              <span>Additional Fee</span>
              <span>{formatRupiah(additionalFeeAmount)}</span>
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
  