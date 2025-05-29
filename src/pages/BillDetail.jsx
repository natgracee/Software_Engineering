import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDelete } from 'react-icons/md';
import Swal from 'sweetalert2';
import api from '../config/api';

export const BillDetail = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await api.get(`/api/bills/${billId}`);
        
        if (!response.data) {
          throw new Error('No bill data received');
        }

        if (!response.data.items || !Array.isArray(response.data.items)) {
          throw new Error('Invalid bill data structure');
        }

        const processedItems = response.data.items.map(item => ({
          ...item,
          item_price: Number(item.item_price) || 0
        }));

        const processedBill = {
          ...response.data,
          items: processedItems
        };

        setBill(processedBill);
        
        try {
          const imageResponse = await api.get(`/api/bills/${billId}/image`);
          if (imageResponse.data?.image) {
            setImageData(imageResponse.data.image);
          }
        } catch (imageError) {
          // Image loading is not critical, just log the error
          console.error('Error loading image:', imageError);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load bill');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  const handleDelete = async () => {
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
          Swal.fire(
            'Deleted!',
            'The bill has been deleted.',
            'success'
          ).then(() => {
            navigate(-1);
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete bill');
        }
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!bill) return <div className="text-center p-4">Bill not found</div>;

  const totalAmount = bill.items.reduce((sum, item) => sum + (Number(item.item_price) || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <MdArrowBack size={24} className="mr-2" />
            Back
          </button>
          {!bill.is_summarized && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Bill
            </button>
          )}
        </div>

        {/* Bill Image */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
            {imageData ? (
              <img 
                src={imageData}
                alt="Bill receipt" 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : bill.bill_picture ? (
              <img 
                src={`${api.defaults.baseURL}/api/bills/${bill.bill_id}/image`}
                alt="Bill receipt" 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-bill.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Bill Details</h2>
            <p className="text-gray-600">
              {new Date(bill.date_created).toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Paid By</h3>
            <p className="text-gray-700">{bill.paid_by_name || 'Unknown'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Items</h3>
            <div className="space-y-2">
              {bill.items.map((item, index) => (
                <div key={item.item_id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.item_name || 'Unnamed Item'}</p>
                    <p className="text-sm text-gray-600">
                      To be Paid by: {item.to_be_paid_by_names?.join(', ') || 'Not assigned'}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR'
                    }).format(item.item_price || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 