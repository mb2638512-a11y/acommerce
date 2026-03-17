import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/lib/api';
import { useToast } from '../context/ToastContext';
import {
 Shield,
 CheckCircle,
 XCircle,
 AlertTriangle,
 Package,
 Store,
 Clock,
 Eye,
 Filter,
 RefreshCw,
 AlertCircle,
 Check,
 X
} from 'lucide-react';

interface ModerationFlag {
 id: string;
 productId: string;
 storeId: string;
 productName: string;
 productCategory: string | null;
 status: 'PENDING' | 'FLAGGED' | 'APPROVED' | 'REJECTED';
 flags: string;
 confidence: number;
 category: string | null;
 moderatorNote: string | null;
 reviewedBy: string | null;
 reviewedAt: string | null;
 createdAt: string;
 updatedAt: string;
 store?: {
  id: string;
  name: string;
  slug: string;
 };
}

interface ModerationStats {
 totalFlags: number;
 pendingFlags: number;
 approvedCount: number;
 rejectedCount: number;
 recentFlags: ModerationFlag[];
 categoryBreakdown: { category: string; count: number }[];
}

interface ModerationDashboardProps { }

export const ModerationDashboard: React.FC<ModerationDashboardProps> = () => {
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const queryClient = useQueryClient();
 const toast = useToast();

 // Fetch moderation stats
 const { data: stats, isLoading: statsLoading } = useQuery<ModerationStats>({
  queryKey: ['moderation-stats'],
  queryFn: async () => {
   const { data } = await api.get('/api/moderation/stats');
   return data;
  },
 });

 // Fetch flagged products
 const { data: flagsData, isLoading: flagsLoading, refetch } = useQuery<{ flags: ModerationFlag[]; pagination: any }>({
  queryKey: ['moderation-flags', statusFilter],
  queryFn: async () => {
   const params = new URLSearchParams();
   if (statusFilter !== 'all') {
    params.append('status', statusFilter);
   }
   const { data } = await api.get(`/api/moderation/flags?${params}`);
   return data;
  },
 });

 // Approve mutation
 const approveMutation = useMutation({
  mutationFn: async (id: string) => {
   const { data } = await api.put(`/api/moderation/approve/${id}`, {});
   return data;
  },
  onSuccess: () => {
   toast.success('Product approved successfully');
   queryClient.invalidateQueries({ queryKey: ['moderation-flags'] });
   queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
  },
  onError: () => {
   toast.error('Failed to approve product');
  },
 });

 // Reject mutation
 const rejectMutation = useMutation({
  mutationFn: async (id: string) => {
   const { data } = await api.put(`/api/moderation/reject/${id}`, {});
   return data;
  },
  onSuccess: () => {
   toast.success('Product rejected and archived');
   queryClient.invalidateQueries({ queryKey: ['moderation-flags'] });
   queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
  },
  onError: () => {
   toast.error('Failed to reject product');
  },
 });

 const parseFlags = (flags: string): string[] => {
  try {
   return JSON.parse(flags);
  } catch {
   return [];
  }
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'PENDING':
    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
   case 'FLAGGED':
    return 'bg-red-500/20 text-red-300 border-red-500/30';
   case 'APPROVED':
    return 'bg-green-500/20 text-green-300 border-green-500/30';
   case 'REJECTED':
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
   default:
    return 'bg-gray-500/20 text-gray-300';
  }
 };

 const flags = flagsData?.flags || [];
 const isLoading = statsLoading || flagsLoading;

 return (
  <div className="space-y-6 animate-fade-in">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-bold text-white flex items-center gap-3">
      <Shield className="text-cyan-400" size={32} /> AI Content Guard
     </h1>
     <p className="text-white/50 mt-1">Content moderation and compliance monitoring for ACommerce</p>
    </div>
    <button
     onClick={() => refetch()}
     className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
    >
     <RefreshCw size={16} /> Refresh
    </button>
   </div>

   {/* Stats Cards */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5">
     <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
       <AlertTriangle size={20} />
      </div>
      <h3 className="font-bold text-white">Total Flags</h3>
     </div>
     <div className="text-3xl font-bold text-white">{stats?.totalFlags || 0}</div>
     <div className="text-xs text-white/50 mt-1">All time</div>
    </div>

    <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5">
     <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300">
       <Clock size={20} />
      </div>
      <h3 className="font-bold text-white">Pending</h3>
     </div>
     <div className="text-3xl font-bold text-yellow-300">{stats?.pendingFlags || 0}</div>
     <div className="text-xs text-white/50 mt-1">Requires review</div>
    </div>

    <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5">
     <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-green-500/10 text-green-300">
       <CheckCircle size={20} />
      </div>
      <h3 className="font-bold text-white">Approved</h3>
     </div>
     <div className="text-3xl font-bold text-green-300">{stats?.approvedCount || 0}</div>
     <div className="text-xs text-white/50 mt-1">Products cleared</div>
    </div>

    <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5">
     <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-red-500/10 text-red-300">
       <XCircle size={20} />
      </div>
      <h3 className="font-bold text-white">Rejected</h3>
     </div>
     <div className="text-3xl font-bold text-red-300">{stats?.rejectedCount || 0}</div>
     <div className="text-xs text-white/50 mt-1">Products blocked</div>
    </div>
   </div>

   {/* Category Breakdown */}
   {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
    <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5">
     <h3 className="font-bold text-white mb-4 flex items-center gap-2">
      <AlertCircle size={18} className="text-cyan-400" /> Violation Categories
     </h3>
     <div className="flex flex-wrap gap-2">
      {stats.categoryBreakdown.map((item, idx) => (
       <div
        key={idx}
        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300"
       >
        {item.category}: {item.count}
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Filters */}
   <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
     <Filter size={18} className="text-white/50" />
     <span className="text-white/70 text-sm">Status:</span>
    </div>
    <select
     value={statusFilter}
     onChange={(e) => setStatusFilter(e.target.value)}
     className="bg-[#0f111a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
    >
     <option value="all">All</option>
     <option value="PENDING">Pending</option>
     <option value="FLAGGED">Flagged</option>
     <option value="APPROVED">Approved</option>
     <option value="REJECTED">Rejected</option>
    </select>
   </div>

   {/* Flagged Products List */}
   <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl overflow-hidden">
    {isLoading ? (
     <div className="p-8 text-center text-white/50">
      <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
      Loading flagged products...
     </div>
    ) : flags.length === 0 ? (
     <div className="p-8 text-center text-white/50">
      <Shield className="mx-auto mb-2" size={32} />
      <p>No flagged products found</p>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full">
       <thead>
        <tr className="border-b border-white/10">
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Product</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Store</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Category</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Confidence</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
         <th className="text-left p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Actions</th>
        </tr>
       </thead>
       <tbody>
        {flags.map((flag) => (
         <tr key={flag.id} className="border-b border-white/5 hover:bg-white/5">
          <td className="p-4">
           <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
             <Package size={16} className="text-cyan-400" />
            </div>
            <div>
             <div className="font-medium text-white">{flag.productName}</div>
             <div className="text-xs text-white/50">{flag.productCategory || 'Uncategorized'}</div>
            </div>
           </div>
          </td>
          <td className="p-4">
           <div className="flex items-center gap-2 text-white/70">
            <Store size={14} />
            {flag.store?.name || 'Unknown Store'}
           </div>
          </td>
          <td className="p-4">
           <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
            {flag.category || 'Unknown'}
           </span>
          </td>
          <td className="p-4">
           <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
             <div
              className={`h-full rounded-full ${flag.confidence >= 0.8 ? 'bg-red-500' : flag.confidence >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
               }`}
              style={{ width: `${flag.confidence * 100}%` }}
             />
            </div>
            <span className="text-xs text-white/50">{Math.round(flag.confidence * 100)}%</span>
           </div>
          </td>
          <td className="p-4">
           <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(flag.status)}`}>
            {flag.status}
           </span>
          </td>
          <td className="p-4 text-sm text-white/50">
           {new Date(flag.createdAt).toLocaleDateString()}
          </td>
          <td className="p-4">
           {flag.status === 'PENDING' || flag.status === 'FLAGGED' ? (
            <div className="flex items-center gap-2">
             <button
              onClick={() => approveMutation.mutate(flag.id)}
              disabled={approveMutation.isPending}
              className="p-2 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              title="Approve"
             >
              <Check size={16} />
             </button>
             <button
              onClick={() => rejectMutation.mutate(flag.id)}
              disabled={rejectMutation.isPending}
              className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Reject"
             >
              <X size={16} />
             </button>
            </div>
           ) : (
            <button
             className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors"
             title="View Details"
            >
             <Eye size={16} />
            </button>
           )}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>

   {/* Prohibited Categories Info */}
   <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/20 rounded-xl p-5">
    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
     <AlertTriangle size={18} className="text-red-400" /> Prohibited Categories
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
     {[
      'Weapons & Firearms',
      'Alcohol & Tobacco',
      'Pork & Non-Halal',
      'Drugs & Narcotics',
      'Adult Content',
      'Counterfeit Goods',
      'Stolen Property',
      'Illegal Services'
     ].map((category) => (
      <div key={category} className="flex items-center gap-2 text-red-300">
       <XCircle size={14} /> {category}
      </div>
     ))}
    </div>
   </div>
  </div>
 );
};

export default ModerationDashboard;
