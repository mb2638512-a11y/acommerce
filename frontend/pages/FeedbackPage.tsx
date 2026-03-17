import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

interface Feedback {
 id: string;
 type: string;
 targetId: string;
 userId: string;
 rating: number;
 category: string | null;
 title: string | null;
 content: string;
 pros: string | null;
 cons: string | null;
 images: string | null;
 isVerified: boolean;
 helpfulCount: number;
 status: string;
 createdAt: string;
 responses: FeedbackResponse[];
}

interface FeedbackResponse {
 id: string;
 feedbackId: string;
 userId: string;
 userName: string | null;
 content: string;
 createdAt: string;
}

interface FeedbackStatistics {
 overall: {
  average: number;
  count: number;
 };
 categories: {
  category: string;
  average: number;
  count: number;
 }[];
 distribution: Record<number, number>;
}

interface FeedbackAnalytics {
 summary: {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  responseCount: number;
  trend: 'improving' | 'declining' | 'stable';
  trendChange: number;
  comparisonToMarketplace: number;
 };
 categories: {
  category: string;
  average: number;
  count: number;
 }[];
 distribution: Record<number, number>;
 recentFeedback: Feedback[];
 period: number;
}

type FeedbackType = 'seller' | 'product';

const FeedbackPage: React.FC = () => {
 const { type, id } = useParams<{ type: FeedbackType; id: string }>();
 const { user, token } = useAuth();

 const [feedback, setFeedback] = useState<Feedback[]>([]);
 const [statistics, setStatistics] = useState<FeedbackStatistics | null>(null);
 const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 // Filters
 const [selectedCategory, setSelectedCategory] = useState<string>('all');
 const [selectedRating, setSelectedRating] = useState<number | null>(null);
 const [page, setPage] = useState(1);

 // New feedback form
 const [showForm, setShowForm] = useState(false);
 const [formData, setFormData] = useState({
  rating: 5,
  title: '',
  content: '',
  pros: '',
  cons: '',
  category: 'overall',
 });
 const [submitting, setSubmitting] = useState(false);

 // Response form
 const [respondingTo, setRespondingTo] = useState<string | null>(null);
 const [responseContent, setResponseContent] = useState('');

 useEffect(() => {
  if (id) {
   loadFeedback();
   if (type === 'seller') {
    loadAnalytics();
   }
  }
 }, [id, type, page, selectedCategory, selectedRating]);

 const loadFeedback = async () => {
  if (!id || !token) return;

  setLoading(true);
  setError(null);

  try {
   const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
   });

   if (selectedCategory !== 'all') {
    params.append('category', selectedCategory);
   }
   if (selectedRating) {
    params.append('rating', selectedRating.toString());
   }

   const endpoint = type === 'seller'
    ? `/api/feedback/seller/${id}`
    : `/api/feedback/product/${id}`;

   const response = await fetch(`${endpoint}?${params}`, {
    headers: {
     'Authorization': `Bearer ${token}`,
    },
   });

   if (!response.ok) {
    throw new Error('Failed to load feedback');
   }

   const data = await response.json();
   setFeedback(data.feedback);
   setStatistics(data.statistics);
  } catch (err) {
   setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
   setLoading(false);
  }
 };

 const loadAnalytics = async () => {
  if (!id || !token || type !== 'seller') return;

  try {
   const response = await fetch(`/api/feedback/analytics/${id}?period=30`, {
    headers: {
     'Authorization': `Bearer ${token}`,
    },
   });

   if (!response.ok) {
    throw new Error('Failed to load analytics');
   }

   const data = await response.json();
   setAnalytics(data);
  } catch (err) {
   console.error('Failed to load analytics:', err);
  }
 };

 const submitFeedback = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!id || !token) return;

  setSubmitting(true);

  try {
   const feedbackType = type === 'seller' ? 'SELLER' : 'PRODUCT';

   const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     type: feedbackType,
     targetId: id,
     rating: formData.rating,
     title: formData.title || null,
     content: formData.content,
     pros: formData.pros || null,
     cons: formData.cons || null,
     category: type === 'seller' ? formData.category : null,
    }),
   });

   if (!response.ok) {
    throw new Error('Failed to submit feedback');
   }

   setShowForm(false);
   setFormData({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: '',
    category: 'overall',
   });

   loadFeedback();
  } catch (err) {
   setError(err instanceof Error ? err.message : 'Failed to submit feedback');
  } finally {
   setSubmitting(false);
  }
 };

 const submitResponse = async (feedbackId: string) => {
  if (!token || !responseContent.trim()) return;

  try {
   const response = await fetch(`/api/feedback/${feedbackId}/respond`, {
    method: 'POST',
    headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     content: responseContent,
    }),
   });

   if (!response.ok) {
    throw new Error('Failed to submit response');
   }

   setRespondingTo(null);
   setResponseContent('');
   loadFeedback();
  } catch (err) {
   setError(err instanceof Error ? err.message : 'Failed to submit response');
  }
 };

 const voteFeedback = async (feedbackId: string, vote: number) => {
  if (!token) return;

  try {
   const response = await fetch(`/api/feedback/${feedbackId}/vote`, {
    method: 'POST',
    headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vote }),
   });

   if (!response.ok) {
    throw new Error('Failed to vote');
   }

   loadFeedback();
  } catch (err) {
   console.error('Failed to vote:', err);
  }
 };

 const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
  return (
   <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
     <button
      key={star}
      type="button"
      disabled={!interactive}
      onClick={() => interactive && onChange?.(star)}
      className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
     >
      {star <= rating ? '★' : '☆'}
     </button>
    ))}
   </div>
  );
 };

 const renderAnalytics = () => {
  if (!analytics) return null;

  const { summary } = analytics;

  return (
   <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-xl font-semibold mb-4">Feedback Analytics</h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
     <div className="text-center">
      <div className="text-3xl font-bold text-indigo-600">{summary.averageRating.toFixed(1)}</div>
      <div className="text-sm text-gray-500">Average Rating</div>
     </div>
     <div className="text-center">
      <div className="text-3xl font-bold text-indigo-600">{summary.totalFeedback}</div>
      <div className="text-sm text-gray-500">Total Feedback</div>
     </div>
     <div className="text-center">
      <div className="text-3xl font-bold text-indigo-600">{summary.responseRate.toFixed(0)}%</div>
      <div className="text-sm text-gray-500">Response Rate</div>
     </div>
     <div className="text-center">
      <div className={`text-3xl font-bold ${summary.trend === 'improving' ? 'text-green-600' :
        summary.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
       }`}>
       {summary.trend === 'improving' ? '↑' : summary.trend === 'declining' ? '↓' : '→'}
      </div>
      <div className="text-sm text-gray-500">Trend</div>
     </div>
    </div>

    {summary.comparisonToMarketplace !== 0 && (
     <div className={`text-center p-3 rounded ${summary.comparisonToMarketplace > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
      {summary.comparisonToMarketplace > 0 ? '+' : ''}{summary.comparisonToMarketplace.toFixed(1)} vs marketplace average
     </div>
    )}
   </div>
  );
 };

 const renderFeedbackCard = (item: Feedback) => {
  const isOwner = user?.uid === item.userId;
  const canRespond = type === 'seller' && user;

  return (
   <div key={item.id} className="bg-white rounded-lg shadow p-6 mb-4">
    {/* Header */}
    <div className="flex justify-between items-start mb-3">
     <div>
      <div className="flex items-center gap-2 mb-1">
       {renderStars(item.rating)}
       {item.isVerified && (
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
         Verified Purchase
        </span>
       )}
      </div>
      {item.title && (
       <h4 className="font-semibold text-lg">{item.title}</h4>
      )}
     </div>
     <div className="text-sm text-gray-500">
      {new Date(item.createdAt).toLocaleDateString()}
     </div>
    </div>

    {/* Category */}
    {item.category && (
     <div className="mb-2">
      <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
       {item.category.replace('_', ' ')}
      </span>
     </div>
    )}

    {/* Content */}
    <p className="text-gray-700 mb-4">{item.content}</p>

    {/* Pros & Cons */}
    {(item.pros || item.cons) && (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {item.pros && (
       <div className="bg-green-50 p-4 rounded-lg">
        <h5 className="font-semibold text-green-700 mb-2">✓ What was good</h5>
        <p className="text-green-800">{item.pros}</p>
       </div>
      )}
      {item.cons && (
       <div className="bg-red-50 p-4 rounded-lg">
        <h5 className="font-semibold text-red-700 mb-2">✗ Could improve</h5>
        <p className="text-red-800">{item.cons}</p>
       </div>
      )}
     </div>
    )}

    {/* Seller Response */}
    {item.responses && item.responses.length > 0 && (
     <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h5 className="font-semibold text-gray-700 mb-2">Seller Response</h5>
      {item.responses.map((response) => (
       <div key={response.id} className="text-gray-600">
        <p>{response.content}</p>
        <div className="text-sm text-gray-500 mt-1">
         — {response.userName || 'Seller'} • {new Date(response.createdAt).toLocaleDateString()}
        </div>
       </div>
      ))}
     </div>
    )}

    {/* Response Form */}
    {respondingTo === item.id && (
     <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <textarea
       value={responseContent}
       onChange={(e) => setResponseContent(e.target.value)}
       placeholder="Write your response..."
       className="w-full p-3 border rounded-lg mb-2"
       rows={3}
      />
      <div className="flex gap-2">
       <button
        onClick={() => submitResponse(item.id)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
       >
        Submit Response
       </button>
       <button
        onClick={() => setRespondingTo(null)}
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
       >
        Cancel
       </button>
      </div>
     </div>
    )}

    {/* Footer Actions */}
    <div className="flex items-center justify-between pt-4 border-t">
     <div className="flex items-center gap-4">
      {/* Was this helpful */}
      <div className="flex items-center gap-2">
       <span className="text-sm text-gray-500">Was this helpful?</span>
       <button
        onClick={() => voteFeedback(item.id, 1)}
        className="text-green-600 hover:bg-green-50 px-2 py-1 rounded"
       >
        👍 {item.helpfulCount > 0 ? `(${item.helpfulCount})` : ''}
       </button>
       <button
        onClick={() => voteFeedback(item.id, -1)}
        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
       >
        👎
       </button>
      </div>
     </div>

     {/* Respond Button */}
     {canRespond && !isOwner && !item.responses?.length && (
      <button
       onClick={() => setRespondingTo(item.id)}
       className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
       Respond to Feedback
      </button>
     )}
    </div>
   </div>
  );
 };

 const renderFilters = () => {
  return (
   <div className="bg-white rounded-lg shadow p-4 mb-6">
    <div className="flex flex-wrap gap-4">
     {/* Category Filter */}
     {type === 'seller' && (
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
       <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border rounded-lg px-3 py-2"
       >
        <option value="all">All Categories</option>
        <option value="communication">Communication</option>
        <option value="shipping">Shipping</option>
        <option value="product_quality">Product Quality</option>
        <option value="overall">Overall</option>
       </select>
      </div>
     )}

     {/* Rating Filter */}
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
      <select
       value={selectedRating || ''}
       onChange={(e) => setSelectedRating(e.target.value ? parseInt(e.target.value) : null)}
       className="border rounded-lg px-3 py-2"
      >
       <option value="">All Ratings</option>
       <option value="5">5 Stars</option>
       <option value="4">4 Stars</option>
       <option value="3">3 Stars</option>
       <option value="2">2 Stars</option>
       <option value="1">1 Star</option>
      </select>
     </div>
    </div>
   </div>
  );
 };

 const renderFeedbackForm = () => {
  return (
   <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">Write Feedback</h3>

    <form onSubmit={submitFeedback}>
     {/* Rating */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
      {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
     </div>

     {/* Category (for seller feedback) */}
     {type === 'seller' && (
      <div className="mb-4">
       <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
       <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="border rounded-lg px-3 py-2 w-full"
       >
        <option value="overall">Overall Experience</option>
        <option value="communication">Communication</option>
        <option value="shipping">Shipping</option>
        <option value="product_quality">Product Quality</option>
       </select>
      </div>
     )}

     {/* Title */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
      <input
       type="text"
       value={formData.title}
       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
       placeholder="Summarize your experience"
       className="border rounded-lg px-3 py-2 w-full"
      />
     </div>

     {/* Content */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback *</label>
      <textarea
       value={formData.content}
       onChange={(e) => setFormData({ ...formData, content: e.target.value })}
       placeholder="Share your detailed experience..."
       className="border rounded-lg px-3 py-2 w-full"
       rows={4}
       required
      />
     </div>

     {/* Pros */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">What was good? (optional)</label>
      <textarea
       value={formData.pros}
       onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
       placeholder="Highlight the positive aspects..."
       className="border rounded-lg px-3 py-2 w-full"
       rows={2}
      />
     </div>

     {/* Cons */}
     <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">What could improve? (optional)</label>
      <textarea
       value={formData.cons}
       onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
       placeholder="Suggest areas for improvement..."
       className="border rounded-lg px-3 py-2 w-full"
       rows={2}
      />
     </div>

     {/* Submit */}
     <div className="flex gap-2">
      <button
       type="submit"
       disabled={submitting}
       className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
       {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      <button
       type="button"
       onClick={() => setShowForm(false)}
       className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
      >
       Cancel
      </button>
     </div>
    </form>
   </div>
  );
 };

 return (
  <div className="min-h-screen bg-gray-50 py-8">
   <div className="max-w-4xl mx-auto px-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
     <h1 className="text-2xl font-bold text-gray-900">
      {type === 'seller' ? 'Seller' : 'Product'} Feedback
     </h1>
     {user && (
      <button
       onClick={() => setShowForm(!showForm)}
       className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
       {showForm ? 'Cancel' : 'Write Feedback'}
      </button>
     )}
    </div>

    {/* Analytics (for sellers) */}
    {type === 'seller' && renderAnalytics()}

    {/* Statistics Summary */}
    {statistics && (
     <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
       <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-indigo-600">
         {statistics.overall.average.toFixed(1)}
        </div>
        <div>
         <div className="flex">{renderStars(Math.round(statistics.overall.average))}</div>
         <div className="text-sm text-gray-500">
          {statistics.overall.count} reviews
         </div>
        </div>
       </div>

       {/* Rating Distribution */}
       <div className="flex gap-2">
        {[5, 4, 3, 2, 1].map((rating) => (
         <div key={rating} className="text-center">
          <div className="w-8 h-16 bg-gray-200 rounded relative">
           <div
            className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded"
            style={{
             height: `${statistics.overall.count > 0
              ? (statistics.distribution[rating] / statistics.overall.count) * 100
              : 0}%`,
            }}
           />
          </div>
          <div className="text-xs mt-1">{rating}</div>
         </div>
        ))}
       </div>
      </div>
     </div>
    )}

    {/* Feedback Form */}
    {showForm && renderFeedbackForm()}

    {/* Filters */}
    {renderFilters()}

    {/* Error Message */}
    {error && (
     <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
      {error}
     </div>
    )}

    {/* Loading */}
    {loading && (
     <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      <p className="mt-2 text-gray-500">Loading feedback...</p>
     </div>
    )}

    {/* Feedback List */}
    {!loading && feedback.length === 0 && (
     <div className="text-center py-8 bg-white rounded-lg shadow">
      <p className="text-gray-500">No feedback yet. Be the first to leave feedback!</p>
     </div>
    )}

    {!loading && feedback.map(renderFeedbackCard)}

    {/* Pagination */}
    {feedback.length > 0 && statistics && (
     <div className="flex justify-center gap-2 mt-6">
      <button
       onClick={() => setPage(Math.max(1, page - 1))}
       disabled={page === 1}
       className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50"
      >
       Previous
      </button>
      <span className="px-4 py-2">
       Page {page} of {Math.ceil(statistics.overall.count / 10)}
      </span>
      <button
       onClick={() => setPage(page + 1)}
       disabled={page >= Math.ceil(statistics.overall.count / 10)}
       className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50"
      >
       Next
      </button>
     </div>
    )}
   </div>
  </div>
 );
};

export default FeedbackPage;
