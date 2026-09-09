import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, ChevronDown, ChevronUp, Lock, ArrowRight, 
  Search, ShieldCheck, FileText, CheckCircle2, MessageSquare
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'workers' | 'lenders' | 'security' | 'aa';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    category: 'workers',
    question: 'What is CredBridge and how does it help gig workers get loans?',
    answer: 'CredBridge aggregates earnings from platforms like Swiggy, Zomato, Uber, and more into a unified 12-month financial profile. Lenders use this verified Credit Passport to assess your real daily income stability instead of rejecting you due to a lack of traditional salary slips.'
  },
  {
    id: '2',
    category: 'security',
    question: 'Is CredBridge safe? Does it store my bank passwords or PINs?',
    answer: 'CredBridge is 100% safe and consent-driven. We use RBI-regulated Account Aggregator protocols. We NEVER ask for, store, or see your net banking passwords, UPI PINs, or debit card credentials.'
  },
  {
    id: '3',
    category: 'aa',
    question: 'How does DigiLocker & Account Aggregator consent work?',
    answer: 'DigiLocker verifies your official identity (Aadhaar / PAN) instantly without manual upload. The Account Aggregator network securely fetches encrypted bank statement statements directly from your bank with your explicit, revocable consent.'
  },
  {
    id: '4',
    category: 'workers',
    question: 'Which gig platforms can I connect (Swiggy, Zomato, Uber, etc.)?',
    answer: 'You can consolidate payouts from all major Indian gig platforms including Swiggy, Zomato, Uber, Ola, Urban Company, Porter, Blinkit, Zepto, and Rapido into a single consolidated Credit Passport.'
  },
  {
    id: '5',
    category: 'workers',
    question: 'Will generating a Credit Passport affect my CIBIL credit score?',
    answer: 'No! Generating your Credit Passport on CredBridge is a soft inquiry that has ZERO negative impact on your CIBIL score or credit history.'
  },
  {
    id: '6',
    category: 'lenders',
    question: 'How do lenders view and verify my Credit Passport?',
    answer: 'When you apply for a loan, you can share a secure, cryptographically signed PDF or digital link with your lender. Lenders verify the SHA-256 digital signature on `credbridge.in/verify/report` to guarantee authenticity.'
  },
  {
    id: '7',
    category: 'security',
    question: 'Can I revoke my data sharing consent at any time?',
    answer: 'Yes! You retain 100% control over your data. You can log into your CredBridge dashboard at any time and revoke active consent from any bank or lender with 1 click.'
  },
  {
    id: '8',
    category: 'workers',
    question: 'Is CredBridge free for gig workers?',
    answer: 'Yes! CredBridge is 100% free for gig delivery partners, drivers, and freelancers to generate, view, and download their Credit Passport.'
  }
];

export const FaqsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6600]/12 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#FF8833]/8 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0D2E28] border border-[#10B981]/40 text-[#34D399] text-[11px] font-semibold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5 text-[#34D399]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Everything You Need To Know About <span className="text-[#FF6600]">CredBridge</span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed font-normal">
            Got questions about DigiLocker verification, privacy, lender sharing, or how your income score is calculated? We've got answers.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any question (e.g. DigiLocker, CIBIL, Safety)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1E293B] border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#FF6600] shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'workers', label: 'For Gig Workers' },
              { id: 'lenders', label: 'For Lenders' },
              { id: 'security', label: 'Security & Privacy' },
              { id: 'aa', label: 'DigiLocker & AA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#FF6600] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm font-medium">
                No matching questions found for "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'border-[#FF6600]/40 bg-[#FFF6EE]/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    >
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 pr-4">
                        {faq.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isExpanded ? 'bg-[#FF6600] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center pt-6">
            <span className="font-['Caveat',cursive] text-[#FF6600] text-3xl font-bold">
              Clear, transparent, zero hidden fine print.
            </span>
          </div>

        </div>
      </section>

      {/* SUPPORT CARD */}
      <section className="py-16 bg-[#FAF9F6] border-t border-[#E4E4E7]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">Still have questions?</h3>
            <p className="text-xs text-slate-500 font-medium">Our customer support team is available 24/7 to assist you.</p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <a
              href="mailto:support@credbridge.in"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              <MessageSquare className="w-4 h-4 text-[#FF6600]" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Start your 2-minute verification today</h2>
          <p className="text-xs text-slate-400">Join 50,000+ gig delivery partners accessing fair credit.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4 fill-white/20" />
            <span>Continue with DigiLocker</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
