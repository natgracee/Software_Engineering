import React, { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { FaPercent } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const Splitbill = () => {
  const { groupId } = useParams();
  const location = useLocation();
  const [selectedMember, setSelectedMember] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Get billData from navigation state
  const billItems = location.state?.billData || [];
  const [assignments, setAssignments] = useState(() => {
    const init = {};
    billItems.forEach(item => {
      // Use a unique identifier for items if available, otherwise use index
      const itemId = item.id !== undefined ? item.id : JSON.stringify(item); // Use a unique ID or stringify for key
      init[itemId] = []; // awalnya belum ada member assigned
    });
    return init;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const groupData = await authService.getGroupById(groupId);
        // Transform the members data to match our component's expected format
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
  }, [groupId]);

  // Pilih / toggle member yang aktif
  const toggleSelectedMember = (id) => {
    setSelectedMember(selectedMember === id ? null : id);
  };

  // Klik makanan untuk assign/unassign ke member yang dipilih
  const toggleAssignItemToMember = (item) => {
    if (!selectedMember) {
      alert('Pilih anggota dulu sebelum memilih makanan.');
      return;
    }
    const itemId = item.id !== undefined ? item.id : JSON.stringify(item);
    setAssignments(prev => {
      const assignedMembers = prev[itemId] || [];
      if (assignedMembers.includes(selectedMember)) {
        // hapus assign
        return {
          ...prev,
          [itemId]: assignedMembers.filter(mId => mId !== selectedMember),
        };
      } else {
        // tambah assign
        return {
          ...prev,
          [itemId]: [...assignedMembers, selectedMember],
        };
      }
    });
  };

  // Fungsi split equally (sementara alert)
  const splitEqually = () => {
    if (!selectedMember) {
      alert('Pilih satu anggota dulu untuk split!');
      return;
    }
    alert(`Bill akan dibagi 100% ke anggota: ${
      membersData.find(m => m.id === selectedMember).name
    }`);
  };

  const handleNext = () => {
    // bisa lempar assignments, billItems, membersData ke halaman berikutnya
    // Ensure billItems passed to next page has a stable ID if possible
    const itemsWithIds = billItems.map((item, index) => ({
        ...item,
        // Add a temporary client-side ID if no backend ID exists yet
        // In a real app, you'd save items to DB here and use the DB ID
        id: item.id !== undefined ? item.id : `temp-${index}`
    }));
    navigate('/splitdetail', { state: { billItems: itemsWithIds, assignments, membersData } });
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 relative">
        <button onClick={() => window.history.back()} className="text-gray-700 absolute left-0" aria-label="Back">
          <MdArrowBack size={28} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">Your Bills</h1>
      </div>

      {/* Title & description */}
      <div className="mb-4">
        <h2 className="text-lg text-left font-semibold text-gray-800">Select Member</h2>
        <p className="text-sm text-left text-gray-600 mb-4">
          Pilih anggota lalu klik makanan yang dibeli anggota tersebut.
        </p>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            Loading members...
          </div>
        ) : (
          <div className="flex justify-between items-center gap-6 mb-6 mt-10">
            {/* Member list */}
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

            {/* Split Equally button */}
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

        {/* Daftar makanan */}
        <div className="bg-gray-100 p-4 rounded shadow min-h-[150px] font-mono text-sm whitespace-pre-wrap">
          {billItems.map((item, index) => {
            // Use a unique identifier for items if available, otherwise use index
            const itemId = item.id !== undefined ? item.id : JSON.stringify(item); // Use a unique ID or stringify for key
            const assignedMembers = assignments[itemId] || [];
            return (
              <div
                key={itemId} // Use the unique ID for the key
                className="mb-4 border-b border-gray-300 pb-2 cursor-pointer select-none"
                onClick={() => toggleAssignItemToMember(item)}
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') toggleAssignItemToMember(item);
                }}
              >
                <div className="font-semibold">
                  {item.quantity}x {item.name} Rp {item.price}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
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
        </div>
      </div>

      {/* Tombol Next fixed bottom */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          className="max-w-md w-full green-button font-semibold py-3 rounded shadow transition"
          onClick={handleNext}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
