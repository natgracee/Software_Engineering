import React, { useEffect, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdClear } from 'react-icons/md';
import { llmService } from '../services/llmService';

// Fungsi format harga ke ribuan IDR
function formatPrice(num) {
  return num.toLocaleString('id-ID');
}

export const Scannedbill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const groupId = location.state?.groupId; 
  const [ocrText, setOcrText] = useState('');
  const [status, setStatus] = useState('Memuat gambar...');
  const [billData, setBillData] = useState(null); // array of {name, quantity, price}
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);

  // State tambahan untuk tax, discount, additional fee
  const [tax, setTax] = useState(0); // dalam persen, contoh 10 artinya 10%
  const [discount, setDiscount] = useState(0); // dalam persen
  const [additionalFee, setAdditionalFee] = useState(0); // nominal IDR

  const image = location.state?.image;

  const processWithLLM = async (text) => {
    try {
      setStatus('Memproses dengan AI...');
      const result = await llmService.processBillText(text);
      if (result.success) {
        setBillData(result.items);
        setStatus('Selesai!');
      } else {
        throw new Error(result.error || 'Failed to process with AI');
      }
    } catch (error) {
      console.error('LLM processing error:', error);
      setStatus('Gagal memproses dengan AI, menggunakan parser default...');
      const parsed = parseOcrTextToBillData(text);
      setBillData(parsed);
    }
  };

  const parseOcrTextToBillData = (text) => {
    const lines = text.split('\n').filter(Boolean);
    const items = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const quantity = parseInt(parts[0], 10);
        const price = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
          const name = parts.slice(1, parts.length - 1).join(' ');
          items.push({ name, quantity, price });
        }
      }
    });

    return items.length ? items : null;
  };

  useEffect(() => {
    if (!image) {
      setStatus('Gambar tidak ditemukan, kembali ke awal...');
      setTimeout(() => navigate('/quickscan'), 2000);
      return;
    }

    if (processingRef.current) {
      return;
    }

    setStatus('Memproses OCR...');
    setLoading(true);
    processingRef.current = true;

    Tesseract.recognize(image, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setStatus(`Memproses OCR... ${Math.floor(m.progress * 100)}%`);
        }
      },
    })
      .then(({ data: { text } }) => {
        setLoading(false);
        setOcrText(text);
        console.log('OCR Text:', text);
        return processWithLLM(text);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
        setStatus('Gagal memproses OCR');
        processingRef.current = false;
      });

    return () => {
      processingRef.current = false;
    };
  }, [image, navigate]);

  function handleBack() {
    navigate(-1);
  }

  function handleEditBill() {
    setIsEditing(true);
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

  function handleSaveEdit() {
    if (billData && billData.length > 0 && billData.every(item => item.name.trim() !== '' && item.quantity > 0 && item.price > 0)) {
      setIsEditing(false);
    } else {
      alert('Pastikan semua item memiliki nama, quantity > 0, dan harga > 0');
    }
  }

  function handleConfirm() {
    if (!billData || billData.length === 0) {
      alert('Data bill belum tersedia atau kosong');
      return;
    }
    if (groupId) {
      // Kirim juga tax, discount, additionalFee
      navigate(`/splitbill/${groupId}`, { state: { billData, tax, discount, additionalFee } });
    } else {
      alert('Group ID not available. Cannot proceed to split bill.');
    }
  }

  function handleClear() {
    setBillData(null);
    setOcrText('');
    setStatus('Silakan scan ulang gambar');
    setIsEditing(false);
    setTax(0);
    setDiscount(0);
    setAdditionalFee(0);
  }

  // Hitung subtotal tanpa tax dan discount
  const subTotal = billData ? billData.reduce((acc, cur) => acc + cur.price, 0) : 0;

  // Hitung nilai pajak, diskon, dan total akhir
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
        <h1 className="text-xl font-semibold text-center flex-grow">Your Bills</h1>
        {billData && (
          <button
            onClick={handleClear}
            className="p-1 ml-4 rounded hover:bg-gray-200 transition"
            title="Clear scanned data"
          >
            <MdClear size={28} />
          </button>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg text-left font-semibold text-gray-800 mb-1">Recognized items</h2>
        <p className="text-sm text-left text-gray-600">
          Make sure to check that all items were read correctly
        </p>
      </div>

      {/* Status & Loading */}
      <div className="mb-4 text-sm text-gray-700 font-mono">
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>{status}</span>
          </div>
        ) : (
          <p>{status}</p>
        )}
      </div>

      {/* Bill Data Table */}
      <div className="flex-grow overflow-auto mb-24">
        {!isEditing && billData && (
          <table className="w-full bg-gray-100 rounded text-sm font-mono">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left px-3 py-2 w-16">Qty</th>
                <th className="text-left px-3 py-2">Item Name</th>
                <th className="text-right px-3 py-2 w-28">Price</th>
                <th className="text-right px-3 py-2 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-3 py-1">{item.quantity}</td>
                  <td className="px-3 py-1">{item.name}</td>
                  <td className="px-3 py-1 text-right">{formatPrice(item.price / item.quantity)}</td>
                  <td className="px-3 py-1 text-right">{formatPrice(item.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td colSpan={3} className="text-right px-3 py-2">Subtotal</td>
                <td className="text-right px-3 py-2">{formatPrice(subTotal)}</td>
              </tr>

              {/* Tax */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">Tax ({tax}%)</td>
                <td className="text-right px-3 py-2">{formatPrice(taxAmount)}</td>
              </tr>

              {/* Discount */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">Discount ({discount}%)</td>
                <td className="text-right px-3 py-2">-{formatPrice(discountAmount)}</td>
              </tr>

              {/* Additional Fee */}
              <tr>
                <td colSpan={3} className="text-right px-3 py-2">Additional Fee</td>
                <td className="text-right px-3 py-2">{formatPrice(additionalFee)}</td>
              </tr>

              {/* Final Total */}
              <tr className="border-t font-bold text-lg bg-gray-200">
                <td colSpan={3} className="text-right px-3 py-3">Total</td>
                <td className="text-right px-3 py-3">{formatPrice(finalTotal)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Edit Mode */}
        {isEditing && billData && (
          <table className="w-full bg-gray-50 rounded text-sm font-mono">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left px-3 py-2 w-16">Qty</th>
                <th className="text-left px-3 py-2">Item Name</th>
                <th className="text-right px-3 py-2 w-28">Price</th>
                <th className="text-right px-3 py-2 w-28">Total</th>
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
                    />
                  </td>
                  <td className="px-3 py-1 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t font-semibold">
                <td colSpan={3} className="text-right px-3 py-2">Subtotal</td>
                <td className="text-right px-3 py-2">{formatPrice(subTotal)}</td>
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
              </tr>

              {/* Final total */}
              <tr className="border-t font-bold text-lg bg-gray-200">
                <td colSpan={3} className="text-right px-3 py-3">Total</td>
                <td className="text-right px-3 py-3">{formatPrice(finalTotal)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Action Buttons */}
      {billData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between space-x-2">
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="flex-1 black-button font-semibold py-2 rounded"
            >
              Simpan
            </button>
          ) : (
            <button
              onClick={handleEditBill}
              className="flex-1 black-button font-semibold py-2 rounded"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 green-button font-semibold py-2 rounded"
          >
            SplitBill
          </button>
        </div>
      )}
    </div>
  );
};
