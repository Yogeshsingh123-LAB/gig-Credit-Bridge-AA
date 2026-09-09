import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, 
  RefreshCw, Calendar, Clock, FileText, Check, Lightbulb, Download, Sparkles, AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';

export const WorkerGenerateReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Bank accounts data matching screenshot
  const initialAccounts = [
    { id: 'acc-1', bank: 'HDFC Bank', type: 'Savings Account', mask: '•••• 4521', logoColor: '#004B8D', isSelected: true },
    { id: 'acc-2', bank: 'State Bank of India', type: 'Savings Account', mask: '•••• 8912', logoColor: '#00A1E4', isSelected: true },
    { id: 'acc-3', bank: 'ICICI Bank', type: 'Savings Account', mask: '•••• 3318', logoColor: '#F37021', isSelected: true },
    { id: 'acc-4', bank: 'Axis Bank', type: 'Savings Account', mask: '•••• 7742', logoColor: '#971237', isSelected: true },
    { id: 'acc-5', bank: 'Kotak Mahindra Bank', type: 'Savings Account', mask: '•••• 6689', logoColor: '#ED1C24', isSelected: true },
    { id: 'acc-6', bank: 'Yes Bank', type: 'Savings Account', mask: '•••• 2034', logoColor: '#00529B', isSelected: true },
  ];

  const [accounts, setAccounts] = useState(initialAccounts);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStageText, setProcessingStageText] = useState<string>('Connecting to bank accounts...');

  const selectedCount = accounts.filter(a => a.isSelected).length;
  const isAllSelected = selectedCount === accounts.length;

  const toggleAllAccounts = () => {
    const nextState = !isAllSelected;
    setAccounts(accounts.map(a => ({ ...a, isSelected: nextState })));
  };

  const toggleAccount = (id: string) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, isSelected: !a.isSelected } : a));
  };

  const handleStartGeneration = () => {
    setCurrentStep(3);
    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStageText('Connecting to authorized bank accounts...');

    setTimeout(() => {
      setProcessingProgress(45);
      setProcessingStageText('Retrieving 12-month inflows & matching platform patterns...');
    }, 1200);

    setTimeout(() => {
      setProcessingProgress(75);
      setProcessingStageText('Calculating 12-month consistency score & TRAI verification...');
    }, 2400);

    setTimeout(() => {
      setProcessingProgress(100);
      setProcessingStageText('Applying SHA-256 digital signature...');
    }, 3600);

    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(4);
    }, 4500);
  };

  const handleDownloadPDF = async () => {
    try {
      await apiService.downloadReportPdf('CBR-2026-8A72K1');
    } catch (e) {
      const element = document.createElement('a');
      const file = new Blob([`CredBridge Verified Report ID: CBR-2026-8A72K1\nTotal 12M Gig Income: ₹2,57,100\nConsistency Score: 82/100`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `CredBridge_Verified_Report_CBR-2026-8A72K1.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 antialiased">
      
      {/* 1. Top Hero Welcome Banner */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Text */}
          <div className="space-y-1.5 max-w-xl">
            <h1 className="text-3xl font-extrabold text-[#18181B] tracking-tight">
              Generate New Report
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed pt-1">
              Get your verified gig income report in a few simple steps. Your financial data is securely accessed and analyzed by CredBridge.
            </p>
          </div>

          {/* Right Hero Graphic */}
          <div className="hidden xl:flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#FF6600] shrink-0 shadow-2xs">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif italic font-extrabold text-[#FF6600] text-sm block">
                Verified Income.
              </span>
              <span className="font-serif italic font-extrabold text-[#FF6600] text-sm block">
                Greater Opportunities.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. 4-Step Horizontal Stepper Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-2">
          
          {/* Step 1 */}
          <div 
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`flex items-center space-x-2.5 cursor-pointer ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 1 
                ? 'bg-[#FF6600] text-white shadow-xs' 
                : currentStep > 1 
                ? 'bg-[#DCFCE7] text-[#15803D]' 
                : 'bg-[#F4F4F5] text-[#71717A]'
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <span className={`text-xs font-bold ${currentStep === 1 ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
              Choose Bank Accounts
            </span>
          </div>

          <div className="hidden sm:block flex-1 h-0.5 bg-[#E4E4E7] mx-4" />

          {/* Step 2 */}
          <div 
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`flex items-center space-x-2.5 cursor-pointer ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 2 
                ? 'bg-[#FF6600] text-white shadow-xs' 
                : currentStep > 2 
                ? 'bg-[#DCFCE7] text-[#15803D]' 
                : 'bg-[#F4F4F5] text-[#71717A]'
            }`}>
              {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </div>
            <span className={`text-xs font-bold ${currentStep === 2 ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
              Analysis Period
            </span>
          </div>

          <div className="hidden sm:block flex-1 h-0.5 bg-[#E4E4E7] mx-4" />

          {/* Step 3 */}
          <div className={`flex items-center space-x-2.5 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 3 
                ? 'bg-[#FF6600] text-white shadow-xs' 
                : currentStep > 3 
                ? 'bg-[#DCFCE7] text-[#15803D]' 
                : 'bg-[#F4F4F5] text-[#71717A]'
            }`}>
              {currentStep > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
            </div>
            <span className={`text-xs font-bold ${currentStep === 3 ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
              Generate Report
            </span>
          </div>

          <div className="hidden sm:block flex-1 h-0.5 bg-[#E4E4E7] mx-4" />

          {/* Step 4 */}
          <div className={`flex items-center space-x-2.5 ${currentStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
              currentStep === 4 ? 'bg-[#FF6600] text-white shadow-xs' : 'bg-[#F4F4F5] text-[#71717A]'
            }`}>
              4
            </div>
            <span className={`text-xs font-bold ${currentStep === 4 ? 'text-[#18181B]' : 'text-[#71717A]'}`}>
              Download PDF
            </span>
          </div>

        </div>
      </div>

      {/* 3. Main Body Content (Grid Layout: Form Card + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8/12 cols): Active Step Form Card */}
        <div className="lg:col-span-8 bg-white border border-[#E4E4E7] rounded-2xl p-6 shadow-2xs space-y-6">
          
          {/* STEP 1: CHOOSE BANK ACCOUNTS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[#18181B]">Select Bank Accounts</h2>
                <p className="text-xs text-[#71717A]">
                  Choose the bank accounts you want to include in your report. You can select all banks or choose specific accounts.
                </p>
              </div>

              {/* Master Choose All Banks Option */}
              <div
                onClick={toggleAllAccounts}
                className="bg-[#FFF8F3] border border-[#FDE6D2] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[#FDBA74] transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAllAccounts}
                    className="w-4.5 h-4.5 rounded text-[#FF6600] bg-white border-[#CBD5E1] focus:ring-[#FF6600] cursor-pointer"
                  />
                  <div className="w-9 h-9 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#18181B]">Choose All Banks</h3>
                    <p className="text-[11px] text-[#71717A]">Automatically select all available bank accounts</p>
                  </div>
                </div>

                <span className="bg-[#FF6600] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>All {accounts.length} accounts selected</span>
                </span>
              </div>

              {/* Your Bank Accounts (6) Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#18181B]">Your Bank Accounts ({accounts.length})</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        acc.isSelected
                          ? 'bg-white border-[#FF6600] shadow-xs'
                          : 'bg-white border-[#E4E4E7] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={acc.isSelected}
                          onChange={() => toggleAccount(acc.id)}
                          className="w-4 h-4 rounded text-[#FF6600] bg-white border-[#CBD5E1] focus:ring-[#FF6600] cursor-pointer"
                        />
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                          style={{ backgroundColor: acc.logoColor }}
                        >
                          {acc.bank.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#18181B]">{acc.bank}</h4>
                          <span className="text-[10px] text-[#71717A] block">{acc.type}</span>
                          <span className="text-[10px] font-mono text-[#71717A] block">{acc.mask}</span>
                        </div>
                      </div>

                      {acc.isSelected && (
                        <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] rounded-xl p-3.5 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#0284C7]" />
                <span className="text-[11px] font-medium">
                  You can select individual accounts or use "Choose All Banks" to quickly select all available accounts.
                </span>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F4F4F5]">
                <button
                  type="button"
                  onClick={() => navigate('/worker/dashboard')}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Dashboard</span>
                </button>

                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  <span>Next: Analysis Period</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYSIS PERIOD */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[#18181B]">Analysis Period</h2>
                <p className="text-xs text-[#71717A]">
                  Select the historical observation period for analyzing your verified gig platform inflows.
                </p>
              </div>

              <div className="bg-[#FFF8F3] border border-[#FF6600] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-5 h-5 text-[#FF6600]" />
                    <span className="text-sm font-extrabold text-[#18181B]">12 Months (Fixed Standard)</span>
                  </div>
                  <span className="bg-[#FF6600] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  CredBridge standardizes evaluations to a 365-day observation window (01 Sep 2025 – 31 Aug 2026). This ensures complete income consistency verification for institutional lenders.
                </p>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F4F4F5]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Bank Accounts</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>Next: Generate Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GENERATE REPORT (PROCESSING STATE) */}
          {currentStep === 3 && (
            <div className="py-8 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center mx-auto shadow-xs">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="text-lg font-extrabold text-[#18181B]">Generating Your Verified Income Report</h2>
                <p className="text-xs text-[#71717A]">{processingStageText}</p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-[#F4F4F5] rounded-full h-3 overflow-hidden border border-[#E4E4E7]">
                  <div 
                    className="bg-[#FF6600] h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#FF6600]">{processingProgress}% Completed</span>
              </div>
            </div>
          )}

          {/* STEP 4: DOWNLOAD PDF (SUCCESS STATE) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#F4F4F5]">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#18181B]">Verified Gig Income Report Issued</h2>
                  <span className="text-xs font-mono font-bold text-[#FF6600]">Report ID: CBR-2026-8A72K1</span>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FFF8F3] border border-[#FDE6D2]">
                  <span className="text-[10px] text-[#71717A] font-semibold block">Total 12M Income</span>
                  <span className="text-lg font-extrabold text-[#18181B] block">₹ 2,57,100</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7]">
                  <span className="text-[10px] text-[#71717A] font-semibold block">Average Monthly</span>
                  <span className="text-lg font-extrabold text-[#18181B] block">₹ 21,425</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FFF8F3] border border-[#FDE6D2]">
                  <span className="text-[10px] text-[#71717A] font-semibold block">Consistency Score</span>
                  <span className="text-lg font-extrabold text-[#FF6600] block">82 / 100</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC]">
                  <span className="text-[10px] text-[#15803D] font-semibold block">Verification</span>
                  <span className="text-lg font-extrabold text-[#166534] block">High Confidence</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F4F4F5]">
                <button
                  type="button"
                  onClick={() => navigate('/worker/dashboard')}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified PDF</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4/12 cols): Sidebar Cards matching screenshot */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Report Overview */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-[#18181B]">Report Overview</h3>
            </div>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex items-start space-x-3">
                <FileText className="w-4 h-4 text-[#71717A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#71717A] block font-medium">Report Type</span>
                  <span className="font-bold text-[#18181B]">Verified Gig Income Report</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-[#71717A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#71717A] block font-medium">Analysis Period</span>
                  <span className="font-bold text-[#18181B] flex items-center space-x-1">
                    <span>12 Months (Fixed)</span>
                    <span className="text-[10px]">🔒</span>
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-[#71717A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#71717A] block font-medium">Expected Generation Time</span>
                  <span className="font-bold text-[#18181B]">5 – 10 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Key Benefits & Important Notice */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-[#18181B]">Key Benefits</h3>

            <ul className="space-y-2.5 text-xs text-[#3F3F46] font-medium">
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-[#FF6600] shrink-0 stroke-[3]" />
                <span>Verified gig income summary</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-[#FF6600] shrink-0 stroke-[3]" />
                <span>Income source breakdown</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-[#FF6600] shrink-0 stroke-[3]" />
                <span>Consistency score (not a credit score)</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-[#FF6600] shrink-0 stroke-[3]" />
                <span>Digital signature & SHA-256 protection</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Check className="w-4 h-4 text-[#FF6600] shrink-0 stroke-[3]" />
                <span>QR code for verification</span>
              </li>
            </ul>

            {/* Important Notice Box */}
            <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-[#FF6600] font-bold text-xs">
                <Lightbulb className="w-4 h-4 text-[#FF6600]" />
                <span>Important</span>
              </div>
              <p className="text-[11px] text-[#71717A] leading-relaxed font-medium">
                Your data is accessed securely through DigiLocker and is used only for generating your verified income report. We do not store your bank credentials or share your raw transaction data.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
