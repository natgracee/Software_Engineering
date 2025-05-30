import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { GalleryScan } from './Galleryscan';
import {
  MdArrowBack,
  MdPhotoLibrary,
  MdQrCodeScanner,
  MdEdit,
  MdContentCopy,
  MdSummarize,
  MdReceipt,
  MdClose,
  MdGroup,
  MdDelete
} from 'react-icons/md';
import { authService } from '../services/authService';
import api from '../config/api';
import Swal from 'sweetalert2';

export const Groupdetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);
  const addMemberPhotoInputRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState('');

  const [showGalleryScan, setShowGalleryScan] = useState(false);
  const [selectedGalleryFile, setSelectedGalleryFile] = useState(null);

  // Form state untuk tambah member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const fetchedGroup = await authService.getGroupById(id);
        setGroup(fetchedGroup);
        setEditedName(fetchedGroup.group_name);
        setInviteLink(`${window.location.origin}/join/${fetchedGroup.group_id}`);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchBills = async () => {
      try {
        setLoadingBills(true);
        const response = await api.get(`/api/bills/group/${id}`);
        setBills(response.data);
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setLoadingBills(false);
      }
    };

    fetchGroup();
    fetchBills();
  }, [id]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Show loading state
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we update your group photo',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Upload the photo
      const response = await api.put(`/auth/groups/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the group state with new photo
      setGroup(prevGroup => ({
        ...prevGroup,
        profile_picture: response.data.profile_picture
      }));

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Photo Updated!',
        text: 'Your group photo has been successfully updated.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to update group photo. Please try again.',
      });
    }
  };

  const handleAddMemberPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMemberPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = () => {
    if (!newMemberName) return alert('Please enter member name.');

    const newMember = {
      id: Date.now(), // Simulasi ID unik
      username: newMemberName,
      photo: newMemberPhoto || null
    };

    const updatedGroup = {
      ...group,
      members: [...(group.members || []), newMember]
    };

    setGroup(updatedGroup);
    setNewMemberName('');
    setNewMemberPhoto('');
    alert('Member added successfully!');
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return bills
      .filter(bill => !bill.summarized) // Only count bills that haven't been summarized
      .reduce((sum, bill) => {
        // If bill has total_amount, use it directly
        if (bill.total_amount) {
          return sum + Number(bill.total_amount);
        }
        // Otherwise calculate from items
        const billTotal = bill.items?.reduce((itemSum, item) => {
          const itemPrice = Number(item.nominal || item.price || 0);
          const itemQuantity = Number(item.quantity || 1);
          return itemSum + (itemPrice * itemQuantity);
        }, 0) || 0;
        return sum + billTotal;
      }, 0);
  };

  // Handle Bill Deletion
  const handleDeleteBill = async (billId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/bills/${billId}`);
          // Remove the deleted bill from state
          setBills(prevBills => prevBills.filter(bill => bill.bill_id !== billId));
          Swal.fire(
            'Deleted!',
            'The bill has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting bill:', error);
          Swal.fire(
            'Failed!',
            error.response?.data?.message || 'There was an error deleting the bill.',
            'error'
          );
        }
      }
    });
  };

  const handleSummarizeBills = async () => {
    try {
      setSummarizing(true);
      
      // Show loading state
      Swal.fire({
        title: 'Summarizing Bills...',
        text: 'Please wait while we process your bills',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.post(`/api/bills/summarize/${id}`);
      console.log('Summarize response:', response.data);
      
      // Show success message with summary details
      Swal.fire({
        icon: 'success',
        title: 'Bills Summarized!',
        html: `
          <div class="text-left">
            <p class="mb-2">The bills have been successfully summarized.</p>
            <p class="text-sm text-gray-600">Total Bills: ${bills.filter(bill => !bill.summarized).length}</p>
            <p class="text-sm text-gray-600">Total Amount: ${formatCurrency(calculateTotalAmount())}</p>
          </div>
        `,
        confirmButtonText: 'View Summary',
        showCancelButton: true,
        cancelButtonText: 'Close'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to summary view
          navigate(`/summary/${id}`);
        }
      });

      // Refresh bills after summarizing
      const updatedBills = await api.get(`/api/bills/group/${id}`);
      setBills(updatedBills.data);
    } catch (error) {
      console.error('Error summarizing bills:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Summarize',
        html: `
          <div class="text-left">
            <p class="mb-2">${error.response?.data?.error || 'Failed to summarize bills'}</p>
          </div>
        `,
        confirmButtonText: 'Try Again',
        showCancelButton: true,
        cancelButtonText: 'Close'
      });
    } finally {
      setSummarizing(false);
    }
  };

  const handleViewInvoices = async () => {
    try {
      setLoadingInvoices(true);
      // Navigate to invoice view
      navigate(`/invoices/${id}`);
    } catch (error) {
      console.error('Error navigating to invoices:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Invoices',
        text: 'Could not load invoices. Please try again later.'
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

  if (loading) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading group...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </section>
    );
  }

  if (!group) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Group not found.</div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 min-h-screen flex flex-col relative">
      {/* Back Button in Top Left */}
      <button 
        onClick={() => navigate('/main')} 
        className="absolute top-4 left-4 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 z-10"
        aria-label="Back to Groups"
      >
        <MdArrowBack size={24} />
      </button>

      {/* Main Header Content */}
      <div className="flex items-center justify-center mb-6 relative py-2 mt-4">
        <div className="flex-grow text-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-0">{group?.group_name}</h1>
          <p className="text-gray-600 text-sm mt-0 mb-2">{group?.members?.length || 0} members</p>
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden mx-auto">
              {group?.profile_picture ? (
                <img
                  src={`http://localhost:5000/uploads/group-photos/${group.profile_picture}`}
                  alt={group.group_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdGroup size={48} className="text-green-600" />
              )}
            </div>
            {/* Edit Button overlayed on picture */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md text-gray-600 hover:text-gray-900"
              title="Edit Group Photo"
              aria-label="Edit Group Photo"
            >
              <MdEdit size={20} />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Right side: Empty space or future element */}
        <div className="w-6">{/* Placeholder for potential right-aligned element */}</div>
      </div>

      {/* Content below header */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 text-center relative">
        <div className="flex flex-col items-center relative">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="px-4 py-2 rounded hover:underline transition"
          >
            {showMembers ? 'Hide Members' : 'Show Members'}
          </button>

          {showMembers && group.members && (
            <div className="mt-4 text-left w-full">
              <p className="font-semibold mb-2">Members:</p>
              <ul>
                {group.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    {member.photo && (
                      <img
                        src={member.photo}
                        alt={member.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span>{member.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

    
      {/* TOMBOL ADD MEMBER */}
      <div className="mt-6 w-full text-left">
        {!showAddMemberForm ? (
          <button
            onClick={() => setShowAddMemberForm(true)}
            className="flex items-center gap-2 text-green-600 hover:underline text-sm"
          >
            <span className="text-xl">➕</span>
            <span>Add Member</span>
          </button>
        ) : (
          <div className="p-4 border rounded-md bg-gray-50 space-y-2">
            <input
              type="text"
              placeholder="Enter member name"
              className="w-full p-2 border rounded text-sm"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAddMemberPhoto}
              className="w-full text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddMemberForm(false);
                  setNewMemberName('');
                  setNewMemberPhoto('');
                }}
                className="text-gray-500 text-sm hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-sm"
              >
                Add Member
              </button>
            </div>
          </div>
        )}
      </div>

          {inviteLink && (
            <div className="mt-6 w-full text-left">
              <p className="text-sm font-semibold text-gray-700 mb-1">Invite Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm text-gray-600"
                  value={inviteLink}
                  readOnly
                />
                <button
                  onClick={copyInviteLink}
                  className="bg-green-500 text-white px-3 py-2 rounded flex items-center space-x-1 hover:bg-green-600"
                >
                  <MdContentCopy size={16} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 px-2">
        <button
          onClick={() => navigate('/quickscan', { state: { groupId: id } })}
          className="green-button py-2 px-4 rounded flex items-center space-x-2 flex-1 min-w-[140px]"
        >
          <MdQrCodeScanner size={20} />
          <span>Quick Scan</span>
        </button>
        <button
          onClick={() => setShowGalleryScan(true)}
          className="green-button py-2 px-4 rounded flex items-center space-x-2 flex-1 min-w-[140px]"
        >
          <MdPhotoLibrary size={20} />
          <span>Gallery Scan</span>
        </button>
        <button
          onClick={() => navigate(`/manualbill/${id}`)}
          className="green-button py-2 px-4 rounded flex items-center space-x-2 flex-1 min-w-[140px]"
        >
          <MdReceipt size={20} />
          <span>Add Manual Bill</span>
        </button>
        <button
          onClick={handleSummarizeBills}
          disabled={summarizing || bills.length === 0}
          className={`green-button py-2 px-4 rounded flex items-center space-x-2 transition-all duration-200 flex-1 min-w-[140px] ${
            (summarizing || bills.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
          }`}
          title={bills.length === 0 ? "No bills to summarize" : "Summarize all bills"}
        >
          <MdSummarize size={20} />
          <span>{summarizing ? 'Summarizing...' : 'Summarize Bills'}</span>
        </button>
        <button
          onClick={handleViewInvoices}
          className="green-button py-2 px-4 rounded flex items-center space-x-2 hover:bg-green-600 flex-1 min-w-[140px]"
        >
          <MdReceipt size={20} />
          <span>View Invoices</span>
        </button>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-sm space-y-4 overflow-y-auto w-full flex-1">
        {loadingBills ? (
          <p className="text-center text-gray-600">Loading bills...</p>
        ) : bills.length === 0 ? (
          <p className="text-center text-gray-600">No bills yet.</p>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div 
                key={bill.bill_id} 
                className="bg-white p-4 rounded-lg shadow relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/bill/${bill.bill_id}`)}
              >
                {!bill.summarized && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation when clicking delete
                      handleDeleteBill(bill.bill_id);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors z-10"
                    title="Delete Bill"
                    aria-label="Delete Bill"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                <div className="flex items-start gap-4 pr-10">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Paid by {bill.paid_by_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bill.date_created).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-right mb-1">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-semibold text-green-600">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR'
                            }).format(bill.total_amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {bill.summarized ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Summarized
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{bill.item_count} items</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInvoices && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MdReceipt className="text-green-500" size={24} />
                Group Invoices
              </h2>
              <button
                onClick={() => setShowInvoices(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {loadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <MdReceipt className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">No invoices found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.invoice_id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              {formatDate(invoice.date_start)} - {formatDate(invoice.date_end)}
                            </p>
                            <p className="font-semibold text-gray-800">Invoice #{invoice.invoice_id.slice(0, 8)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Records</p>
                            <p className="font-semibold text-green-600">{invoice.record_count}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {invoice.records.map((record) => (
                            <div key={record.record_id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 text-sm font-medium">
                                    {record.debtor_name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{record.debtor_name}</p>
                                  <p className="text-xs text-gray-500">owes to {record.debtee_name}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-green-600">{formatCurrency(record.nominal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showGalleryScan && (
        <div className="fixed inset-0 bg-white/80 backdrop-filter backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              onClick={() => setShowGalleryScan(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <GalleryScan
              onClose={() => setShowGalleryScan(false)}
              onFileSelect={setSelectedGalleryFile}
              groupId={id}
            />
          </div>
        </div>
      )}
    </section>
  );
};
