import React, { useEffect, useState } from 'react';
import {
  MdArrowBack,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdShare,
} from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import api from '../config/api';

export const SplitDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { billData, membersData = [] } = location.state || {};
  const member = membersData.length > 0 ? membersData[0] : { name: 'Member' };

  const [showAllItems, setShowAllItems] = useState(false);

  useEffect(() => {
    console.log('SplitDetail Received Data:', {
      billData,
      membersData,
    });
  }, [location.state]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(number);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const subtotal =
    billData?.items?.reduce(
      (sum, item) => sum + item.nominal * (item.quantity || 1),
      0
    ) || 0;
  const taxAmount = billData?.tax ? subtotal * billData.tax : 0;
  const serviceAmount = billData?.service || 0;
  const discountAmount = billData?.discount || 0;
  const total = subtotal + taxAmount + serviceAmount - discountAmount;

  const payer =
    membersData.find((m) => m.id === billData?.items?.[0]?.paid_by) || {
      name: 'Member',
    };

  const displayedItems = showAllItems
    ? billData?.items || []
    : (billData?.items || []).slice(0, 2);

  const handleToggleItems = () => {
    setShowAllItems((prev) => !prev);
  };

  // Dummy share handler pakai Swal
  const handleShare = () => {
    Swal.fire({
      icon: 'info',
      title: 'Share',
      text: 'Sharing bill details feature is not implemented yet.',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Hitung total tagihan member
  // Total yang harus dibayar member ini ke siapa
  // Dari struktur item, asumsikan who_to_paid berisi id yang menerima pembayaran
  const memberTotal = billData?.items
    ?.filter((item) =>
      item.who_to_paid ? item.who_to_paid.includes(member.id) : false
    )
    .reduce(
      (sum, item) => sum + item.nominal * (item.quantity || 1),
      0
    ) || 0;

  // Cari nama yang harus dibayar member ini
  // Asumsikan semua item dibayar ke orang yang sama, ambil dari item pertama
  let payeeName = '-';
  if (billData?.items?.length > 0) {
    const payeeId = billData.items[0].paid_by;
    const payee = membersData.find((m) => m.id === payeeId);
    payeeName = payee ? payee.name : '-';
  }

  if (!billData) {
    return <div>No bill data available</div>;
  }

  const isConfirmDisabled =
    !billData?.group_id ||
    !billData?.items?.length ||
    !billData?.items[0]?.paid_by;

  const handleConfirmSplit = async () => {
     // Debug log to see what data we're sending
    console.log('Bill Data Structure:', {
      group_id: billData.group_id,
      items: billData.items,
      paid_by: billData.items[0]?.paid_by,
      tax: billData.tax,
      service: billData.service,
      discount: billData.discount
    });

    if (!billData.group_id) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Group ID',
        text: 'Group ID is required to save the bill',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!billData.items || billData.items.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Items',
        text: 'At least one item is required to save the bill',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!billData.items[0]?.paid_by) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Payer',
        text: 'Payer information is required to save the bill',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

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

    try {
      const response = await api.post('/api/bills', {
        group_id: billData.group_id,
        paid_by: billData.items[0].paid_by,
        items: billData.items.map((item) => ({
          name: item.name,
          nominal: item.nominal,
          who_to_paid: item.who_to_paid,
        })),
        date_created: new Date().toISOString(),
      });

    console.log('Server response:', response.data);

    Swal.close();

    Swal.fire({
      icon: 'success',
      title: 'Split confirmed and saved!',
      timer: 2000,
      showConfirmButton: false,
    });

    navigate(`/group/${billData.group_id}`);

    } catch (error) {
      Swal.close();

      const errorMessage =
      error.response?.data?.error || error.message || 'Failed to save bill';

      Swal.fire({
        icon: 'error',
        title: 'Failed to save bill',
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };


    if (!billData) {
    return <div>No bill data available</div>;
  }

  // // Get the payer's name
  // const payer = membersData.find(m => m.id === billData.items[0]?.paid_by);

  // // Calculate tax amount
  // const taxAmount = billData.tax ? subtotal * billData.tax : 0;
  // // Calculate service amount
  // const serviceAmount = billData.service || 0;
  // // Calculate discount amount
  // const discountAmount = billData.discount || 0;
  // // Calculate total
  // const total = subtotal + taxAmount + serviceAmount - discountAmount;

  
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

      {/* Header */}
      <div>
        <div className='text-left font-semibold text-green-800'>Bill detail</div>
        <div className='text-left flex mt-2 font-semibold text-xl'>apakah mau ditambahkan nama tempat makannya, kalau tidak sung hapus saja</div>
        <div className="text-sm text-left text-gray-500 mt-1">Created on: {formatDate(billData.date_created)}</div>
        <div className="flex justify-between items-center mt-2 font-bold text-green-800 text-2xl">
          <span>IDR {formatRupiah(total)}</span>
          <button
            onClick={handleShare}
            className="text-blue-600 hover:text-blue-800 flex text-sm items-center gap-1"
            aria-label="Share bill details"
          >
            <MdShare size={15} />
            Share
          </button>
        </div>
      </div>

      {/* Box "You owe ..." */}
      <div className="py-2 px-4 bg-green-100 rounded text-center max-w-md mx-auto mt-5">
        <span className="text-gray-600">You owe </span>
        <span className="text-red-600 font-semibold">{formatRupiah(total)}</span>
        <span className="text-gray-600"> to {payeeName}</span>
      </div>

      {/* Detail per member */}
      <div className="mb-6 mt-5 border-b pb-3">
        <div className="flex justify-between items-center">
          <div className="text-left text-lg text-gray-700 font-semibold">{member.name}'s total</div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-xl font-bold">{formatRupiah(total)}</div>
          <button
            onClick={handleToggleItems}
            className="flex items-center cursor-pointer text-gray-500"
            aria-expanded={showAllItems}
            aria-controls="bill-details"
          >
            <span className="font-semibold mr-2">Bill Details</span>
            {showAllItems ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
          </button>
        </div>
      </div>

      {/* Bill Details List */}
      <div
        id="bill-details"
        className="bg-white shadow rounded p-1 max-h-96 overflow-auto"
      >
        {/* Items */}
        {displayedItems.map((item, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 py-1 border-b border-gray-100 text-sm">
            <div className="col-span-3 text-left truncate">{item.name}</div>
            <div className="col-span-1 text-center">{item.quantity || 1}x</div>
            <div className="col-span-2 text-right">
              {formatRupiah(item.nominal * (item.quantity || 1))}
            </div>
          </div>
        ))}

      {/* Summary biaya */}
      <div className="pt-4 space-y-2 text-sm text-gray-800">
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
        {/* <div className="flex justify-between font-semibold border-t border-gray-400 pt-2">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div> */}
      </div>
    </div>

      {/* Confirm Button */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          className="max-w-md w-full green-button font-semibold py-3 rounded shadow transition disabled:opacity-50"
          onClick={handleConfirmSplit}
          disabled={isConfirmDisabled}
          aria-label="Confirm bill split"
        >
          Confirm Split
        </button>
      </div>
    </div>
  );
};
