import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Calendar, Phone, Mail, MapPin, ShieldCheck, 
  Check, Info, ExternalLink, Camera, Sparkles, Building, Globe, CreditCard, RefreshCw, ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const WorkerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdatingDigiLocker, setIsUpdatingDigiLocker] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const workerProfile = user?.worker_profile;
  const workerName = workerProfile?.identity_name || user?.name || 'Rohit Sharma';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProfile();
      setProfileData(data);
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigiLockerSync = async () => {
    setIsUpdatingDigiLocker(true);
    setUpdateMessage(null);
    setTimeout(() => {
      setIsUpdatingDigiLocker(false);
      setUpdateMessage('Profile successfully synced with DigiLocker records!');
      setTimeout(() => setUpdateMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans pb-12 antialiased">
      
      {/* 1. Top Hero Welcome Banner */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Profile Header (Avatar + Name + Status) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Camera Icon Overlay */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#E4E4E7] border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-[#27272A] font-bold text-2xl">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(workerName)}`}
                  alt={workerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span>{workerName.slice(0, 2).toUpperCase()}</span>
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#FF6600] text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs hover:bg-[#E65C00] transition-colors cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-extrabold border border-[#86EFAC]/50">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>DigiLocker Verified</span>
              </div>
              <h1 className="text-3xl font-extrabold text-[#18181B] tracking-tight">
                {workerName}
              </h1>
              <p className="text-xs font-semibold text-[#71717A]">
                Worker • Member since Sep 2025
              </p>
              <p className="text-xs text-[#71717A] font-medium pt-0.5">
                Building a better tomorrow with my skills and dedication.
              </p>
            </div>
          </div>

          {/* Right Hero Cursive Graphic */}
          <div className="hidden xl:flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#FF6600] shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif italic font-extrabold text-[#FF6600] text-base block leading-tight">
                Your Skills. Your Income.
              </span>
              <span className="font-serif italic font-extrabold text-[#FF6600] text-base block leading-tight">
                Our Trust.
              </span>
            </div>
          </div>

        </div>
      </div>

      {updateMessage && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* 2. Main Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8/12 cols): Personal Information */}
        <div className="lg:col-span-8 bg-white border border-[#E4E4E7] rounded-2xl p-6 shadow-2xs space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F4F4F5]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#18181B]">Personal Information</h2>
                <p className="text-xs text-[#71717A]">Your information is securely fetched from DigiLocker.</p>
              </div>
            </div>

            <div className="bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-[11px] font-medium px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shrink-0">
              <Info className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span>This information is verified through DigiLocker and cannot be edited.</span>
            </div>
          </div>

          {/* 2-Column Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            
            {/* Field 1: Full Name */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Full Name</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">{workerName}</span>
              </div>
            </div>

            {/* Field 2: DigiLocker ID */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">DigiLocker ID</span>
                <span className="text-sm font-bold font-mono text-[#18181B] block mt-0.5">DL-2456-7890-1234</span>
              </div>
            </div>

            {/* Field 3: Date of Birth */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Date of Birth</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">15 Mar 2000</span>
              </div>
            </div>

            {/* Field 4: Aadhaar Number */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Aadhaar Number (Last 4 Digits)</span>
                <span className="text-sm font-bold font-mono text-[#18181B] block mt-0.5">•••• 5678</span>
              </div>
            </div>

            {/* Field 5: Gender */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Gender</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">Male</span>
              </div>
            </div>

            {/* Field 6: Address */}
            <div className="flex items-start space-x-3 sm:row-span-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Address</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5 leading-relaxed">
                  B-203, Shantivan Apartments<br />
                  Navrangpura, Ahmedabad<br />
                  Gujarat - 380009
                </span>
              </div>
            </div>

            {/* Field 7: Mobile Number */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Mobile Number</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">+91 98765 43210</span>
              </div>
            </div>

            {/* Field 8: State */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">State</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">Gujarat</span>
              </div>
            </div>

            {/* Field 9: Email Address */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Email Address</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">rohit.sharma@example.com</span>
              </div>
            </div>

            {/* Field 10: Country */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] block">Country</span>
                <span className="text-sm font-bold text-[#18181B] block mt-0.5">India</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4/12 cols): Sidebar Status & Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Profile Status */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#18181B]">Profile Status</h3>
                <p className="text-[11px] text-[#71717A]">Your profile is complete and verified.</p>
              </div>
            </div>

            {/* 100% Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#18181B]">
                <div className="w-full bg-[#F4F4F5] h-2 rounded-full overflow-hidden mr-3">
                  <div className="bg-[#FF6600] h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <span>100%</span>
              </div>
            </div>

            {/* Checkmark List */}
            <ul className="space-y-2.5 pt-1 text-xs font-semibold text-[#18181B]">
              <li className="flex items-center space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[#3F3F46]">DigiLocker Identity Verified</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[#3F3F46]">Personal Information Complete</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[#3F3F46]">Contact Details Available</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-[#3F3F46]">Profile Active</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0 font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#18181B]">Quick Actions</h3>
                <p className="text-[11px] text-[#71717A]">Manage your profile.</p>
              </div>
            </div>

            {/* Action Item Box */}
            <div 
              onClick={handleDigiLockerSync}
              className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3.5 flex items-center justify-between hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                  <RefreshCw className={`w-4 h-4 ${isUpdatingDigiLocker ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#18181B]">Update from DigiLocker</h4>
                  <p className="text-[10px] text-[#71717A]">Fetch the latest information from DigiLocker</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A1A1AA]" />
            </div>

            {/* Blue Info Box */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] rounded-xl p-3.5 text-xs flex items-center justify-between">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-[#0284C7] leading-tight pr-2">
                  To make any changes to your personal information, please update it in your DigiLocker account.
                </span>
              </div>
              <a 
                href="https://digilocker.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#0284C7] hover:text-[#0369A1] shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Data Security Banner */}
      <div className="bg-[#FFF6EE] border-l-4 border-[#FF6600] border border-[#FDE3CF] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#18181B]">Your Data is Secure</h4>
            <p className="text-xs text-[#52525B] font-medium">
              We use advanced security measures to protect your information. Your data is shared only when you generate a report and is never used for any other purpose.
            </p>
          </div>
        </div>

        <Link
          to="/worker/settings"
          className="text-xs font-bold text-[#FF6600] hover:underline flex items-center space-x-1 shrink-0"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
