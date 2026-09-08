import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { LenderApplicantItem } from '../../types';

export const LenderApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<LenderApplicantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicants = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getLenderApplicants();
        setApplicants(data);
      } catch (err) {
        console.error('Failed to load applicants:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadApplicants();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Permitted Shared Applicants</h1>
          <p className="text-sm text-slate-400">Workers who have granted active time-bound consent to inspect financial evidence</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-teal-400 border border-slate-700">
          Active Consents: {applicants.length}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading permitted applicant records...</div>
      ) : applicants.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Lock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Shared Applicants Available</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No gig workers have granted active consent to your lender account yet. To test consent sharing, log in as a Worker account and grant access to this Lender from the Consent page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applicants.map((app) => (
            <div key={app.consent_id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{app.worker_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {app.occupation || 'Gig Worker'} {app.city ? `• ${app.city}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    app.verification_status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {app.verification_status}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Readiness Score</span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">{app.readiness_score} / 100</div>
                  </div>
                  <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
                    {app.score_band}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Passport #{app.passport_number}</span>
                <Link
                  to={`/lender/applicant/${app.worker_id}`}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all"
                >
                  <span>View Evidence & Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
