import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle,
  ChevronRight,
  FileText,
  MoreVertical,
  PenTool,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { Patient } from '../types';
import { getCareTeam, getPrimaryDoctor } from '../careTeam';

interface PatientCardProps {
  key?: string;
  index?: number;
  patient: Patient;
  isSelected?: boolean;
  onEdit: (patient: Patient) => void;
  onViewDetails?: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, state: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged') => void;
}

const statusConfig = {
  'Provisional Admission': {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-500'
  },
  'MRD Pending': {
    bg: 'bg-rose-50 border-rose-200 text-rose-700',
    dot: 'bg-rose-500'
  },
  Completed: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500'
  },
  Discharged: {
    bg: 'bg-slate-100 border-slate-200 text-slate-600',
    dot: 'bg-slate-400'
  }
};

const labelStyles = {
  'Payment Defaulter': 'bg-rose-50 text-rose-700 border-rose-200',
  Insurance: 'bg-blue-50 text-blue-700 border-blue-200',
  'High Priority': 'bg-violet-50 text-violet-700 border-violet-200'
};

export default function PatientCard({
  index = 0,
  patient,
  isSelected = false,
  onEdit,
  onViewDetails,
  onDelete,
  onStatusChange
}: PatientCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const primaryDoctor = getPrimaryDoctor(patient);

  const rawStatus = patient.status as string;
  const resolvedStatus = (rawStatus === 'Critical' || rawStatus === 'Pending')
    ? 'Provisional Admission'
    : (rawStatus === 'Stable' ? 'Completed' : patient.status);
  const currentStatusConfig = statusConfig[resolvedStatus as keyof typeof statusConfig] || statusConfig['Provisional Admission'];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDetails = () => (onViewDetails || onEdit)(patient);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetails();
    }
  };

  const careTeam = getCareTeam(patient);
  const visibleCareTeam = careTeam.slice(0, 2);
  const extraCareTeamCount = Math.max(0, careTeam.length - visibleCareTeam.length);

  return (
    <motion.article
      id={`patient-card-${patient.id}`}
      tabIndex={0}
      role="group"
      aria-label={`Patient ${patient.name} card`}
      onKeyDown={handleCardKeyDown}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.035, 0.22), ease: 'easeOut' }}
      className={`bg-white rounded-3xl shadow-card hover:shadow-card-hover focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 p-4 md:p-5 ${
        isSelected ? 'border-2 border-blue-300 ring-4 ring-blue-100/70' : 'border border-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: avatar + name + status/label chips */}
        <div className="flex items-start gap-3 min-w-0">
          {patient.avatar ? (
            <img
              src={patient.avatar}
              alt={patient.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
              {patient.initials || patient.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-950 truncate" title={patient.name}>
              {patient.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[12px] font-semibold text-slate-500">{patient.gender} • {patient.age}y</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${currentStatusConfig.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot}`} />
                {resolvedStatus}
              </span>
              {patient.labels?.slice(0, 3).map((label) => (
                <span key={label} className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide ${labelStyles[label]}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: primary consultant + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Primary Consultant</p>
            <p className="text-sm font-black text-slate-950 truncate max-w-[180px]">{primaryDoctor?.doctor || patient.attendingDoctor}</p>
            {primaryDoctor?.department && (
              <p className="text-[11px] text-slate-500">{primaryDoctor.department}</p>
            )}
          </div>

          <div className="relative">
            <button
              id={`patient-menu-btn-${patient.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Patient actions"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-10 w-[190px] bg-white border border-slate-100 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] py-2 z-40 text-xs"
              >
                <button onClick={() => { openDetails(); setShowMenu(false); }} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  View full file
                </button>
                <button onClick={() => { onStatusChange(patient.id, 'Discharged'); setShowMenu(false); }} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  Mark discharged
                </button>
                <button
                  onClick={() => {
                    alert(`Print wristband\n\nPatient: ${patient.name}\nUHID: ${patient.uhid}\nBed: ${patient.ward} / ${patient.bed}`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-violet-600" />
                  Print wristband
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { onEdit(patient); setShowMenu(false); }} className="w-full text-left px-3 py-2 font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  Edit intake
                </button>
                <button onClick={() => { if (confirm(`Delete ${patient.name} from active lists?`)) onDelete(patient.id); setShowMenu(false); }} className="w-full text-left px-3 py-2 font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Delete patient
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openDetails}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
            title="View patient details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Left: UHID / Bed / Ward / Admitted */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UHID</p>
            <p className="mt-1 text-[12px] font-mono font-black text-slate-900">{patient.uhid}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bed</p>
            <p className="mt-1 text-[12px] font-black text-slate-900">{patient.bed}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ward</p>
            <p className="mt-1 text-[12px] font-black text-slate-900">{patient.ward}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admitted</p>
            <p className="mt-1 text-[12px] font-black text-slate-900">{patient.admissionDate || '—'}</p>
          </div>
        </div>

        {/* Right: care team avatar stack + count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {visibleCareTeam.map((member, i) => (
              member.avatar ? (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.doctor}
                  className={`w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm ${i > 0 ? '-ml-2' : ''}`}
                />
              ) : (
                <div
                  key={member.id}
                  className={`w-7 h-7 rounded-full bg-blue-100 text-blue-800 border-2 border-white flex items-center justify-center text-[9px] font-black ${i > 0 ? '-ml-2' : ''}`}
                >
                  {member.doctor.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                </div>
              )
            ))}
            {extraCareTeamCount > 0 && (
              <div className="w-7 h-7 -ml-2 rounded-full bg-slate-100 text-slate-600 border-2 border-white flex items-center justify-center text-[9px] font-black">
                +{extraCareTeamCount}
              </div>
            )}
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
            Care Team • {careTeam.length}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
