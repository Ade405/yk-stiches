import React, { useState } from 'react';
import { 
  X, 
  Ruler, 
  Plus, 
  Check, 
  Trash2, 
  User, 
  Info, 
  Sparkles, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TailorMeasurementProfile } from '../types';
import { DEFAULT_MEASUREMENT_PRESETS } from '../data/tailors';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProfiles: TailorMeasurementProfile[];
  onSaveProfile: (profile: TailorMeasurementProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  isOpen,
  onClose,
  savedProfiles,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [activeProfile, setActiveProfile] = useState<TailorMeasurementProfile>(
    savedProfiles[0] || DEFAULT_MEASUREMENT_PRESETS[0]
  );
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof TailorMeasurementProfile, val: any) => {
    setActiveProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handleCreateNew = () => {
    const newProfile: TailorMeasurementProfile = {
      id: `profile_${Date.now()}`,
      profileName: 'New Custom Profile',
      gender: 'men',
      unit: 'inches',
      height: 70,
      chestBust: 40,
      shoulderWidth: 19,
      sleeveLength: 33,
      neckCollar: 16,
      waist: 34,
      hip: 40,
      inseam: 32,
      thigh: 23,
      suitKaftanLength: 56,
      notes: '',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setActiveProfile(newProfile);
    setIsEditingNew(true);
  };

  const handleSave = () => {
    onSaveProfile(activeProfile);
    setIsEditingNew(false);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white text-black rounded-3xl border border-zinc-200 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-lg text-black">
                Patron Measurement Vault
              </h2>
              <p className="text-xs text-zinc-600">
                Saved anatomical profiles for automated bespoke pattern drafting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Profile Selector List */}
          <div className="md:col-span-4 bg-zinc-50 p-4 border-r border-zinc-200 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                Saved Profiles
              </span>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1 text-xs text-black font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {savedProfiles.map((p) => (
              <div
                key={p.id}
                onClick={() => setActiveProfile(p)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  activeProfile.id === p.id
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white border-zinc-200 text-black hover:border-zinc-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-xs ${activeProfile.id === p.id ? 'text-white' : 'text-black'}`}>
                    {p.profileName}
                  </h4>
                  {savedProfiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProfile(p.id);
                      }}
                      className={`p-0.5 ${activeProfile.id === p.id ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-400 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className={`text-[10px] block mt-1 ${activeProfile.id === p.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Chest: {p.chestBust}" · Shoulder: {p.shoulderWidth}" ({p.gender})
                </span>
              </div>
            ))}
          </div>

          {/* Right Profile Editor Form */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-zinc-600 font-medium block mb-1">Profile Name / Wearer</label>
                <input
                  type="text"
                  value={activeProfile.profileName}
                  onChange={(e) => handleFieldChange('profileName', e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-sm text-black rounded-xl px-3.5 py-2 focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Unit Switcher */}
              <div>
                <label className="text-xs text-zinc-600 font-medium block mb-1">Measurement Unit</label>
                <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                  <button
                    onClick={() => handleFieldChange('unit', 'inches')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                      activeProfile.unit === 'inches' ? 'bg-black text-white shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => handleFieldChange('unit', 'cm')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                      activeProfile.unit === 'cm' ? 'bg-black text-white shadow-xs' : 'text-zinc-600'
                    }`}
                  >
                    CM
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-zinc-600 font-medium block mb-1">Chest / Bust ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.chestBust}
                  onChange={(e) => handleFieldChange('chestBust', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-zinc-600 font-medium block mb-1">Shoulder Width ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.shoulderWidth}
                  onChange={(e) => handleFieldChange('shoulderWidth', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-zinc-600 font-medium block mb-1">Sleeve Length ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.sleeveLength}
                  onChange={(e) => handleFieldChange('sleeveLength', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-zinc-600 font-medium block mb-1">Neck / Collar ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.neckCollar}
                  onChange={(e) => handleFieldChange('neckCollar', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-zinc-600 font-medium block mb-1">Natural Waist ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.waist}
                  onChange={(e) => handleFieldChange('waist', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-zinc-600 font-medium block mb-1">Trouser Inseam ({activeProfile.unit})</label>
                <input
                  type="number"
                  value={activeProfile.inseam}
                  onChange={(e) => handleFieldChange('inseam', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 border border-zinc-300 text-black font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-600 font-medium block mb-1">Anatomical / Posture Notes</label>
              <textarea
                rows={2}
                value={activeProfile.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="e.g. Broader traps from weight training. Prefer sleeves hitting right at wrist bone."
                className="w-full bg-zinc-50 border border-zinc-300 text-xs text-black rounded-xl p-3 focus:outline-none focus:border-black font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              {copiedNotification && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Profile successfully saved into atelier vault!</span>
                </span>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200 border border-zinc-300 text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="bg-black hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

