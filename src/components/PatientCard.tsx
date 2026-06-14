import React from 'react';
import { MoreVertical, User, MapPin, ClipboardList, PenTool, CheckCircle, ShieldAlert, BadgeInfo, FileText, ChevronRight, Printer } from 'lucide-react';
import { Patient } from '../types';

interface PatientCardProps {
  key?: string;
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, state: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged') => void;
}

export default function PatientCard({ patient, onEdit, onDelete, onStatusChange }: PatientCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Soft design system color mapping for Status Badges
  // Provisional Admission | MRD Pending | Completed | Discharged
  const statusConfig = {
    'Provisional Admission': {
      bg: 'bg-[#fdfaf2] border-amber-200/60 text-[#a0681a]',
      dot: 'bg-amber-500'
    },
    'MRD Pending': {
      bg: 'bg-[#fcf1f3] border-rose-200/60 text-[#9f2038]',
      dot: 'bg-rose-500'
    },
    'Completed': {
      bg: 'bg-[#f2faf5] border-emerald-200/60 text-[#147b42]',
      dot: 'bg-emerald-500'
    },
    'Discharged': {
      bg: 'bg-[#f1f3f9] border-slate-300/60 text-[#4a5568]',
      dot: 'bg-slate-400'
    }
  };

  // Safe fallback and legacy mapping to prevent runtime crashes from localStorage cache
  const rawStatus = patient.status as string;
  const resolvedStatus = (rawStatus === 'Critical' || rawStatus === 'Pending')
    ? 'Provisional Admission'
    : (rawStatus === 'Stable' ? 'Completed' : patient.status);

  const currentStatusConfig = statusConfig[resolvedStatus as keyof typeof statusConfig] || statusConfig['Provisional Admission'];

  // Label configuration
  // Payment Defaulter | Insurance | High Priority
  const labelStyles = {
    'Payment Defaulter': 'bg-rose-50 text-rose-700 border-rose-200/60 font-black',
    'Insurance': 'bg-blue-50 text-blue-700 border-blue-200/60 font-black',
    'High Priority': 'bg-purple-50 text-purple-700 border-purple-200/60 font-black'
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    // If user is focused on interactive children, don't trigger actions
    if (e.target !== e.currentTarget) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(patient);
      return;
    }

    const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (arrowKeys.includes(e.key)) {
      e.preventDefault();
      const cards = Array.from(document.querySelectorAll('[id^="patient-card-"]')) as HTMLElement[];
      const currentIndex = cards.indexOf(e.currentTarget as HTMLElement);
      if (currentIndex === -1) return;

      const currentRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let targetElement: HTMLElement | null = null;
      let minDistance = Infinity;

      // Center coordinates of current card
      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;

      cards.forEach((card) => {
        if (card === e.currentTarget) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = centerX - currentCenterX;
        const dy = centerY - currentCenterY;

        let isValid = false;
        if (e.key === 'ArrowRight' && dx > 15 && Math.abs(dy) < rect.height * 1.5) {
          isValid = true;
        } else if (e.key === 'ArrowLeft' && dx < -15 && Math.abs(dy) < rect.height * 1.5) {
          isValid = true;
        } else if (e.key === 'ArrowDown' && dy > 15) {
          isValid = true;
        } else if (e.key === 'ArrowUp' && dy < -15) {
          isValid = true;
        }

        if (isValid) {
          const distance = Math.pow(dx, 2) + Math.pow(dy, 2);
          if (distance < minDistance) {
            minDistance = distance;
            targetElement = card;
          }
        }
      });

      // Simple navigation flow boundary fallbacks
      if (!targetElement) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          targetElement = cards[currentIndex + 1] || null;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          targetElement = cards[currentIndex - 1] || null;
        }
      }

      if (targetElement) {
        (targetElement as HTMLElement).focus();
      }
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowMenu(false);
      setTimeout(() => {
        document.getElementById(`patient-menu-btn-${patient.id}`)?.focus();
      }, 0);
    }
  };

  return (
    <div 
      id={`patient-card-${patient.id}`}
      tabIndex={0}
      role="group"
      aria-label={`Patient ${patient.name} card`}
      onKeyDown={handleCardKeyDown}
      className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_10px_30px_rgba(150,160,190,0.12)] hover:shadow-[0_15px_35px_rgba(140,150,180,0.18)] hover:bg-white/85 focus:shadow-[0_15px_35px_rgba(140,150,180,0.18)] focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition-all duration-300 relative flex flex-col justify-between h-full text-[10px]"
    >
      {/* Top Section: Avatar, Demographic, and Menu trigger */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-2">
            {/* Visual Avatar block - High contrast container */}
            {patient.avatar ? (
              <img 
                src={patient.avatar} 
                alt={`${patient.name} Avatar`} 
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-nm-button"
              />
            ) : (
              <div aria-hidden="true" className="w-7 h-7 rounded-full bg-[#f1f3f9] text-slate-800 border border-white flex items-center justify-center font-black text-[9px] select-none shrink-0 shadow-nm-button">
                {patient.initials || patient.name.slice(0, 2).toUpperCase()}
              </div>
            )}
 
            {/* Demographics Block: tight professional information */}
            <div className="min-w-0">
              <h3 className="text-[11px] font-black text-slate-900 leading-tight tracking-tight truncate max-w-[100px] sm:max-w-none" title={patient.name}>
                {patient.name}
              </h3>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5 flex items-center gap-1 leading-none">
                <span>{patient.gender.slice(0, 6)}</span>
                <span className="text-slate-300" aria-hidden="true">•</span>
                <span>{patient.age}y</span>
              </p>
            </div>
          </div>
 
          {/* Large touch targets action options */}
          <div className="relative shrink-0">
            <button 
              id={`patient-menu-btn-${patient.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-full bg-white/80 border border-white hover:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Patient Management Menu"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-3 h-3" />
            </button>
 
            {/* Context menu for quick status toggling */}
            {showMenu && (
              <div 
                ref={menuRef} 
                onKeyDown={handleMenuKeyDown}
                className="absolute right-0 top-8 w-[180px] bg-white/95 backdrop-blur-xl border border-white rounded-2xl shadow-[0_12px_32px_rgba(31,38,135,0.08)] py-1.5 z-35 text-[10px]"
              >
                <div className="px-2.5 py-0.5 text-[8px] font-extrabold text-[#0066FF] uppercase tracking-widest">
                  Quick Actions
                </div>
                
                <button 
                  onClick={() => { onEdit(patient); setShowMenu(false); }}
                  className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-[#ebedf4] hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span>View Full File</span>
                </button>
 
                <button 
                  onClick={() => { onStatusChange(patient.id, 'Discharged'); setShowMenu(false); }}
                  className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-[#ebedf4] hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-2.5 h-2.5 text-[#0066FF] shrink-0" />
                  <span>Mark as Discharged</span>
                </button>
 
                <button 
                  onClick={() => { 
                    alert(`=== CLINICAL NEXUS LABS ===\n\nCommand: Print RFID/Barcode Wristband\nPrinted Patient Initials: ${patient.initials || 'P'}\nUHID Identifier: ${patient.uhid}\nBed Location: ${patient.ward} • ${patient.bed}\n\nJob dispatched successfully to Nurse Station Zebra thermal printer.`);
                    setShowMenu(false); 
                  }}
                  className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-[#ebedf4] hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                  <span>Print Wristband</span>
                </button>
 
                <div className="border-t border-[#ebedf4] my-0.5" />
 
                <div className="px-2.5 py-0.5 text-[8px] font-extrabold text-[#0066FF] uppercase tracking-widest">
                  Move Triage Status
                </div>
                
                {(['Provisional Admission', 'MRD Pending', 'Completed'] as const).map(st => (
                  <button 
                    key={st}
                    onClick={() => { onStatusChange(patient.id, st); setShowMenu(false); }}
                    className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-[#ebedf4] hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                  >
                    <span className={`w-1 h-1 rounded-full ${statusConfig[st].dot}`} />
                    <span>{st}</span>
                  </button>
                ))}
 
                <div className="border-t border-[#ebedf4] my-0.5" />
 
                <button 
                  onClick={() => { onEdit(patient); setShowMenu(false); }}
                  className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-[#ebedf4] hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                >
                  <PenTool className="w-2.5 h-2.5 text-blue-500" />
                  <span>Update Intake Wizard</span>
                </button>
 
                <button 
                  onClick={() => { if (confirm(`Confirm fully discharging and deleting ${patient.name} from active lists?`)) { onDelete(patient.id); } setShowMenu(false); }}
                  className="w-full text-left px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 hover:shadow-nm-button-inset transition-all flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                  <span>Permanent Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
 
        {/* Status Badge Line - Dedicated compact status block */}
        <div className="mb-1.5">
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${currentStatusConfig.bg}`}>
            <span className={`w-1 h-1 rounded-full ${currentStatusConfig.dot}`} />
            <span>{resolvedStatus}</span>
          </div>
        </div>
 
        {/* Unified Patient Labels line spacing */}
        {patient.labels && patient.labels.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-1.5">
            {patient.labels.map((lbl) => (
              <span 
                key={lbl} 
                className={`inline-flex items-center text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-black ${labelStyles[lbl]}`}
              >
                {lbl}
              </span>
            ))}
          </div>
        )}
 
        {/* Hospital Metadata Parameters Grid layout with clear icons & labels */}
        <div className="grid grid-cols-2 gap-y-1 gap-x-1.5 text-[9px] py-1.5 border-t border-white/40">
          <div>
            <p className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">UHID ID</p>
            <p className="font-mono font-bold text-slate-800 text-[9px] select-all leading-tight">{patient.uhid}</p>
          </div>
          <div>
            <p className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">Clinician</p>
            <p className="font-bold text-slate-700 text-[9px] truncate max-w-[80px]" title={patient.attendingDoctor}>
              {patient.attendingDoctor.replace('Dr. ', '')}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">Bed Reference</p>
            <p className="font-bold text-slate-700 text-[9px] truncate flex items-center gap-0.5 leading-tight">
              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              <span>{patient.ward} • {patient.bed}</span>
            </p>
          </div>
          <div>
            <p className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">Specialty</p>
            <p className="font-bold text-slate-700 text-[9px] truncate max-w-[80px]" title={patient.department}>{patient.department}</p>
          </div>
        </div>
      </div>
 
      {/* Grid Footer - Single high contrast clickable trigger button */}
      <div className="mt-1.5 pt-1.5 border-t border-white/40 flex items-center justify-between">
        <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider truncate max-w-[70px]" title={`${patient.department} Sect.`}>
          {patient.department} Sect.
        </span>
        <button 
          id={`review-wizard-trigger-${patient.id}`}
          onClick={() => onEdit(patient)}
          className="h-7 px-3 bg-white/70 hover:bg-blue-600 hover:text-white text-[#0066FF] rounded-xl text-[9px] font-black shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-white/80 flex items-center gap-1 transition-all cursor-pointer shrink-0"
        >
          <span>Intake Wizard</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}
