import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdDelete } from 'react-icons/md';
import Swal from 'sweetalert2';

// Fungsi format harga ke ribuan IDR
function formatPrice(num) {
  return num.toLocaleString('id-ID');
}

export const ManualBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billData, setBillData] = useState([]);
  const [tax, setTax] = useState(0); // dalam persen
  const [discount, setDiscount] = useState(0); // dalam persen
  const [additionalFee, setAdditionalFee] = useState(0); // nominal IDR

  function handleBack() {
    navigate(-1);
  }

  function handleAddItem() {
    setBillData(prev => [...prev, { name: '', quantity: 1, price: 0 }]);
  }

  function handleDeleteItem(index) {
    setBillData(prev => prev.filter((_, i) => i !== index));
  }

  function handleChangeItem(index, field, value) {
    setBillData(prev => {
      const newData = [...prev];
      if (field === 'quantity' || field === 'price') {
        const numValue = Number(value);
        newData[index][field] = numValue >= 0 ? numValue : 0;
      } else {
        newData[index][field] = value;
      }
      return newData;
    });
  }

  const handleConfirm = () => {
    if (!billData || billData.length === 0 || !billData.every(item => 
        item.name.trim() !== '' && 
        item.quantity > 0 && 
        item.price > 0
    )) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Split Bill',
        text: 'Please add and validate bill items before splitting.',
      });
      return;
    }

    // Prepare the items with calculated total nominal for Splitbill
    const itemsForSplit = billData.map(item => ({
      name: item.name,
      nominal: item.price * item.quantity,
      quantity: item.quantity,
      who_to_paid: []
    }));

    navigate(`/splitbill/${id}`, {
      state: {
        billData: {
          group_id: id,
          items: itemsForSplit,
          tax: tax / 100,
          discount: discount / 100,
          additionalFee: additionalFee,
          bill_picture: null,
          is_manual: true
        }
      }
    });
  };

  // Hitung subtotal tanpa tax dan discount
  const subTotal = billData.reduce((acc, cur) => acc + (cur.price * cur.quantity), 0);

  // Hitung nilai pajak, diskon, dan total akhir
  const taxAmount = (subTotal * tax) / 100;
  const discountAmount = (subTotal * discount) / 100;
  const finalTotal = subTotal + taxAmount + additionalFee - discountAmount;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header - Fixed */}
      <div className="flex items-center p-4 bg-white border-b">
        <button onClick={handleBack} className="p-1 mr-4 rounded hover:bg-gray-200 transition">
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center flex-grow">Manual Bill Entry</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg text-left font-semibold text-gray-800 mb-1">Add Bill Items</h2>
          <p className="text-sm text-left text-gray-600">
            Enter the items from your bill manually
          </p>
        </div>

        {/* Bill Data Table */}
        <div className="overflow-x-auto bg-gray-50 rounded shadow-sm mb-4">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left px-3 py-2 w-16 min-w-[64px]">Qty</th>
                <th className="text-left px-3 py-2 min-w-[150px]">Item Name</th>
                <th className="text-right px-3 py-2 w-28 min-w-[112px]">Price</th>
                <th className="text-right px-3 py-2 w-28 min-w-[112px]">Total</th>
                <th className="text-center px-3 py-2 w-12 min-w-[48px]"></th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-3 py-1">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                      className="w-full rounded border border-gray-300 p-1 text-right"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleChangeItem(idx, 'name', e.target.value)}
                      className="w-full rounded border border-gray-300 p-1"
                      placeholder="Enter item name"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={e => handleChangeItem(idx, 'price', e.target.value)}
                      className="w-full rounded border border-gray-300 p-1 text-right"
                    />
                  </td>
                  <td className="px-3 py-1 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                  <td className="px-3 py-1 text-center">
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t font-semibold">
                <td colSpan={3} className="text-right px-3 py-2">Subtotal</td>
                <td className="text-right px-3 py-2">{formatPrice(subTotal)}</td>
                <td></td>
              </tr>

              {/* Tax input */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">
                  <label htmlFor="taxInput">Tax (%)</label>
                </td>
                <td className="text-right px-3 py-2">
                  <input
                    id="taxInput"
                    type="number"
                    min={0}
                    max={100}
                    value={tax}
                    onChange={e => setTax(Number(e.target.value))}
                    className="w-20 rounded border border-gray-300 p-1 text-right"
                  />
                </td>
                <td></td>
              </tr>

              {/* Discount input */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">
                  <label htmlFor="discountInput">Discount (%)</label>
                </td>
                <td className="text-right px-3 py-2">
                  <input
                    id="discountInput"
                    type="number"
                    min={0}
                    max={100}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-20 rounded border border-gray-300 p-1 text-right"
                  />
                </td>
                <td></td>
              </tr>

              {/* Additional Fee input */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">
                  <label htmlFor="additionalFeeInput">Additional Fee (IDR)</label>
                </td>
                <td className="text-right px-3 py-2">
                  <input
                    id="additionalFeeInput"
                    type="number"
                    min={0}
                    value={additionalFee}
                    onChange={e => setAdditionalFee(Number(e.target.value))}
                    className="w-28 rounded border border-gray-300 p-1 text-right"
                  />
                </td>
                <td></td>
              </tr>

              {/* Final total */}
              <tr className="border-t font-bold text-lg bg-gray-200">
                <td colSpan={3} className="text-right px-3 py-3">Total</td>
                <td className="text-right px-3 py-3">{formatPrice(finalTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Add Item Button */}
        <button
          onClick={handleAddItem}
          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <MdAdd size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Action Buttons - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleConfirm}
          className="w-full green-button font-semibold py-3 rounded-lg shadow-sm transition"
        >
          Split Bill
        </button>
      </div>
    </div>
  );
}; 