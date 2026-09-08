import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>CRED<span className="text-indigo-400">BRIDGE</span></span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Financial verification infrastructure for the gig economy. Empowering gig workers with transparent, consent-based financial profiles.
            </p>
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>© {new Date().getFullYear()} CredBridge Platform. Phase 1 Frontend Foundation.</p>
            <p className="text-slate-400 font-medium">
              Disclaimer: CredBridge is an assessment-support platform, not a lender.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
