import React, { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { FaPercent } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const Splitbill = () => {
  const { groupId } = useParams();
  const location = useLocation();

  // Get bill data from location state, handling both manual and scanned bill structures
  const billData = location.state?.billData;
  const billItems = Array.isArray(billData) ? billData : billData?.items || [];
  const tax = location.state?.tax || billData?.tax || 0;
  const discount = location.state?.discount || billData?.discount || 0;
  const additionalFee = location.state?.additionalFee || billData?.additionalFee || 0;

  const initialMembers = location.state?.members || [];

  const [membersData, setMembersData] = useState(initialMembers);
  const [loading, setLoading] = useState(initialMembers.length === 0);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [paidBy, setpaidBy] = useState(null);

  const [assignments, setAssignments] = useState(() => {
    const init = {};
    if (Array.isArray(billItems)) {
      billItems.forEach(item => {
        const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
        init[itemId] = [];
      });
    }
    return init;
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Jika sudah ada members dari location.state, skip fetch
    if (initialMembers.length > 0) {
      setLoading(false);
      return;
    }

    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const groupData = await authService.getGroupById(groupId);
        console.log('Fetched group data:', groupData);
        const transformedMembers = groupData.members.map(member => ({
          id: member.id,
          name: member.username,
          profile_picture: member.profile_picture
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
    if (!selectedMember) {
      alert('Pilih satu anggota dulu untuk split!');
      return;
    }

    const newAssignments = {};
    billItems.forEach(item => {
      const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
      newAssignments[itemId] = [selectedMember];
    });

    setAssignments(newAssignments);
    setpaidBy(selectedMember);

    alert(`Bill telah dibagi 100% ke anggota: ${membersData.find(m => m.id === selectedMember)?.name}`);
  };

  const handleConfirm = () => {
    if (!paidBy) {
      setError('Please select who paid for the bill');
      return;
    }

    // Format data according to dummy bills format
    const formattedBill = {
      group_id: groupId,
      items: billItems.map(item => {
        const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
        const assignedMembers = assignments[itemId] || [];
        
        return {
          name: item.name,
          quantity: item.quantity,
          nominal: item.nominal || item.price,
          who_to_paid: assignedMembers,
          paid_by: paidBy
        };
      }),
      tax: tax || 0,
      service: additionalFee || 0,
      discount: discount || 0,
      bill_picture: location.state?.bill_picture 
    };

    console.log('Passing to SplitDetail:', formattedBill);

    navigate('/splitdetail', {
      state: {
        billData: formattedBill,
        membersData: membersData.map(member => ({
          id: member.id,
          name: member.name
        }))
      }
    });
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <button onClick={() => window.history.back()} className="text-gray-700" aria-label="Back">
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center flex-1">Your Bills</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="mb-4">
          <h2 className="text-lg text-left font-semibold text-gray-800">Select Member</h2>
          <p className="text-sm text-left text-gray-600 mb-4">
            Pilih anggota lalu klik makanan yang dibeli anggota tersebut.
          </p>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          {loading ? (
            <div className="text-center py-4">Loading members...</div>
          ) : (
            <div className="mb-6 mt-10">
              <div className="flex items-center gap-6 overflow-x-auto pb-4 px-1 -mx-1">
                <div className="flex gap-6 min-w-max">
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
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base overflow-hidden
                            ${selected ? 'ring-2 ring-pink-800 bg-pink-300' : 'bg-pink-600 hover:bg-pink-300'}`}
                        >
                          {member.profile_picture ? (
                            <img 
                              src={`http://localhost:5000/uploads/profile-photos/${member.profile_picture}`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name[0].toUpperCase()
                          )}
                        </div>
                        <span className="mt-2 text-xs text-gray-700 max-w-[80px] truncate">{member.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={splitEqually}
                  className="flex flex-col items-center cursor-pointer focus:outline-none"
                  type="button"
                >
                  <div className="w-14 h-14 rounded-full bg-green-400 flex items-center justify-center text-white text-lg shadow-md hover:bg-green-700 transition">
                    <FaPercent />
                  </div>
                  <span className="mt-2 text-xs text-black bg-opacity-40 px-2 rounded">
                    Split Equally
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Global Paid By Selection */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Who paid for this bill?</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

          {/* Bill Items */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Items</h3>
            <div className="space-y-4 h-64 overflow-y-auto">
              {billItems.map((item) => {
                const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
                const assignedMembers = assignments[itemId] || [];
                return (
                  <div
                    key={itemId}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer select-none"
                    onClick={() => toggleAssignItemToMember(item)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => {
                      if (e.key === 'Enter' || e.key === ' ') toggleAssignItemToMember(item);
                    }}
                  >
                    <div className="font-semibold text-gray-800">
                      {item.quantity}x {item.name} - {formatRupiah(item.nominal || item.price)}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignedMembers.length === 0 && (
                        <span className="text-xs italic text-gray-400">Belum diassign</span>
                      )}
                      {assignedMembers.map(memberId => {
                        const member = membersData.find(m => m.id === memberId);
                        return member ? (
                          <span
                            key={memberId}
                            className="text-xs bg-pink-300 px-2 py-0.5 rounded-full"
                          >
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}

              {(tax !== undefined || discount !== undefined || additionalFee !== undefined) && (
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-800">
                  {tax !== undefined && (
                    <div className="flex justify-between">
                      <span>Tax ({(tax * 100).toFixed(2)}%)</span>
                      <span>{formatRupiah(billItems.reduce((sum, i) => sum + (i.nominal || i.price) * i.quantity, 0) * tax)}</span>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          className="w-full green-button font-semibold py-3 rounded-lg shadow-sm transition"
          onClick={handleConfirm}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
