import React from 'react';
import { 
  Users, 
  FolderLock, 
  UploadCloud, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  HelpCircle,
  Stethoscope
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePatientCount: number;
  unverifiedFilesCount: number;
  onShowToast?: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activePatientCount,
  unverifiedFilesCount,
  onShowToast
}: SidebarProps) {
  
  const navItems = [
    {
      id: 'in-patient',
      label: 'In-Patient',
      icon: Users,
      badge: activePatientCount > 0 ? activePatientCount : undefined,
      color: 'text-blue-600'
    },
    {
      id: 'mrd-files',
      label: 'MRD Files',
      icon: FolderLock,
      badge: unverifiedFilesCount > 0 ? unverifiedFilesCount : undefined,
      color: 'text-indigo-600'
    },
    {
      id: 'upload',
      label: 'Upload Documents',
      icon: UploadCloud,
      color: 'text-emerald-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-amber-600'
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      color: 'text-teal-600'
    }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/45 backdrop-blur-xl border-r border-white/60 h-screen fixed left-0 top-0 z-30 select-none shadow-[4px_0_24px_rgba(31,38,135,0.05)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/40 bg-white/45">
        <div className="flex items-baseline font-sans">
          <span className="text-xl font-black tracking-tight text-neutral-900">DScribe</span>
          <span className="text-xl font-black text-[#0066FF] ml-0.5 animate-pulse">.</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 font-bold uppercase bg-white/70 border border-white text-slate-500 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.03)] tracking-wider leading-none">
          v2.4
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Navigation</p>
        <div className="space-y-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-white/80 text-[#0066FF] shadow-[0_8px_16px_rgba(0,102,255,0.08)] border border-white/80 scale-98 font-black' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 font-black rounded-lg transition-colors border ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                      : 'bg-[#ebedf4] text-slate-500 border-white/60 shadow-nm-inset-small'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* System Configurations & Help */}
      <div className="px-4 py-4 border-t border-white/40 bg-white/30 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 ${
            activeTab === 'settings' 
              ? 'bg-white/80 text-blue-700 pointer-events-none border border-white/80 shadow-[0_4px_12px_rgba(0,102,255,0.05)]' 
              : 'text-slate-600 hover:bg-white/45 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>System Config</span>
        </button>
        <button
          onClick={() => {
            if (onShowToast) {
              onShowToast('Clinical Help Line: Call ward coordinator on Ext. 8021.', 'info');
            } else {
              alert('Clinical Help Line: Call ward coordinator on Ext. 8021.');
            }
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-slate-500 hover:bg-white/45 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Clinical Help</span>
        </button>
      </div>

      {/* Admin User Footer Slot */}
      <div className="p-4 border-t border-white/40 bg-white/30 shrink-0">
        <div className="p-3.5 bg-white/65 border border-white/85 shadow-[0_8px_24px_rgba(31,38,135,0.05)] rounded-2xl flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#f1f3f9] text-[#0066FF] flex items-center justify-center font-black text-xs shadow-nm-inset-small border border-white">
              SC
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#f1f3f9] rounded-full"></span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-800 truncate">Dr. Sarah Chen</p>
            <p className="text-[9px] text-[#0066FF] font-extrabold uppercase tracking-wider truncate">Lead • Ward 4B</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
