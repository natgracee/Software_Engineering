import React, { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdClear } from 'react-icons/md';
import { Loadingscreen } from './Loadingscreen'; // import komponen loading mu

function formatPrice(num) {
  return num.toLocaleString('id-ID');
}

export const Scannedbill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ setOcrText] = useState('');
  const [status, setStatus] = useState('Memuat gambar...');
  const [billData, setBillData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const image = location.state?.image;

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

    setStatus('Memproses OCR...');
    setLoading(true);

    Tesseract.recognize(image, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setStatus(`Memproses OCR... ${Math.floor(m.progress * 100)}%`);
        }
      },
    })
      .then(({ data: { text } }) => {
        setLoading(false);
        setStatus('Selesai!');
        setOcrText(text);

        const parsed = parseOcrTextToBillData(text);
        setBillData(parsed);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
        setStatus('Gagal memproses OCR');
      });
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
    if (
      billData &&
      billData.length > 0 &&
      billData.every(item => item.name.trim() !== '' && item.quantity > 0 && item.price > 0)
    ) {
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
    navigate('/splitbill', { state: { billData } });
  }

  function handleClear() {
    setBillData(null);
    setOcrText('');
    setStatus('Silakan scan ulang gambar');
    setIsEditing(false);
  }

  return (
    <div className="p-4 font-sans min-h-screen flex flex-col relative">
      {loading && <Loadingscreen />}

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

      {!loading && (
        <div className="mb-4 text-sm text-gray-700 font-mono">
          <p>{status}</p>
        </div>
      )}

      {/* Bill Table */}
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
                  <td className="px-3 py-1 text-right">{formatPrice(item.price)}</td>
                  <td className="px-3 py-1 text-right">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td colSpan={3} className="text-right px-3 py-2">Total</td>
                <td className="text-right px-3 py-2">
                  {formatPrice(billData.reduce((acc, cur) => acc + cur.price * cur.quantity, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {isEditing && billData && (
          <table className="w-full bg-gray-100 rounded text-sm font-mono">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-3 py-2 w-16">Qty</th>
                <th className="px-3 py-2">Item Name</th>
                <th className="px-3 py-2 w-28">Price</th>
                <th className="px-3 py-2 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-3 py-1">
                    <input
                      type="number"
                      value={item.quantity}
                      min={0}
                      onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                      className="w-full text-right rounded border border-gray-300 p-1"
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
                      value={item.price}
                      min={0}
                      onChange={e => handleChangeItem(idx, 'price', e.target.value)}
                      className="w-full text-right rounded border border-gray-300 p-1"
                    />
                  </td>
                  <td className="px-3 py-1 text-right">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-4 left-0 right-0 px-4 flex justify-center space-x-4">
        {!loading && billData && !isEditing && (
          <>
            <button
              onClick={handleEditBill}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            >
              Edit Bill
            </button>
            <button
              onClick={handleConfirm}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            >
              Confirm Bill
            </button>
          </>
        )}
        {isEditing && (
          <button
            onClick={handleSaveEdit}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
          >
            Save Edit
          </button>
        )}
      </div>
    </div>
  );
};
