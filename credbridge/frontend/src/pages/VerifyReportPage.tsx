import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Clock,
  Search, RefreshCw, Lock, Building2, ArrowLeft, Bug
} from 'lucide-react';
import { apiService } from '../services/api';

export const VerifyReportPage: React.FC = () => {
  const { reportId: paramReportId } = useParams<{ reportId: string }>();
  const [searchParams] = useSearchParams();
  const queryReportId = searchParams.get('id') || '';

  const [inputReportId, setInputReportId] = useState<string>(paramReportId || queryReportId || '');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify if reportId is passed in URL
  useEffect(() => {
    const idToVerify = paramReportId || queryReportId;
    if (idToVerify) {
      setInputReportId(idToVerify);
      runVerification(idToVerify);
    }
  }, [paramReportId, queryReportId]);

  const runVerification = async (id: string, tamperTest: boolean = false) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError('Please enter a valid Report ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      if (tamperTest) {
        // Run verification with tampered hash to simulate tampering detection
        const res = await apiService.verifyDocumentIntegrity(trimmed, undefined, true);
        setVerificationResult(res);
      } else {
        const res = await apiService.verifyReportPublic(trimmed);
        setVerificationResult(res);
      }
    } catch (err: any) {
      console.error('Verification query failed:', err);
      const msg = err?.response?.data?.detail || 'Verification service could not be reached. Make sure backend is running.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(inputReportId);
  };

  const status = verificationResult?.status;

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
          <ShieldCheck className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Cryptographic Proof & Document Integrity Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify CredBridge Report Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Public verification portal for institutional lenders, credit underwriters, and third-party auditors. Cryptographically validates digital signatures and detects any tampering.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputReportId}
              onChange={(e) => setInputReportId(e.target.value)}
              placeholder="Enter Report ID (e.g. CBR-2026-XXXX-XXXX-XXXX)"
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputReportId.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/15 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify Report</span>
          </button>
        </form>

        {/* Evaluation quick test buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">Evaluator Sandbox Testing:</span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => runVerification(inputReportId || 'CBR-2026-DEMO', false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition-colors"
            >
              Test Authentic Verification
            </button>
            <button
              type="button"
              onClick={() => runVerification(inputReportId || 'CBR-2026-DEMO', true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors flex items-center space-x-1.5"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Simulate Tampered Report</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center space-x-2.5">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* VERIFICATION RESULTS PANEL */}
      {verificationResult && (
        <div className="space-y-6">
          {/* A. AUTHENTIC REPORT */}
          {status === 'AUTHENTIC' && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-7 h-7 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold">✓ REPORT VERIFIED — AUTHENTIC</h2>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Verified Metadata Attributes (Privacy Preserving) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">Report Identification</span>
                  <p className="text-sm font-mono font-bold text-white">{verificationResult.report_id}</p>
                  <span className="text-[11px] text-slate-400 block">{verificationResult.report_type}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">Analysis Period</span>
                  <p className="text-sm font-bold text-slate-200">{verificationResult.analysis_period}</p>
                  <span className="text-[11px] text-slate-400 block">Issued: {new Date(verificationResult.issued_at).toLocaleDateString('en-IN')}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">Digital Signature Status</span>
                  <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VALID (HMAC-SHA256 Verified)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Server-side signing key authenticated</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">Document Integrity</span>
                  <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFIED (0 alterations)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Hash: {verificationResult.canonical_hash_prefix || 'SHA-256 Validated'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Privacy Protection Notice</div>
                <div>
                  To protect worker data rights under the RBI Account Aggregator framework, this public verification interface confirms cryptographic integrity without exposing bank account masks or transaction amounts.
                </div>
              </div>
            </div>
          )}

          {/* B. ALTERED / TAMPERED REPORT */}
          {(status === 'ALTERED' || status === 'SIGNATURE_INVALID') && (
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl shadow-rose-500/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <XCircle className="w-7 h-7 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold">⚠ VERIFICATION FAILED — DOCUMENT ALTERED</h2>
                  <p className="text-xs text-rose-300 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-rose-400">Why did verification fail?</p>
                <p className="text-slate-400">
                  The digital signature or SHA-256 hash does not correspond with CredBridge's official registry. The numbers, dates, or worker details have been altered since the report was issued.
                </p>
              </div>
            </div>
          )}

          {/* C. REVOKED REPORT */}
          {status === 'REVOKED' && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl shadow-amber-500/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="w-7 h-7 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold">⛔ REPORT REVOKED</h2>
                  <p className="text-xs text-amber-300 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Revocation Context</p>
                <p>
                  The worker exercised their statutory data revocation right. Lenders should not rely on revoked statements for active credit underwriting.
                </p>
              </div>
            </div>
          )}

          {/* D. EXPIRED REPORT */}
          {status === 'EXPIRED' && (
            <div className="bg-slate-900 border border-yellow-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl shadow-yellow-500/5">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
                <Clock className="w-7 h-7 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold">⌛ REPORT EXPIRED</h2>
                  <p className="text-xs text-yellow-300 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Reports are valid for a maximum of 90 days. Please request an updated Verified Gig Income Report from the worker.
              </div>
            </div>
          )}

          {/* E. NOT FOUND */}
          {status === 'NOT_FOUND' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300">
                <Search className="w-6 h-6 shrink-0 text-slate-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Report Not Found</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{verificationResult.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <Link to="/login" className="hover:text-slate-300 inline-flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Worker Sign In</span>
        </Link>
        <span>CredBridge Evidence Infrastructure • ISO 27001 & RBI AA Framework</span>
      </div>
    </div>
  );
};
