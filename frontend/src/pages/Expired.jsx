import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home } from 'lucide-react';

const Expired = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-6 rounded-full mb-6 animate-pulse">
        <Clock className="w-12 h-12 text-brand-danger" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">Short Link Expired</h1>
      <p className="text-slate-400 max-w-sm mb-8">
        This link has reached its expiration limit set by the creator and is no longer active.
      </p>
      <Link to="/" className="btn-primary text-white font-semibold px-6 py-3.5 rounded-2xl inline-flex items-center space-x-2 cursor-pointer">
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};

export default Expired;
