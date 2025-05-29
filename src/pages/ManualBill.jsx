import React, { useState } from 'react';
import { MdArrowBack, MdClear, MdAdd, MdDelete } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Fungsi format harga ke ribuan IDR
function formatPrice(num) {
  return num.toLocaleString('id-ID');
}

export const ManualBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const groupId = location.state?.groupId;

  const [billData, setBillData] = useState([]);
  const [tax, setTax] = useState(0); // dalam persen
  const [discount, setDiscount] = useState(0); // dalam persen
  const [additionalFee, setAdditionalFee] = useState(0); // nominal IDR

  function handleBack() {
    navigate(-1);
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

  function handleAddItem() {
    setBillData(prev => [
      ...prev,
      { name: '', quantity: 1, price: 0 }
    ]);
  }

  function handleDeleteItem(index) {
    setBillData(prev => prev.filter((_, i) => i !== index));
  }

  function handleClear() {
    setBillData([]);
    setTax(0);
    setDiscount(0);
    setAdditionalFee(0);
  }

  const handleConfirm = () => {
    if (!billData || billData.length === 0 || !billData.every(item => 
        item.name.trim() !== '' && 
        item.quantity > 0 && 
        item.price >= 0
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

    navigate(`/splitbill/${groupId}`, {
      state: {
        billData: {
          group_id: groupId,
          items: itemsForSplit,
          tax: tax / 100,
          discount: discount / 100,
          additionalFee: additionalFee
        }
      }
    });
  };

  const subTotal = billData.reduce((acc, cur) => acc + (cur.price * cur.quantity), 0);
  const taxAmount = (subTotal * tax) / 100;
  const discountAmount = (subTotal * discount) / 100;
  const finalTotal = subTotal + taxAmount + additionalFee - discountAmount;

  return (
    <div className="p-4 font-sans min-h-screen flex flex-col relative">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="p-1 mr-4 rounded hover:bg-gray-200 transition">
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center flex-grow">Manual Bill Entry</h1>
        {billData.length > 0 && (
          <button
            onClick={handleClear}
            className="p-1 ml-4 rounded hover:bg-gray-200 transition"
            title="Clear all items"
          >
            <MdClear size={28} />
          </button>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg text-left font-semibold text-gray-800 mb-1">Enter item details below</h2>
      </div>

      {/* Bill Data Table */}
      <div className="flex-grow overflow-auto mb-24">
        <table className="w-full bg-gray-50 rounded text-sm font-mono">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left px-3 py-2 w-16">Qty</th>
              <th className="text-left px-3 py-2">Item Name</th>
              <th className="text-right px-3 py-2 w-28">Price</th>
              <th className="text-right px-3 py-2 w-28">Action</th>
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
                  />
                </td>
                <td className="px-3 py-1">
                  <input
                    type="number"
                    min={0}
                    value={item.price}
                    onChange={e => handleChangeItem(idx, 'price', e.target.value)}
                    className="w-full rounded border border-gray-300 p-1 text-right"
                    placeholder="Price per unit"
                  />
                </td>
                <td className="px-3 py-1 text-center">
                  <button onClick={() => handleDeleteItem(idx)} className="text-red-500 hover:text-red-700">
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="px-3 py-2 text-center">
                <button onClick={handleAddItem} className="text-green-600 hover:text-green-800 flex items-center justify-center w-full">
                  <MdAdd size={24} />
                  Add Item
                </button>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr className="border-t font-semibold">
              <td colSpan={3} className="text-right px-3 py-2">Subtotal</td>
              <td className="text-right px-3 py-2">{formatPrice(subTotal)}</td>
            </tr>

            <tr>
              <td colSpan={3} className="text-right px-3 py-2">
                <label htmlFor="taxInput">Tax (%)</label>
              </td>
              <td className="px-3 py-2 text-right">
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
            </tr>

            <tr>
              <td colSpan={3} className="text-right px-3 py-2">
                <label htmlFor="discountInput">Discount (%)</label>
              </td>
              <td className="px-3 py-2 text-right">
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
            </tr>

            <tr>
              <td colSpan={3} className="text-right px-3 py-2">
                <label htmlFor="additionalFeeInput">Additional Fee (IDR)</label>
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  id="additionalFeeInput"
                  type="number"
                  min={0}
                  value={additionalFee}
                  onChange={e => setAdditionalFee(Number(e.target.value))}
                  className="w-28 rounded border border-gray-300 p-1 text-right"
                />
              </td>
            </tr>

            <tr className="border-t font-bold text-lg bg-gray-200">
              <td colSpan={3} className="text-right px-3 py-3">Total</td>
              <td className="text-right px-3 py-3">{formatPrice(finalTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleConfirm}
          className="w-full green-button font-semibold py-2 rounded"
        >
          Split Bill
        </button>
      </div>
    </div>
  );
}; 