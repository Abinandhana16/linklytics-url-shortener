import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsService } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';
import { 
  ArrowLeft, Calendar, MousePointer, ShieldAlert, 
  Globe, Laptop, Chrome, Clock, ListCollapse 
} from 'lucide-react';

const Analytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsService.getAnalytics(id);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load link analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center space-y-2">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent" />
        <p className="text-slate-400 text-sm">Aggregating analytics data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-full mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <p className="text-white text-lg font-bold mb-4">{error || 'Failed to load analytics'}</p>
        <Link to="/dashboard" className="btn-primary text-white px-6 py-3 rounded-2xl inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { url, totalClicks, lastVisited, clicksByDate, devices, browsers, countries, recentVisits } = data;

  const totalDeviceClicks = devices.reduce((sum, d) => sum + d.value, 0) || 1;
  const totalBrowserClicks = browsers.reduce((sum, b) => sum + b.value, 0) || 1;
  const totalCountryClicks = countries.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <Link to="/dashboard" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white truncate max-w-xl">
              /{url.shortCode}
            </h1>
            <p className="text-slate-400 text-sm truncate max-w-lg mt-1" title={url.originalUrl}>
              Points to: <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">{url.originalUrl}</a>
            </p>
          </div>

          <div className="bg-white/5 py-2 px-4 rounded-2xl border border-white/5 text-xs text-slate-400 font-medium">
            Created on {new Date(url.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
            <div className="bg-brand-accent/15 text-brand-accent p-3.5 rounded-2xl">
              <MousePointer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Total Click Events</p>
              <h3 className="text-2xl font-extrabold text-white">{totalClicks}</h3>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
            <div className="bg-brand-secondary/15 text-brand-secondary p-3.5 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Last Visitor Hit</p>
              <h3 className="text-sm font-bold text-white">
                {lastVisited ? new Date(lastVisited).toLocaleString() : 'Never Visited'}
              </h3>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
            <div className="bg-amber-500/10 text-amber-400 p-3.5 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Expiry Deadline</p>
              <h3 className="text-sm font-bold text-white">
                {url.expiresAt ? new Date(url.expiresAt).toLocaleString() : 'Lifetime Link'}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="glass p-8 rounded-3xl border border-white/5 mb-10">
          <h2 className="text-xl font-extrabold text-white mb-6">Click Trends (Last 7 Days)</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clicksByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151D30',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#f8fafc',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographic Breakdown Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Countries */}
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-brand-accent" />
              <span>Top Geolocations</span>
            </h3>
            <div className="space-y-4">
              {countries.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No location logs recorded</p>
              ) : (
                countries.map((c) => {
                  const pct = Math.round((c.value / totalCountryClicks) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{c.name}</span>
                        <span className="text-slate-400">{c.value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-accent h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Devices */}
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-brand-secondary" />
              <span>Devices Used</span>
            </h3>
            <div className="space-y-4">
              {devices.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No device logs recorded</p>
              ) : (
                devices.map((d) => {
                  const pct = Math.round((d.value / totalDeviceClicks) * 100);
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{d.name}</span>
                        <span className="text-slate-400">{d.value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-secondary h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Browsers */}
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center space-x-2">
              <Chrome className="w-4 h-4 text-brand-accent" />
              <span>Browser Shares</span>
            </h3>
            <div className="space-y-4">
              {browsers.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No browser logs recorded</p>
              ) : (
                browsers.map((b) => {
                  const pct = Math.round((b.value / totalBrowserClicks) * 100);
                  return (
                    <div key={b.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">{b.name}</span>
                        <span className="text-slate-400">{b.value} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-accent h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Visitor Click Log */}
        <div className="glass p-6 rounded-3xl border border-white/5">
          <h3 className="text-base font-extrabold text-white mb-6 flex items-center space-x-2">
            <ListCollapse className="w-4 h-4 text-brand-secondary" />
            <span>Recent Click Activities Log (Last 10 Visits)</span>
          </h3>

          <div className="overflow-x-auto">
            {recentVisits.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">No visitor clicks logged yet for this link</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-4">Timestamp</th>
                    <th className="pb-3 px-4">Client IP</th>
                    <th className="pb-3 px-4">Location</th>
                    <th className="pb-3 px-4">Browser / OS</th>
                    <th className="pb-3 px-4">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {recentVisits.map((visit) => (
                    <tr key={visit._id} className="text-slate-300 hover:bg-white/1.5 transition-colors">
                      <td className="py-3 px-4">{new Date(visit.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{visit.ip}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {visit.city}, {visit.country}
                      </td>
                      <td className="py-3 px-4">
                        {visit.browser} <span className="text-slate-500 text-xs">({visit.os})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/5 border border-white/5">
                          {visit.device}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
