import React, { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { FaPercent } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const Splitbill = () => {
  const { groupId } = useParams();
  const location = useLocation();

  const billItems = location.state?.billData || [];
  const tax = location.state?.tax;
  const discount = location.state?.discount;
  const additionalFee = location.state?.additionalFee;

  const initialMembers = location.state?.members || [];

  const [membersData, setMembersData] = useState(initialMembers);
  const [loading, setLoading] = useState(initialMembers.length === 0);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paidBy, setpaidBy] = useState(null);

  const [assignments, setAssignments] = useState(() => {
    const init = {};
    billItems.forEach(item => {
      const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
      init[itemId] = [];
    });
    return init;
  });

  // NEW: state untuk total tagihan per member
  const [billsPerMember, setBillsPerMember] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (initialMembers.length > 0) {
      setLoading(false);
      return;
    }

    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const groupData = await authService.getGroupById(groupId);
        const transformedMembers = groupData.members.map(member => ({
          id: member.id,
          name: member.username
        }));
        setMembersData(transformedMembers);
      } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Failed to load group members. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupMembers();
  }, [groupId, initialMembers.length]);

  const toggleSelectedMember = (id) => {
    setSelectedMember(selectedMember === id ? null : id);
  };

  const toggleAssignItemToMember = (item) => {
    if (!selectedMember) {
      alert('Pilih anggota dulu sebelum memilih makanan.');
      return;
    }
    const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
    setAssignments(prev => {
      const assignedMembers = prev[itemId] || [];
      if (assignedMembers.includes(selectedMember)) {
        return {
          ...prev,
          [itemId]: assignedMembers.filter(mId => mId !== selectedMember),
        };
      } else {
        return {
          ...prev,
          [itemId]: [...assignedMembers, selectedMember],
        };
      }
    });
  };

  const splitEqually = () => {
    if (membersData.length === 0) {
      alert('Tidak ada anggota untuk membagi bill.');
      return;
    }

    const newAssignments = {};
    billItems.forEach(item => {
      const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
      newAssignments[itemId] = membersData.map(member => member.id);
    });

    setAssignments(newAssignments);
    alert("Bill telah dibagi rata ke semua anggota.");
  };

  // NEW: fungsi hitung tagihan per member
  const calculateBillsPerMember = () => {
    const totals = {};

    membersData.forEach(member => {
      totals[member.id] = 0;
    });

    billItems.forEach(item => {
      const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
      const assignedMembers = assignments[itemId] || [];
      if (assignedMembers.length === 0) return; // skip jika tidak ada yang assign

      // harga total item = quantity * price
      const totalItemPrice = item.quantity * item.price;

      // bagi rata ke yang assigned
      const sharePerMember = totalItemPrice / assignedMembers.length;

      assignedMembers.forEach(memberId => {
        totals[memberId] += sharePerMember;
      });
    });

    // Tambahkan tax, discount, dan additionalFee proporsional ke tiap member
    let subTotal = Object.values(totals).reduce((a,b) => a + b, 0);

    // kalau subtotal 0, skip
    if (subTotal === 0) return totals;

    // kalkulasi tambahan biaya
    if (tax) {
      const taxAmount = subTotal * tax;
      const taxPerMemberRatio = taxAmount / subTotal;
      for (const m in totals) {
        totals[m] += totals[m] * taxPerMemberRatio;
      }
    }

    if (additionalFee) {
      const feePerMember = additionalFee / membersData.length;
      for (const m in totals) {
        totals[m] += feePerMember;
      }
    }

    if (discount) {
      // Asumsikan discount dikurangi merata per member
      const discountPerMember = discount / membersData.length;
      for (const m in totals) {
        totals[m] -= discountPerMember;
        if (totals[m] < 0) totals[m] = 0; // jangan sampai negatif
      }
    }

    return totals;
  };

  const handleNext = () => {
    if (!paidBy) {
      alert('Pilih siapa yang membayar bill ini!');
      return;
    }

    const formattedBill = {
      group_id: groupId,
      items: billItems.map(item => {
        const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
        const assignedMembers = assignments[itemId] || [];

        return {
          name: item.name,
          quantity: item.quantity,
          nominal: item.price,
          who_to_paid: assignedMembers,
          paid_by: paidBy
        };
      }),
      tax: tax || 0,
      service: additionalFee || 0,
      discount: discount || 0
    };

    // NEW: Hitung tagihan per member dan simpan ke localStorage
    const bills = calculateBillsPerMember();
    setBillsPerMember(bills);
    localStorage.setItem('billsPerMember', JSON.stringify(bills));

    console.log('Tagihan per member:', bills);
    console.log('Passing to SplitDetail:', formattedBill);

    navigate('/splitdetail', {
      state: {
        billData: formattedBill,
        membersData: membersData.map(member => ({
          id: member.id,
          name: member.name
        })),
        billsPerMember: bills // bisa diteruskan ke halaman berikutnya
      }
    });
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  return (
    <div className="px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6 relative">
        <button onClick={() => window.history.back()} className="text-gray-700 absolute left-0" aria-label="Back">
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">Your Bills</h1>
      </div>

      <div className="mb-4">
        <h2 className="text-lg text-left font-semibold text-gray-800">Select Member</h2>
        <p className="text-sm text-left text-gray-600 mb-4">
          Pilih anggota lalu klik makanan yang dibeli anggota tersebut.
        </p>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-4">Loading members...</div>
        ) : (
          <div className="flex justify-between items-center gap-6 mb-6 mt-10">
            <div className="flex gap-6">
              {membersData.map(member => {
                const selected = selectedMember === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleSelectedMember(member.id)}
                    className="flex flex-col items-center cursor-pointer focus:outline-none"
                    type="button"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base
                        ${selected ? 'ring-2 ring-pink-800 bg-pink-300' : 'bg-pink-600 hover:bg-pink-300'}`}
                    >
                      {member.name[0].toUpperCase()}
                    </div>
                    <span className="mt-1 text-xs text-gray-700">{member.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={splitEqually}
              className="flex flex-col items-center cursor-pointer focus:outline-none"
              type="button"
            >
              <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white text-lg shadow-md hover:bg-green-700 transition">
                <FaPercent />
              </div>
              <span className="mt-1 text-xs text-black bg-opacity-40 px-2 rounded">
                Split Equally
              </span>
            </button>
          </div>
        )}

        <div className="mb-4 p-4 bg-white rounded shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Who paid for this bill?</label>
          <select
            className="w-full p-2 border rounded"
            value={paidBy || ''}
            onChange={(e) => setpaidBy(e.target.value)}
          >
            <option value="">Select who paid</option>
            {membersData.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-100 p-4 rounded shadow min-h-[150px] font-mono text-sm whitespace-pre-wrap">
          {billItems.map((item) => {
            const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
            const assignedMembers = assignments[itemId] || [];
            return (
              <div
                key={itemId}
                className="mb-4 border-b border-gray-300 pb-2 cursor-pointer select-none"
                onClick={() => toggleAssignItemToMember(item)}
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') toggleAssignItemToMember(item);
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <div className="truncate max-w-[50%] font-semibold">{item.name}</div>
                    <div className="text-center w-12">{item.quantity}x</div>
                    <div className="text-right w-24 font-bold">
                      {formatRupiah(item.price * item.quantity)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-right">
                    @{formatRupiah(item.price)} per item
                  </div>
                  <div className="flex gap-1 items-center flex-wrap max-w-[70%]">
                    {assignedMembers.map(id => {
                      const member = membersData.find(m => m.id === id);
                      return member ? (
                        <div
                          key={id}
                          className="rounded-full bg-pink-400 text-white w-5 h-5 flex items-center justify-center text-xs font-bold"
                          title={member.name}
                        >
                          {member.name[0].toUpperCase()}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 green-button font-semibold py-3 rounded shadow-lg"
      >
        Next
      </button>
    </div>
  );
};
