import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, BarChart2, Shield, QrCode, Globe, Layers, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-secondary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-brand-accent to-brand-secondary p-2 rounded-xl">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">Linklytics</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl border border-brand-accent/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-grow flex flex-col justify-center items-center text-center py-16 md:py-24 z-10">
        <div className="inline-flex items-center space-x-2 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded-full py-1.5 px-4 text-xs font-semibold uppercase tracking-wider mb-8">
          <span>Introducing Linklytics 2.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
          Transform Every Click Into <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-brand-accent via-emerald-400 to-brand-secondary bg-clip-text text-transparent">
            Actionable Insights.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          The ultimate dashboard for links optimization. Create custom short URLs, generate dynamic QR codes, and measure device demographics and geolocation trends instantly.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center items-center w-full max-w-md">
          <Link
            to="/register"
            className="btn-primary flex items-center justify-center space-x-2 text-white font-semibold w-full sm:w-auto px-8 py-4 rounded-2xl shadow-lg shadow-brand-accent/15 cursor-pointer text-base"
          >
            <span>Start Shortening Free</span>
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </Link>
          <Link
            to="/login"
            className="glass flex items-center justify-center text-slate-300 hover:text-white font-semibold w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all text-base"
          >
            View Dashboard Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-brand-accent/20 transition-all group">
            <div className="bg-brand-accent/10 text-brand-accent p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Click Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track clicks in real-time. Understand traffic trendlines, identify top referrer domains, and visualize analytics over customized days ranges.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-brand-secondary/20 transition-all group">
            <div className="bg-brand-secondary/10 text-brand-secondary p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Geographic Decoding</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Map exactly where clicks originate. Capture visitor countries, city locations, operating systems, and device breakdowns dynamically.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-brand-accent/20 transition-all group">
            <div className="bg-brand-accent/10 text-brand-accent p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">QR Code Integrations</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate fully compliant vector SVG QR codes automatically for offline marketing. Customize short URL aliases and set expiration dates instantly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 z-10 text-center text-slate-500 text-xs">
        <p className="mb-2">© {new Date().getFullYear()} Linklytics URL Shortener. All rights reserved.</p>
        <p>
          This project is a part of a hackathon run by{' '}
          <a href="https://katomaran.com" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">
            https://katomaran.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Landing;
