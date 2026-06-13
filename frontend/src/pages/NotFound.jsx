import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand-secondary/15 border border-brand-secondary/20 text-brand-secondary p-6 rounded-full mb-6 animate-bounce">
        <HelpCircle className="w-12 h-12 text-brand-accent" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">Link Not Found</h1>
      <p className="text-slate-400 max-w-sm mb-8">
        The short URL code you requested doesn't exist, or has been deleted by its owner. Please verify the URL.
      </p>
      <Link to="/" className="btn-primary text-white font-semibold px-6 py-3.5 rounded-2xl inline-flex items-center space-x-2 cursor-pointer">
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
