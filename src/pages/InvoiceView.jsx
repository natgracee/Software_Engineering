import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MdArrowBack, MdReceipt, MdChevronRight } from 'react-icons/md';
import api from '../config/api';

export const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/invoices/group/${id}`);
        setInvoices(response.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.response?.data?.error || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [id]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInvoiceClick = (invoice) => {
    navigate(`/summary/${id}`, { 
      state: { 
        invoiceData: invoice,
        isInvoiceView: true
      }
    });
  };

  const handlePaymentToggle = async (invoiceId, recordId, currentStatus) => {
    try {
      // Update the local state first for immediate feedback
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => {
          if (invoice.invoice_id === invoiceId) {
            return {
              ...invoice,
              records: invoice.records.map(record => {
                if (record.record_id === recordId) {
                  return {
                    ...record,
                    already_paid: !currentStatus
                  };
                }
                return record;
              })
            };
          }
          return invoice;
        })
      );

      // Make API call to update the payment status
      await api.patch(`/api/invoices/${invoiceId}/records/${recordId}`, {
        is_paid: !currentStatus
      });
    } catch (err) {
      console.error('Error updating payment status:', err);
      // Revert the local state if the API call fails
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => {
          if (invoice.invoice_id === invoiceId) {
            return {
              ...invoice,
              records: invoice.records.map(record => {
                if (record.record_id === recordId) {
                  return {
                    ...record,
                    already_paid: currentStatus
                  };
                }
                return record;
              })
            };
          }
          return invoice;
        })
      );
    }
  };

  if (loading) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading invoices...</div>
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

  return (
    <section className="px-4 py-6 min-h-screen flex flex-col relative">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 z-10"
        aria-label="Back"
      >
        <MdArrowBack size={24} />
      </button>

      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Group Invoices</h1>
        <p className="text-gray-600">View all payment records</p>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div 
              key={invoice.invoice_id} 
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Invoice Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      {formatDate(invoice.date_start)} - {formatDate(invoice.date_end)}
                    </p>
                    <p className="font-semibold text-gray-800">Invoice #{invoice.invoice_id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Records</p>
                      <p className="font-semibold text-green-600">{invoice.record_count}</p>
                    </div>
                    <button 
                      onClick={() => handleInvoiceClick(invoice)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MdChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview of Records */}
              <div className="p-4">
                <div className="space-y-3">
                  {invoice.records.slice(0, 2).map((record) => (
                    <div key={record.record_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-sm font-medium">
                            {record.debtor_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{record.debtor_name}</p>
                          <p className="text-xs text-gray-500">owes to {record.debtee_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-green-600">{formatCurrency(record.nominal)}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={record.already_paid}
                            onChange={() => handlePaymentToggle(invoice.invoice_id, record.record_id, record.already_paid)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {record.already_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {invoice.records.length > 2 && (
                    <p className="text-center text-sm text-gray-500">
                      +{invoice.records.length - 2} more records
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-xl shadow-md">
            <MdReceipt className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </section>
  );
}; 