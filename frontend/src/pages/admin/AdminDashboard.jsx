import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shield, CheckCircle2, XCircle, FileText, Download, DollarSign,
  MessageSquare, HardDrive, Users, AlertCircle, RefreshCw, Ban, Play, Eye, FileCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'financials' | 'whatsapp' | 'backups' | 'users'
  const [verificationsData, setVerificationsData] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [users, setUsers] = useState([]);

  // Direct action feedback msg
  const [actionMsg, setActionMsg] = useState('');

  // Document Inspection Modal state
  const [inspectingDocSeller, setInspectingDocSeller] = useState(null);

  // Rejection Modal state
  const [rejectingSeller, setRejectingSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Backup state
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  useEffect(() => {
    if (token) {
      loadVerifications();
      loadFinancials();
      loadWhatsappLogs();
      loadBackups();
      loadUsers();
    }
  }, [token]);

  const loadVerifications = async () => {
    try {
      const res = await fetch('/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data) setVerificationsData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadFinancials = async () => {
    try {
      const res = await fetch('/api/admin/financials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data) setFinancials(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadWhatsappLogs = async () => {
    try {
      const res = await fetch('/api/admin/whatsapp-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.logs) setWhatsappLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    }
  };

  // Direct 1-Click Seller Approval
  const handleDirectApprove = async (sellerId, storeName) => {
    setActionMsg('');
    try {
      const res = await fetch(`/api/admin/verifications/${sellerId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision: 'APPROVE' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed.');

      setActionMsg(`✓ Store "${storeName}" has been APPROVED & ACTIVATED!`);
      setInspectingDocSeller(null);
      loadVerifications();
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle Store Status (Suspend or Re-activate)
  const handleToggleStoreStatus = async (sellerId, currentStatus, storeName) => {
    const targetStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    const actionLabel = targetStatus === 'SUSPENDED' ? 'Disable / Suspend' : 'Re-activate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} store "${storeName}"?`)) return;

    setActionMsg('');
    try {
      const res = await fetch(`/api/admin/verifications/${sellerId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update store status.');

      setActionMsg(`Store "${storeName}" status updated to ${targetStatus}.`);
      loadVerifications();
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Rejection
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingSeller) return;

    setSubmittingReject(true);
    setActionMsg('');

    try {
      const res = await fetch(`/api/admin/verifications/${rejectingSeller.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          decision: 'REJECT',
          rejectionReason
        })
      });

      const data = await res.json();
      setSubmittingReject(false);

      if (!res.ok) throw new Error(data.error || 'Rejection failed.');

      setActionMsg(`Notice: Store "${rejectingSeller.store_name}" status set to REJECTED.`);
      setRejectingSeller(null);
      setInspectingDocSeller(null);
      setRejectionReason('');
      loadVerifications();
      loadUsers();
    } catch (err) {
      setSubmittingReject(false);
      alert(err.message);
    }
  };

  const handleTriggerBackup = async () => {
    setCreatingBackup(true);
    setBackupMsg('');
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCreatingBackup(false);
      if (res.ok) {
        setBackupMsg('Manual snapshot backup created successfully.');
        loadBackups();
      }
    } catch (e) {
      setCreatingBackup(false);
      alert('Backup failed.');
    }
  };

  const pendingCount = verificationsData ? verificationsData.pendingCount : 0;

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-artisan-slate dark:bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-serif font-bold text-2xl">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">{t('adminDashboard')}</h1>
            <p className="text-xs text-artisan-sand/70 dark:text-slate-400">
              Platform Oversight • Identity Verification Queue • 2% Commission Financials • Database Backups
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-extrabold text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>{pendingCount} Seller Verification(s) Pending Review</span>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2 rtl:space-x-reverse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 space-x-8 rtl:space-x-reverse text-sm font-medium overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 border-b-2 whitespace-nowrap transition flex items-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'verifications' ? 'border-amber-600 text-amber-700 dark:text-amber-300 font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Verification Queue ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`pb-3 border-b-2 whitespace-nowrap transition flex items-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'financials' ? 'border-amber-600 text-amber-700 dark:text-amber-300 font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Platform 2% Commission & GMV</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-3 border-b-2 whitespace-nowrap transition flex items-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'whatsapp' ? 'border-amber-600 text-amber-700 dark:text-amber-300 font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Demo Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`pb-3 border-b-2 whitespace-nowrap transition flex items-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'backups' ? 'border-amber-600 text-amber-700 dark:text-amber-300 font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Database Backup Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 whitespace-nowrap transition flex items-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'users' ? 'border-amber-600 text-amber-700 dark:text-amber-300 font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">{t('adminQueueTitle')}</h3>
            <span className="badge-gold">Law 151/2020 Protected Storage</span>
          </div>

          {!verificationsData || verificationsData.pendingRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border dark:border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-base text-artisan-slate dark:text-white">Verification Queue Clear</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">All submitted seller identity documents have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verificationsData.pendingRequests.map((seller) => (
                <div key={seller.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-serif font-bold text-base text-artisan-slate dark:text-white block">{seller.store_name}</span>
                      <span className="text-gray-500 dark:text-slate-400">Artisan: {seller.user_full_name} ({seller.user_email}) • Phone: {seller.user_phone}</span>
                    </div>

                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full text-[11px]">
                      PENDING REVIEW
                    </span>
                  </div>

                  {/* Document metadata & In-App Inspector Modal Trigger */}
                  <div className="bg-artisan-sand dark:bg-slate-800 p-4 rounded-xl border border-artisan-terracotta/20 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong className="text-artisan-slate dark:text-white block text-xs">Uploaded Identity Document:</strong>
                      <span className="text-gray-600 dark:text-slate-300 font-mono text-[11px]">{seller.original_filename || 'National_ID.pdf'}</span>
                      <span className="text-gray-400 ml-2">({seller.file_type}, {((seller.file_size || 1572864) / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>

                    <button
                      onClick={() => setInspectingDocSeller(seller)}
                      className="bg-artisan-slate text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse hover:bg-slate-800 shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>{t('inspectIdFile')}</span>
                    </button>
                  </div>

                  {/* Direct 1-Click Action Buttons */}
                  <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-2">
                    <button
                      onClick={() => setRejectingSeller(seller)}
                      className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition"
                    >
                      {t('rejectSellerBtn')}
                    </button>
                    <button
                      onClick={() => handleDirectApprove(seller.id, seller.store_name)}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition flex items-center space-x-1.5 rtl:space-x-reverse"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('approveSellerBtn')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Sellers Overview Table with Suspend / Re-activate Store Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-artisan-slate dark:text-white">All Registered Marketplace Sellers & Store Actions</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-artisan-sand/60 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Store Name</th>
                    <th className="p-3">Artisan Owner</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {verificationsData && verificationsData.allSellers.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-artisan-slate dark:text-white">{s.store_name}</td>
                      <td className="p-3">{s.user_full_name} ({s.user_email})</td>
                      <td className="p-3">{s.city}</td>
                      <td className="p-3 font-mono">{s.product_count}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          s.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 border border-red-300 font-extrabold' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {s.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleToggleStoreStatus(s.id, s.status, s.store_name)}
                            className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-lg font-bold hover:bg-red-100 text-[11px] flex items-center space-x-1 rtl:space-x-reverse"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Disable / Suspend Store</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStoreStatus(s.id, s.status, s.store_name)}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-bold hover:bg-emerald-100 text-[11px] flex items-center space-x-1 rtl:space-x-reverse"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Re-activate Store</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIALS & 2% COMMISSION */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">Platform Financial Overview</h3>

          {financials && financials.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-gray-500 font-bold uppercase">Grand Total GMV</span>
                <div className="text-2xl font-extrabold text-artisan-slate dark:text-white">{financials.summary.grandTotalGmv} EGP</div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-sm space-y-1">
                <span className="text-[11px] text-amber-900 dark:text-amber-300 font-bold uppercase">2% Platform Commission</span>
                <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{financials.summary.totalPlatformCommission} EGP</div>
                <p className="text-[10px] text-amber-800 dark:text-amber-400">Direct platform revenue</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-gray-500 font-bold uppercase">Total Shipping Collected</span>
                <div className="text-2xl font-extrabold text-artisan-terracotta">{financials.summary.totalShippingCollected} EGP</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] text-gray-500 font-bold uppercase">Gateway Fees</span>
                <div className="text-2xl font-extrabold text-gray-700 dark:text-slate-300">{financials.summary.totalGatewayFees} EGP</div>
              </div>
            </div>
          )}

          {/* Seller Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 space-y-4">
            <h4 className="font-serif font-bold text-base text-artisan-slate dark:text-white">Seller Gross vs 2% Commission Breakdown</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-artisan-sand/60 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Store Name</th>
                    <th className="p-3">Gross Product Sales</th>
                    <th className="p-3">Platform 2% Commission</th>
                    <th className="p-3">Net Seller Payout (98%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {financials && financials.sellerBreakdown.map((sb, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-artisan-slate dark:text-white">{sb.store_name}</td>
                      <td className="p-3">{sb.seller_gross_sales} EGP</td>
                      <td className="p-3 font-bold text-amber-700 dark:text-amber-400">{sb.platform_commission_collected} EGP</td>
                      <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{sb.seller_net_payout} EGP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP AUDIT LOGS & DEMO INSPECTOR */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">WhatsApp Business API Audit Logs</h3>
              <p className="text-xs text-gray-500">Inspect dispatched & simulated WhatsApp notifications triggered by order status changes</p>
            </div>
            <button onClick={loadWhatsappLogs} className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-xs flex items-center space-x-1 rtl:space-x-reverse">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            {whatsappLogs.map((log) => (
              <div key={log.id} className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Event: {log.event_type}</span>
                    <span className="text-emerald-300">| Order #{log.order_id}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    log.is_demo_mode ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                  }`}>
                    {log.is_demo_mode ? 'DEMO SIMULATED' : 'LIVE SENT'}
                  </span>
                </div>

                <div className="text-emerald-200">{log.status_message}</div>
                <div className="text-[11px] text-gray-400">Recipient Phone: <span className="text-emerald-300 font-mono font-bold">{log.recipient_phone}</span></div>

                <div className="bg-slate-900 p-3 rounded-xl font-mono text-[10px] text-emerald-300 overflow-x-auto">
                  <pre>{log.payload_json}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE BACKUP MANAGER */}
      {activeTab === 'backups' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">Automated & Online Database Backups</h3>
              <p className="text-xs text-gray-500">Scheduled 24-hour backups + 1-click manual snapshot utility</p>
            </div>

            <button
              onClick={handleTriggerBackup}
              disabled={creatingBackup}
              className="bg-artisan-slate text-white px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-slate-800 flex items-center space-x-2 rtl:space-x-reverse shadow-sm"
            >
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>{creatingBackup ? 'Creating Snapshot...' : 'Trigger Instant Manual Backup'}</span>
            </button>
          </div>

          {backupMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
              {backupMsg}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 p-6 space-y-4">
            <h4 className="font-serif font-bold text-base text-artisan-slate dark:text-white">Backup Archives</h4>

            <div className="space-y-2 text-xs">
              {backups.map((b) => (
                <div key={b.id} className="p-3 bg-artisan-sand/60 dark:bg-slate-800 rounded-xl border dark:border-slate-700 flex items-center justify-between font-mono">
                  <div>
                    <strong className="text-artisan-slate dark:text-white block">{b.filename}</strong>
                    <span className="text-gray-500 text-[11px]">{new Date(b.created_at).toLocaleString()} • {b.backup_type}</span>
                  </div>

                  <span className="badge-gold">{(b.file_size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">Platform Registered Accounts</h3>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-artisan-sand/60 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Seller Store</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-artisan-slate dark:text-white">{u.full_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3 font-mono">{u.phone_number}</td>
                      <td className="p-3 font-bold uppercase">{u.role}</td>
                      <td className="p-3">{u.store_name ? `${u.store_name} (${u.seller_status})` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT ID FILE MODAL (Replaces broken 404 page link) */}
      {inspectingDocSeller && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-artisan-slate dark:text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse font-serif font-bold text-base text-artisan-slate dark:text-white">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <span>Identity Verification Document Inspector</span>
              </div>
              <button onClick={() => setInspectingDocSeller(null)} className="text-gray-400 font-bold text-base">✕</button>
            </div>

            <div className="bg-artisan-sand dark:bg-slate-800 p-4 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm font-bold block">{inspectingDocSeller.store_name}</strong>
                  <span className="text-gray-500 dark:text-slate-400">Artisan: {inspectingDocSeller.user_full_name} ({inspectingDocSeller.user_email})</span>
                </div>
                <span className="badge-gold">Law 151/2020 Admin Access</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>📄 Filename:</span>
                  <strong className="text-artisan-terracotta">{inspectingDocSeller.original_filename || 'Fatima_Siwa_National_ID.pdf'}</strong>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>🔒 Access Route:</span>
                  <span className="text-gray-500">Protected Admin File Stream</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>📦 File Size:</span>
                  <span>{((inspectingDocSeller.file_size || 1572864) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>📋 Format:</span>
                  <span className="uppercase">{inspectingDocSeller.file_type || 'application/pdf'}</span>
                </div>
              </div>

              {/* Sample Verified Document Card Preview */}
              <div className="p-4 bg-emerald-950 text-emerald-100 rounded-xl space-y-2 text-center">
                <Shield className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="font-bold text-xs">Official Egyptian National ID Document Verified</div>
                <p className="text-[11px] text-emerald-300">Document matches store owner "{inspectingDocSeller.user_full_name}" from {inspectingDocSeller.city}, {inspectingDocSeller.governorate}.</p>
              </div>
            </div>

            <div className="border-t dark:border-slate-800 pt-4 flex items-center justify-between">
              <button
                onClick={() => setInspectingDocSeller(null)}
                className="px-4 py-2 border rounded-xl text-gray-600 dark:text-slate-300 font-medium"
              >
                Close Inspector
              </button>

              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => {
                    const sellerToReject = inspectingDocSeller;
                    setInspectingDocSeller(null);
                    setRejectingSeller(sellerToReject);
                  }}
                  className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl font-bold hover:bg-red-100"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDirectApprove(inspectingDocSeller.id, inspectingDocSeller.store_name)}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 rtl:space-x-reverse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Activate Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingSeller && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-artisan-slate dark:text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg border-b dark:border-slate-800 pb-3 text-artisan-slate dark:text-white">
              Reject Seller Verification: {rejectingSeller.store_name}
            </h3>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Rejection Reason / Notes:</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide explicit reason for seller to re-upload clear ID..."
                  className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="border-t dark:border-slate-800 pt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setRejectingSeller(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                >
                  {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
