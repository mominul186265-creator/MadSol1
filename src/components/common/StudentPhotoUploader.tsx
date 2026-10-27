import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StudentPhotoUploaderProps {
  photo: string;
  onChange: (photoDataUrl: string) => void;
  gender?: 'male' | 'female';
  label?: string;
  hint?: string;
}

// Preset cartoon / illustration avatars for students
const MALE_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const FEMALE_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
];

export const StudentPhotoUploader: React.FC<StudentPhotoUploaderProps> = ({
  photo,
  onChange,
  gender = 'male',
  label,
  hint,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState(photo || '');

  const presets = gender === 'female' ? FEMALE_PRESETS : MALE_PRESETS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select an image file.');
      return;
    }

    // Convert file to Base64 data URL
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        onChange(result);
        setUrlValue(result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick the same file again if desired
    e.target.value = '';
  };

  const handlePresetSelect = (presetUrl: string) => {
    onChange(presetUrl);
    setUrlValue(presetUrl);
  };

  const handleRemovePhoto = () => {
    onChange('');
    setUrlValue('');
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
      {/* Label & Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{label || (isBn ? 'ছাত্র/ছাত্রীর ছবি (Student Photo)' : 'Student Photo')}</span>
        </label>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
          {isBn ? 'ভর্তির সময় ছবি আপলোড' : 'Photo Upload'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Photo Preview Box */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 shadow-sm flex items-center justify-center">
            {photo ? (
              <img
                src={photo}
                alt="Student preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <User className="w-8 h-8 text-emerald-500/60 mb-0.5" />
                <span className="text-[9px] font-semibold text-slate-400 leading-tight">
                  {isBn ? 'ছবি নেই' : 'No Photo'}
                </span>
              </div>
            )}
          </div>

          {/* Quick upload badge button over preview */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload photo'}
            className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-transform active:scale-90 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload Controls & Actions */}
        <div className="flex-1 w-full space-y-2">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isBn ? 'ক্যামেরা বা ফাইল থেকে ছবি নিন' : 'Upload from Device/Camera'}</span>
            </button>

            {photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'মুছে ফেলুন' : 'Remove'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-1 py-1"
            >
              {showUrlInput
                ? isBn ? 'লিংক ইনপুট লুকান' : 'Hide URL input'
                : isBn ? 'বা ছবির ওয়েব লিংক দিন' : 'Or paste URL'}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {hint || (isBn
              ? 'মোবাইল বা কম্পিউটার থেকে সরাসরি ছাত্র/ছাত্রীর ছবি সিলেক্ট করুন (JPG, PNG, WebP)'
              : 'Select student photo directly from gallery or camera.')}
          </p>

          {/* Web URL input fallback */}
          {showUrlInput && (
            <div className="flex items-center gap-1.5 pt-1 animate-in fade-in duration-150">
              <input
                type="text"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/student-photo.jpg"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                {isBn ? 'সেট' : 'Set'}
              </button>
            </div>
          )}

          {/* Preset Samples */}
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {isBn ? 'বা নমুনা ছবি থেকে নির্বাচন করুন:' : 'Or choose a preset sample:'}
            </span>
            <div className="flex items-center gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative w-8 h-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    photo === preset
                      ? 'border-emerald-600 scale-105 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 opacity-80 hover:opacity-100'
                  }`}
                  title={isBn ? `নমুনা ছবি ${idx + 1}` : `Sample ${idx + 1}`}
                >
                  <img src={preset} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                  {photo === preset && (
                    <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
