import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { urlService } from '../services/api';
import Navbar from '../components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Link2, Copy, Check, Edit3, Trash2, BarChart3, Search, Plus, 
  FileSpreadsheet, Calendar, ChevronDown, ChevronUp, QrCode, Download, 
  ExternalLink, AlertCircle, X, HelpCircle
} from 'lucide-react';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // URL Creation state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Bulk URL State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('');
  const [isBulking, setIsBulking] = useState(false);

  // Edit State
  const [editLink, setEditLink] = useState(null);
  const [editUrlText, setEditUrlText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // QR Modal State
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // General Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback tracker for Copy button (maps link._id to copied status)
  const [copiedStates, setCopiedStates] = useState({});

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await urlService.getMyLinks();
      if (response.success) {
        setLinks(response.data);
      }
    } catch (err) {
      setError('Failed to fetch shortened links');
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!originalUrl) {
      setError('Please enter a URL');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt || undefined,
      };
      
      const response = await urlService.shorten(payload);
      if (response.success) {
        setSuccess('Short URL generated successfully!');
        setOriginalUrl('');
        setCustomAlias('');
        setExpiresAt('');
        setShowAdvanced(false);
        fetchLinks(); // Refresh table
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBulkShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bulkCsv.trim()) {
      setError('Please paste CSV rows');
      return;
    }

    setIsBulking(true);
    try {
      const response = await urlService.bulkShorten({ csvContent: bulkCsv });
      if (response.success) {
        const addedCount = response.data?.length || 0;
        setSuccess(`Bulk shortened ${addedCount} links successfully!`);
        setBulkCsv('');
        setShowBulkModal(false);
        fetchLinks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk shortening failed');
    } finally {
      setIsBulking(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editUrlText) {
      setError('URL text cannot be empty');
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await urlService.updateUrl(editLink._id, editUrlText);
      if (response.success) {
        setSuccess('Target link updated successfully!');
        setEditLink(null);
        fetchLinks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update link');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link and all its analytics logs?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const response = await urlService.deleteUrl(id);
      if (response.success) {
        setSuccess('Link deleted successfully');
        fetchLinks();
      }
    } catch (err) {
      setError('Failed to delete the link');
    }
  };

  const handleCopy = (id, shortCode) => {
    const fullUrl = `${window.location.origin.replace('5173', '5000')}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const openQrModal = (shortCode) => {
    const fullUrl = `${window.location.origin.replace('5173', '5000')}/${shortCode}`;
    setQrCodeUrl(fullUrl);
    setShowQrModal(true);
  };

  // Computations for Stats Cards
  const totalUrlsCount = links.length;
  const totalClicksSum = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const topPerformingLink = links.reduce((prev, curr) => (curr.clicks > (prev?.clicks || 0) ? curr : prev), null);

  // Search filter implementation
  const filteredLinks = links.filter((link) => {
    const matchesOriginal = link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCode = link.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOriginal || matchesCode;
  });

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Alerts Feed */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-4 rounded-2xl flex items-start space-x-2 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm p-4 rounded-2xl flex items-start space-x-2 mb-6">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-accent" />
            <span>{success}</span>
          </div>
        )}

        {/* Shortener Core Card */}
        <div className="glass p-8 rounded-3xl border border-white/5 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-accent/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center space-x-2">
            <Link2 className="w-6 h-6 text-brand-accent" />
            <span>Create Short Link</span>
          </h2>

          <form onSubmit={handleShorten} className="space-y-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl text-base"
                  placeholder="Paste your long destination URL here..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary text-white font-bold px-8 py-4 rounded-2xl text-base shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer flex-shrink-0"
              >
                {isCreating ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>

            {/* Expandable Advanced Options (Custom Alias, Expiry Date) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>Advanced Configurations</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-6 bg-white/2.5 rounded-2xl border border-white/5 animate-fade-in">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Custom Alias (Optional)</label>
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="glass-input w-full px-4 py-3.5 rounded-2xl text-sm"
                      placeholder="e.g. spring-sale-26"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Link Expiry Date (Optional)</label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="glass-input w-full px-4 py-3.5 pr-10 rounded-2xl text-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Stats Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Shortened Links</p>
            <h3 className="text-3xl font-extrabold text-white">{totalUrlsCount}</h3>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Click Count</p>
            <h3 className="text-3xl font-extrabold text-white">{totalClicksSum}</h3>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Top Performing Code</p>
            <h3 className="text-3xl font-extrabold text-brand-accent truncate">
              {topPerformingLink ? `/${topPerformingLink.shortCode} (${topPerformingLink.clicks})` : 'None'}
            </h3>
          </div>
        </div>

        {/* Links List Toolbar */}
        <div className="glass p-6 rounded-3xl border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-10 w-full px-4 py-2.5 rounded-2xl text-sm"
                placeholder="Search links..."
              />
            </div>
            
            <button
              onClick={() => setShowBulkModal(true)}
              className="glass hover:bg-white/5 border border-white/5 hover:border-white/10 hover:text-white px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-secondary" />
              <span>Bulk Shorten CSV</span>
            </button>
          </div>

          {/* Links Table Grid */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent" />
                <p>Loading links...</p>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-base font-semibold mb-1">No short links found</p>
                <p className="text-xs">Create your first link using the form above</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-4">Destination Target</th>
                    <th className="pb-3 px-4">Short Link</th>
                    <th className="pb-3 px-4">Clicks</th>
                    <th className="pb-3 px-4">Expiry</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLinks.map((link) => {
                    const fullShortUrl = `${window.location.origin.replace('5173', '5000')}/${link.shortCode}`;
                    const isExpired = link.expiresAt && new Date() > new Date(link.expiresAt);
                    
                    return (
                      <tr key={link._id} className="text-sm hover:bg-white/1.5 transition-colors">
                        <td className="py-4 px-4 max-w-[200px] truncate">
                          <span className="text-slate-300 hover:text-white" title={link.originalUrl}>
                            {link.originalUrl}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-brand-accent select-all">
                          <div className="flex items-center space-x-1.5">
                            <a href={fullShortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center space-x-1">
                              <span>/{link.shortCode}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">{link.clicks || 0}</td>
                        <td className="py-4 px-4">
                          {link.expiresAt ? (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/10'}`}>
                              {isExpired ? 'Expired' : new Date(link.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Lifetime</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2.5">
                            <button
                              onClick={() => handleCopy(link._id, link.shortCode)}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
                              title="Copy Short Link"
                            >
                              {copiedStates[link._id] ? <Check className="w-4 h-4 text-brand-accent" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openQrModal(link.shortCode)}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
                              title="Generate QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditLink(link); setEditUrlText(link.originalUrl); }}
                              className="text-slate-400 hover:text-brand-accent transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
                              title="Edit Target URL"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/analytics/${link._id}`}
                              className="text-slate-400 hover:text-brand-secondary transition-colors p-1.5 rounded-lg hover:bg-white/5"
                              title="View Analytics"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(link._id)}
                              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* CSV Bulk Shorten Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-extrabold text-white mb-2 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-brand-secondary" />
              <span>Bulk Shorten CSV Imports</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Enter one long URL per line. (Optional comma prefix: <code>alias_name,url</code> or <code>url</code>).
            </p>
            
            <form onSubmit={handleBulkShorten} className="space-y-6">
              <textarea
                value={bulkCsv}
                onChange={(e) => setBulkCsv(e.target.value)}
                className="glass-input w-full h-48 px-4 py-3 rounded-2xl text-sm font-mono"
                placeholder="https://google.com&#10;https://github.com&#10;reddit-alias,https://reddit.com"
                required
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="glass border border-white/5 hover:bg-white/5 hover:text-white px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulking}
                  className="btn-primary text-white font-bold px-6 py-3 rounded-2xl text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isBulking ? 'Shortening Batch...' : 'Generate Short Links'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-xs p-8 rounded-3xl border border-white/5 shadow-2xl text-center relative animate-scale-in">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-6">Generated QR Code</h3>
            
            {/* Centered QR SVG */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-6">
              <QRCodeSVG id="qr-svg" value={qrCodeUrl} size={180} level="H" />
            </div>

            <p className="text-slate-400 text-xs font-mono break-all px-2 mb-6">{qrCodeUrl}</p>

            <button
              onClick={() => {
                // Quick SVG download helper
                const svgEl = document.getElementById('qr-svg');
                const svgString = new XMLSerializer().serializeToString(svgEl);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const trigger = document.createElement('a');
                trigger.href = url;
                trigger.download = `qrcode-${Date.now()}.svg`;
                document.body.appendChild(trigger);
                trigger.click();
                document.body.removeChild(trigger);
              }}
              className="btn-primary w-full text-white font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download SVG QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Target Edit Inline Modal */}
      {editLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg p-8 rounded-3xl border border-white/5 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setEditLink(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-brand-accent" />
              <span>Edit Destination URL</span>
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Short URL Code: <span className="text-brand-accent">/{editLink.shortCode}</span>
                </label>
                <input
                  type="text"
                  value={editUrlText}
                  onChange={(e) => setEditUrlText(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-2xl text-sm"
                  placeholder="https://new-destination.com"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditLink(null)}
                  className="glass border border-white/5 hover:bg-white/5 hover:text-white px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn-primary text-white font-bold px-6 py-3 rounded-2xl text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Update Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
