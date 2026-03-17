import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Dispute {
 id: string;
 orderId: string;
 reason: string;
 description: string;
 status: string;
 resolution?: string;
 refundAmount?: number;
 sellerResponse?: string;
 evidenceUrls?: string[];
 createdAt: string;
 resolvedAt?: string;
 order?: {
  id: string;
  total: number;
  date: string;
  items?: Array<{
   name: string;
   price: number;
   quantity: number;
  }>;
 };
}

const DisputeCenter: React.FC = () => {
 const navigate = useNavigate();
 const { mode } = useParams<{ mode: string }>();
 const [disputes, setDisputes] = useState<Dispute[]>([]);
 const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 // Form state
 const [orderId, setOrderId] = useState('');
 const [reason, setReason] = useState('not_received');
 const [description, setDescription] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [success, setSuccess] = useState(false);

 // Response form for sellers
 const [responseText, setResponseText] = useState('');
 const [submittingResponse, setSubmittingResponse] = useState(false);

 useEffect(() => {
  fetchDisputes();
 }, [mode]);

 const fetchDisputes = async () => {
  try {
   const token = localStorage.getItem('authToken');
   const response = await fetch('/api/disputes', {
    headers: {
     'Authorization': `Bearer ${token}`,
    },
   });

   if (!response.ok) throw new Error('Failed to fetch disputes');

   const data = await response.json();
   setDisputes(data.disputes || []);
  } catch (err) {
   console.error('Error fetching disputes:', err);
  } finally {
   setLoading(false);
  }
 };

 const handleSubmitDispute = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
   const token = localStorage.getItem('authToken');
   const response = await fetch('/api/disputes', {
    method: 'POST',
    headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     orderId,
     reason,
     description,
    }),
   });

   if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to submit dispute');
   }

   setSuccess(true);
   setTimeout(() => {
    navigate('/dispute-center/list');
   }, 2000);
  } catch (err: any) {
   setError(err.message);
  } finally {
   setSubmitting(false);
  }
 };

 const handleSubmitResponse = async (disputeId: string) => {
  setSubmittingResponse(true);
  setError('');

  try {
   const token = localStorage.getItem('authToken');
   const response = await fetch(`/api/disputes/${disputeId}/respond`, {
    method: 'PUT',
    headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     response: responseText,
    }),
   });

   if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to submit response');
   }

   // Refresh dispute details
   const updated = await response.json();
   setSelectedDispute(updated.dispute);
   setResponseText('');
  } catch (err: any) {
   setError(err.message);
  } finally {
   setSubmittingResponse(false);
  }
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'OPEN': return '#f59e0b';
   case 'UNDER_REVIEW': return '#3b82f6';
   case 'RESOLVED': return '#10b981';
   case 'CLOSED': return '#6b7280';
   default: return '#6b7280';
  }
 };

 const getReasonLabel = (reason: string) => {
  switch (reason) {
   case 'not_received': return 'Item Not Received';
   case 'not_as_described': return 'Not As Described';
   case 'damaged': return 'Item Damaged';
   case 'other': return 'Other';
   default: return reason;
  }
 };

 const renderNewDisputeForm = () => (
  <div className="dispute-form">
   <h2>Open a New Dispute</h2>
   <p className="form-description">
    If you've experienced an issue with your order that couldn't be resolved directly with the seller,
    you can open a dispute here.
   </p>

   {success ? (
    <div className="success-message">
     <h3>✓ Dispute Submitted Successfully</h3>
     <p>Your dispute has been submitted. Our team will review it shortly.</p>
    </div>
   ) : (
    <form onSubmit={handleSubmitDispute}>
     {error && <div className="error-message">{error}</div>}

     <div className="form-group">
      <label htmlFor="orderId">Order ID</label>
      <input
       type="text"
       id="orderId"
       value={orderId}
       onChange={(e) => setOrderId(e.target.value)}
       required
       placeholder="Enter your order ID"
      />
     </div>

     <div className="form-group">
      <label htmlFor="reason">Reason for Dispute</label>
      <select
       id="reason"
       value={reason}
       onChange={(e) => setReason(e.target.value)}
       required
      >
       <option value="not_received">Item Not Received</option>
       <option value="not_as_described">Not As Described</option>
       <option value="damaged">Item Damaged</option>
       <option value="other">Other</option>
      </select>
     </div>

     <div className="form-group">
      <label htmlFor="description">Description</label>
      <textarea
       id="description"
       value={description}
       onChange={(e) => setDescription(e.target.value)}
       required
       minLength={20}
       placeholder="Please describe the issue in detail (minimum 20 characters)"
       rows={5}
      />
      <span className="char-count">{description.length}/20 minimum characters</span>
     </div>

     <button type="submit" disabled={submitting} className="submit-btn">
      {submitting ? 'Submitting...' : 'Submit Dispute'}
     </button>
    </form>
   )}
  </div>
 );

 const renderDisputeList = () => (
  <div className="dispute-list">
   <h2>Your Disputes</h2>

   {loading ? (
    <div className="loading">Loading disputes...</div>
   ) : disputes.length === 0 ? (
    <div className="empty-state">
     <p>No disputes found. If you have an issue with an order, you can open a new dispute.</p>
     <button onClick={() => navigate('/dispute-center/new')} className="action-btn">
      Open New Dispute
     </button>
    </div>
   ) : (
    <div className="disputes-grid">
     {disputes.map((dispute) => (
      <div
       key={dispute.id}
       className="dispute-card"
       onClick={() => setSelectedDispute(dispute)}
      >
       <div className="dispute-header">
        <span className="order-id">Order #{dispute.orderId.slice(0, 8)}</span>
        <span
         className="status-badge"
         style={{ background: getStatusColor(dispute.status) }}
        >
         {dispute.status.replace('_', ' ')}
        </span>
       </div>
       <div className="dispute-reason">{getReasonLabel(dispute.reason)}</div>
       <div className="dispute-date">
        {new Date(dispute.createdAt).toLocaleDateString()}
       </div>
       {dispute.order && (
        <div className="dispute-amount">
         ${dispute.order.total?.toFixed(2)}
        </div>
       )}
      </div>
     ))}
    </div>
   )}
  </div>
 );

 const renderDisputeDetail = () => {
  if (!selectedDispute) return null;

  return (
   <div className="dispute-detail">
    <button onClick={() => setSelectedDispute(null)} className="back-btn">
     ← Back to List
    </button>

    <div className="detail-header">
     <h2>Dispute Details</h2>
     <span
      className="status-badge"
      style={{ background: getStatusColor(selectedDispute.status) }}
     >
      {selectedDispute.status.replace('_', ' ')}
     </span>
    </div>

    <div className="detail-grid">
     <div className="detail-section">
      <h3>Dispute Information</h3>
      <div className="detail-row">
       <span className="label">Dispute ID:</span>
       <span className="value">{selectedDispute.id}</span>
      </div>
      <div className="detail-row">
       <span className="label">Order ID:</span>
       <span className="value">{selectedDispute.orderId}</span>
      </div>
      <div className="detail-row">
       <span className="label">Reason:</span>
       <span className="value">{getReasonLabel(selectedDispute.reason)}</span>
      </div>
      <div className="detail-row">
       <span className="label">Created:</span>
       <span className="value">
        {new Date(selectedDispute.createdAt).toLocaleDateString()}
       </span>
      </div>
     </div>

     <div className="detail-section">
      <h3>Issue Description</h3>
      <p className="description">{selectedDispute.description}</p>
     </div>

     {selectedDispute.order && (
      <div className="detail-section">
       <h3>Order Details</h3>
       <div className="detail-row">
        <span className="label">Order Total:</span>
        <span className="value">${selectedDispute.order.total?.toFixed(2)}</span>
       </div>
       <div className="detail-row">
        <span className="label">Order Date:</span>
        <span className="value">
         {new Date(selectedDispute.order.date).toLocaleDateString()}
        </span>
       </div>
      </div>
     )}

     {selectedDispute.sellerResponse && (
      <div className="detail-section">
       <h3>Seller Response</h3>
       <p className="seller-response">{selectedDispute.sellerResponse}</p>
      </div>
     )}

     {selectedDispute.status === 'RESOLVED' && (
      <div className="detail-section resolution">
       <h3>Resolution</h3>
       <p>{selectedDispute.resolution}</p>
       {selectedDispute.refundAmount && (
        <div className="refund-amount">
         Refund Amount: ${selectedDispute.refundAmount.toFixed(2)}
        </div>
       )}
      </div>
     )}

     {selectedDispute.status === 'OPEN' && (
      <div className="detail-section">
       <h3>Respond to Dispute</h3>
       <textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Enter your response to this dispute..."
        rows={4}
       />
       <button
        onClick={() => handleSubmitResponse(selectedDispute.id)}
        disabled={submittingResponse || responseText.length < 10}
        className="submit-btn"
       >
        {submittingResponse ? 'Submitting...' : 'Submit Response'}
       </button>
      </div>
     )}
    </div>
   </div>
  );
 };

 return (
  <div className="dispute-center">
   <div className="dispute-header-nav">
    <button onClick={() => navigate(-1)}>← Back</button>
    <h1>Dispute Resolution Center</h1>
   </div>

   <div className="dispute-tabs">
    <button
     className={!mode || mode === 'list' ? 'active' : ''}
     onClick={() => navigate('/dispute-center/list')}
    >
     My Disputes
    </button>
    <button
     className={mode === 'new' ? 'active' : ''}
     onClick={() => navigate('/dispute-center/new')}
    >
     Open New Dispute
    </button>
   </div>

   <div className="dispute-content">
    {mode === 'new' ? renderNewDisputeForm() : selectedDispute ? renderDisputeDetail() : renderDisputeList()}
   </div>

   <style>{`
        .dispute-center {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .dispute-header-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .dispute-header-nav button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
        }

        .dispute-header-nav h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .dispute-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1rem;
        }

        .dispute-tabs button {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .dispute-tabs button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .dispute-tabs button.active {
          background: #4f46e5;
          color: white;
        }

        .dispute-content {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dispute-form h2, .dispute-list h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .form-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4f46e5;
        }

        .char-count {
          display: block;
          text-align: right;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .submit-btn {
          padding: 0.75rem 1.5rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          text-align: center;
          padding: 2rem;
        }

        .success-message h3 {
          color: #10b981;
          margin-bottom: 0.5rem;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .disputes-grid {
          display: grid;
          gap: 1rem;
        }

        .dispute-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dispute-card:hover {
          border-color: #4f46e5;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
        }

        .dispute-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .order-id {
          font-weight: 600;
          color: #111827;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .dispute-reason {
          color: #4b5563;
          margin-bottom: 0.25rem;
        }

        .dispute-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .dispute-amount {
          font-weight: 600;
          color: #111827;
          margin-top: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .action-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .dispute-detail .back-btn {
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .detail-header h2 {
          margin: 0;
        }

        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-section {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .detail-section h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .detail-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .detail-row .label {
          color: #6b7280;
          min-width: 100px;
        }

        .detail-row .value {
          color: #111827;
          font-weight: 500;
        }

        .description, .seller-response {
          color: #4b5563;
          line-height: 1.6;
        }

        .resolution {
          background: #ecfdf5;
        }

        .refund-amount {
          font-weight: 600;
          color: #10b981;
          margin-top: 0.5rem;
        }

        .detail-section textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-family: inherit;
        }

        .loading {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }

        @media (max-width: 640px) {
          .dispute-center {
            padding: 1rem;
          }

          .dispute-content {
            padding: 1rem;
          }
        }
      `}</style>
  </div>
 );
};

export default DisputeCenter;
