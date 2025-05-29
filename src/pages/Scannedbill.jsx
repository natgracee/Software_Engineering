import React, { useEffect, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdClear } from 'react-icons/md';
import { llmService } from '../services/llmService';

// Formats a number to IDR thousands.
function formatPrice(num) {
  // Ensure the number is not NaN or null before formatting
  if (isNaN(num) || num === null) {
    return '0'; // Or handle as appropriate for your UI
  }
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

  // States for tax (percentage), discount (percentage), and additional fee (IDR nominal).
  const [tax, setTax] = useState(0); // in percent (%)
  const [discount, setDiscount] = useState(0); // in percent (%)
  const [additionalFee, setAdditionalFee] = useState(0); // in IDR nominal

  const image = location.state?.image;

  // Processes the OCR text using the LLM service.
  const processWithLLM = async (text) => {
    try {
      setStatus('Memproses dengan AI...');
      const result = await llmService.processBillText(text);
      if (result.success) {
        // PERBAIKAN: Memastikan item.price adalah harga satuan dari LLM
        // Ini adalah lapisan pengaman jika LLM terkadang mengembalikan total harga.
        // IDEALNYA, LLM SERVICE HARUS SUDAH MENGEMBALIKAN HARGA SATUAN.
        const processedItems = result.items.map(item => {
          // Hanya jika kuantitas > 0 dan harga yang terdeteksi > 0, kita bagi.
          // Jika tidak, asumsikan 'price' sudah harga satuan atau biarkan apa adanya.
          if (item.quantity > 0 && item.price > 0 && item.price % item.quantity === 0) {
            return { ...item, price: item.price / item.quantity };
          }
          return item; // Jika tidak memenuhi kriteria, biarkan seperti adanya
        });
        setBillData(processedItems);
        setStatus('Bill Detail');
      } else {
        throw new Error(result.error || 'Failed to process with AI');
      }
    } catch (error) {
      console.error('LLM processing error:', error);
      setStatus('Gagal memproses dengan AI, menggunakan parser default...');
      const parsed = parseOcrTextToBillData(text); // Panggil parser yang sudah diperbaiki
      setBillData(parsed);
    }
  };

  // Parses OCR text into bill data (default parser).
  const parseOcrTextToBillData = (text) => {
    const lines = text.split('\n').filter(Boolean);
    const items = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      // Asumsi: parts[0] adalah quantity, parts[parts.length - 1] adalah harga total untuk item tersebut
      if (parts.length >= 3) {
        const quantity = parseInt(parts[0], 10);
        const detectedTotalPrice = parseInt(parts[parts.length - 1].replace(/\./g, ''), 10); // Hapus titik ribu jika ada

        // Memeriksa validitas data yang diparsing
        if (!isNaN(quantity) && !isNaN(detectedTotalPrice) && quantity > 0 && detectedTotalPrice > 0) {
          const name = parts.slice(1, parts.length - 1).join(' ');

          // PERBAIKAN: Hitung harga satuan di sini!
          const unitPrice = detectedTotalPrice / quantity;

          items.push({ name, quantity, price: unitPrice }); // <-- Sekarang 'price' adalah harga SATUAN
        }
      }
    });

    return items.length ? items : null;
  };

  // Effect hook to handle image processing with Tesseract.
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
        processingRef.current = false; // Set to false after OCR is done
        console.log('OCR Text:', text);
        return processWithLLM(text); // Lanjutkan ke LLM atau parser default
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
        setStatus('Gagal memproses OCR');
        processingRef.current = false;
      });

    // Cleanup function
    return () => {
      processingRef.current = false;
    };
  }, [image, navigate]);

  // Handles back navigation.
  function handleBack() {
    navigate(-1);
  }

  // Activates editing mode.
  function handleEditBill() {
    setIsEditing(true);
  }

  // Handles changes to individual bill items during editing.
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

  // Saves edits made to bill data.
  function handleSaveEdit() {
    if (billData && billData.length > 0 && billData.every(item => item.name.trim() !== '' && item.quantity > 0 && item.price > 0)) {
      setIsEditing(false);
    } else {
      alert('Pastikan semua item memiliki nama, quantity > 0, dan harga > 0');
    }
  }

  // Confirms the bill data and navigates to the split bill page.
  function handleConfirm() {
    if (!billData || billData.length === 0) {
      alert('Data bill belum tersedia atau kosong');
      return;
    }
    if (groupId) {
      // Pastikan data yang dikirim sudah dalam format harga satuan
      navigate(`/splitbill/${groupId}`, { state: { billData, tax, discount, additionalFee } });
    } else {
      alert('Group ID not available. Cannot proceed to split bill.');
    }
  }

  // Clears all scanned data and resets the state.
  function handleClear() {
    setBillData(null);
    setOcrText('');
    setStatus('Silakan scan ulang gambar');
    setIsEditing(false);
    setTax(0);
    setDiscount(0);
    setAdditionalFee(0);
  }

  // Calculates subtotal before tax and discount.
  // Pastikan subTotal dihitung berdasarkan (quantity * unitPrice)
  const subTotal = billData ? billData.reduce((acc, cur) => acc + (cur.quantity * cur.price), 0) : 0;

  // Calculates tax, discount amounts, and the final total.
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

      {/* Bill Data Display / Editing */}
      <div className="flex-grow overflow-auto mb-24 px-2">
        {!isEditing && billData && (
          <div className="mx-auto bg-gray-100 rounded p-4 text-sm font-mono min-w-0 max-w-xl shadow">
            {billData.map((item, idx) => (
              <div key={idx} className="border-b border-gray-300 pb-2 mb-2">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_4rem] items-start sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-left pt-2 sm:pt-4 text-xs sm:text-sm">{item.name}</span>
                  <span className="font-semibold text-left sm:text-center pt-1 sm:pt-4 text-xs sm:text-sm">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-left sm:text-right pt-1 sm:pt-4 text-xs sm:text-sm">
                    {/* Sekarang ini adalah total harga per item */}
                    {formatPrice(item.quantity * item.price)}
                  </span>
                </div>
                <div className="text-gray-600 text-xs text-left pt-1">
                  {/* Dan ini adalah harga satuan */}
                  @ {formatPrice(item.price)}
                </div>
              </div>
            ))}

            {/* Subtotal */}
            {/* PASTIKAN INI JUGA MENGGUNAKAN subTotal YANG DIHITUNG BERDASARKAN HARGA SATUAN * KUANTITAS */}
            <div className="text-left grid grid-cols-3 text-gray-700 font-semibold pt-2 mt-2">
              <span>Subtotal</span>
              <span></span>
              <span className="text-right">{formatPrice(subTotal)}</span>
            </div>

            {/* Tax, Discount, Additional Fee */}
            <div className="grid grid-cols-3 text-gray-700 pt-1 mt-1 text-left">
              <span>Tax ({tax}%)</span>
              <span></span>
              <span className="text-right">{formatPrice(taxAmount)}</span>
            </div>
            <div className="grid grid-cols-3 text-gray-700 pt-1 mt-1 text-left">
              <span>Discount ({discount}%)</span>
              <span></span>
              <span className="text-right">-{formatPrice(discountAmount)}</span>
            </div>
            <div className="grid grid-cols-3 text-gray-700 pt-1 mt-1 text-left">
              <span>Additional Fee</span>
              <span></span>
              <span className="text-right">{formatPrice(additionalFee)}</span>
            </div>

            {/* Final Total */}
            <div className="text-left grid grid-cols-3 font-bold border-t border-gray-400 pt-2 mt-2">
              <span>Total</span>
              <span></span>
              <span className="text-right">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        )}

        {/* Editing Mode */}
        {isEditing && (
          <div className="mx-auto bg-gray-50 rounded p-4 text-sm font-mono min-w-[320px] max-w-xl shadow">
            {billData.map((item, idx) => (
              <div key={idx} className="mb-4 border-b border-gray-300 pb-2">
                <input
                  className="w-full rounded border border-gray-300 p-1 mb-1"
                  type="text"
                  value={item.name}
                  onChange={e => handleChangeItem(idx, 'name', e.target.value)}
                  placeholder="Item name"
                />
                <div className="flex space-x-2">
                  <input
                    className="w-20 rounded border border-gray-300 p-1 text-right"
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                    placeholder="Quantity"
                  />
                  <input
                    className="flex-grow rounded border border-gray-300 p-1 text-right"
                    type="number"
                    min="0"
                    // Saat mengedit, nilai input adalah item.price (yang sekarang harga satuan)
                    value={item.price}
                    onChange={e => handleChangeItem(idx, 'price', e.target.value)}
                    placeholder="Price per item (Unit Price)"
                  />
                </div>
              </div>
            ))}

            {/* Tax Input */}
            <div className="flex justify-between items-center mt-4">
              <label htmlFor="taxInput" className="mr-2">Tax (%)</label>
              <input
                id="taxInput"
                type="number"
                min={0}
                max={100}
                value={tax}
                onChange={e => setTax(Number(e.target.value))}
                className="w-20 rounded border border-gray-300 p-1 text-right"
              />
            </div>

            {/* Discount Input */}
            <div className="flex justify-between items-center mt-2">
              <label htmlFor="discountInput" className="mr-2">Discount (%)</label>
              <input
                id="discountInput"
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-20 rounded border border-gray-300 p-1 text-right"
              />
            </div>

            {/* Additional Fee Input */}
            <div className="flex justify-between items-center mt-2">
              <label htmlFor="additionalFeeInput" className="mr-2">Additional Fee (IDR)</label>
              <input
                id="additionalFeeInput"
                type="number"
                min={0}
                value={additionalFee}
                onChange={e => setAdditionalFee(Number(e.target.value))}
                className="w-32 rounded border border-gray-300 p-1 text-right"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-4">
        {!isEditing && billData && (
          <>
            <button
              onClick={handleEditBill}
              className="black-button px-6 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleConfirm}
              className="green-button px-6 py-2 rounded"
            >
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
};