import React, { useEffect, useState } from 'react';
import { ShieldCheck, UploadCloud, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function VendorKYC() {
  const [kycData, setKycData] = useState({
    kycStatus: 'pending_submission',
    kycDocuments: [],
    approved: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [docType, setDocType] = useState('GSTIN');
  const [docNumber, setDocNumber] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const fetchKYCStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/kyc/status');
      setKycData(res.data);
    } catch (err) {
      toast.error('Failed to load KYC verification status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docNumber || !fileUrl) {
      toast.error('Please enter the document number and file URL');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/vendor/kyc/submit', {
        documentType: `${docType} - #${docNumber}`,
        fileUrl
      });
      toast.success(res.data.message || 'KYC Document submitted successfully!');
      fetchKYCStatus();
      setDocNumber('');
      setFileUrl('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit document');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBanner = () => {
    const status = kycData.kycStatus;
    if (status === 'approved') {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-255 dark:border-emerald-900 text-emerald-850 dark:text-emerald-450 p-5 rounded-2xl flex items-start gap-3.5 mb-8">
          <CheckCircle className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Verification Completed</h3>
            <p className="text-xs font-semibold mt-1">Your store is approved and active. You are ready to accept global orders!</p>
          </div>
        </div>
      );
    }
    if (status === 'under_review') {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-255 dark:border-amber-900 text-amber-850 dark:text-amber-450 p-5 rounded-2xl flex items-start gap-3.5 mb-8">
          <Clock className="flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Verification Under Review</h3>
            <p className="text-xs font-semibold mt-1">Our compliance team is auditing your details. This usually takes 24-48 business hours.</p>
          </div>
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-255 dark:border-rose-900 text-rose-850 dark:text-rose-450 p-5 rounded-2xl flex items-start gap-3.5 mb-8">
          <XCircle className="flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" size={20} />
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Verification Rejected</h3>
            <p className="text-xs font-semibold mt-1">Some documents were invalid. Please review documents log and submit correct details.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-255 dark:border-blue-900 text-blue-850 dark:text-blue-450 p-5 rounded-2xl flex items-start gap-3.5 mb-8">
        <AlertCircle className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wide">Verification Pending</h3>
          <p className="text-xs font-semibold mt-1">Complete your KYC to unlock full payout access and list products globally.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      {/* Panel Header */}
      <div className="flex items-center gap-3.5 mb-8 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight dark:text-white">KYC Verification</h1>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Compliance & Identity verification</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Fetching compliance details...</p>
        </div>
      ) : (
        <div>
          {getStatusBanner()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Form */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
                <UploadCloud size={18} className="text-violet-600" /> Submit Documents
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 cursor-pointer dark:text-white"
                  >
                    <option value="GSTIN">GSTIN Registration Certificate</option>
                    <option value="PAN">Permanent Account Number (PAN)</option>
                    <option value="BANK">Bank Account / Cancelled Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Document Number</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${docType === 'GSTIN' ? '22AAAAA0000A1Z5' : docType === 'PAN' ? 'ABCDE1234F' : '9876543210'}`}
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-950 text-sm outline-none focus:border-violet-500 transition dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Document File Link (URL)</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-955 text-sm outline-none focus:border-violet-500 transition dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg shadow-violet-100 dark:shadow-none mt-6 flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Uploading details...' : 'Submit Verification'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: History */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5">Documents Log</h2>
              {kycData.kycDocuments && kycData.kycDocuments.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {kycData.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <h4 className="font-bold text-gray-950 dark:text-white truncate">{doc.documentType}</h4>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline truncate block mt-0.5">
                          View File Link →
                        </a>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        doc.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                        doc.status === 'rejected' ? 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Clock size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No documents uploaded yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
