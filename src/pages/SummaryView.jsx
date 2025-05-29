import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MdArrowBack, MdReceipt } from 'react-icons/md';
import api from '../config/api';
import Swal from 'sweetalert2';

export const SummaryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInvoiceView = location.state?.isInvoiceView;
  const invoiceData = location.state?.invoiceData;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        if (isInvoiceView && invoiceData) {
          // If viewing an invoice, use the passed data
          setSummary({
            ...invoiceData,
            total_bills: 1, // Since this is a single invoice
            total_amount: invoiceData.records.reduce((sum, record) => sum + record.nominal, 0)
          });
        } else {
          // Otherwise fetch the full summary
          const response = await api.get(`/api/bills/summarize/${id}`);
          if (!response.data) {
            throw new Error('No summary data received');
          }
          setSummary(response.data);
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError(err.response?.data?.error || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id, isInvoiceView, invoiceData]);

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

  if (loading) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading summary...</div>
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

  if (!summary) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-xl">No summary available</div>
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isInvoiceView ? 'Invoice Details' : 'Bill Summary'}
        </h1>
        <p className="text-gray-600">
          {summary.date_start && summary.date_end ? (
            `${formatDate(summary.date_start)} - ${formatDate(summary.date_end)}`
          ) : (
            'All time'
          )}
        </p>
        {isInvoiceView && (
          <p className="text-sm text-gray-500 mt-1">
            Invoice #{summary.invoice_id?.slice(0, 8)}
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isInvoiceView ? 'Total Records' : 'Total Bills'}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isInvoiceView ? summary.record_count : summary.total_bills}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdReceipt className="text-green-500" size={24} />
          Payment Records
        </h2>
        
        {summary.records && summary.records.length > 0 ? (
          <div className="space-y-4">
            {summary.records.map((record, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{record.debtor_name}</p>
                    <p className="text-sm text-gray-600">owes to {record.debtee_name}</p>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(record.nominal)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No payment records found</p>
          </div>
        )}
      </div>
    </section>
  );
}; 