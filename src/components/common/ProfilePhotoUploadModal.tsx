import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Trash2, X, Check, Sparkles, User, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from './Button';

interface ProfilePhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  userName: string;
  onSave: (photoDataUrl: string) => Promise<{ success: boolean; message?: string }>;
}

// Preset Islamic and Scholar Avatars for quick selection
const SCHOLAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
];

export const ProfilePhotoUploadModal: React.FC<ProfilePhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhoto = '',
  userName,
  onSave,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === 'bn';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || '');
  const [isSaving, setIsSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setSelectedPhoto(currentPhoto || '');
  }, [currentPhoto, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(isBn ? 'অনুগ্রহ করে ছবি ফরম্যাটের ফাইল দিন।' : 'Please choose an image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSelectedPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await onSave(selectedPhoto);
      if (res.success) {
        showToast(
          isBn ? 'প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!' : 'Profile photo updated successfully!',
          'success'
        );
        onClose();
      } else {
        showToast(res.message || (isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save photo.'), 'error');
      }
    } catch (err: any) {
      showToast(err?.message || (isBn ? 'ত্রুটি ঘটেছে।' : 'An error occurred.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    setSelectedPhoto('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'প্রোফাইল ছবি আপলোড' : 'Upload Profile Photo'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {userName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Main Avatar Preview */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-emerald-500 shadow-lg flex items-center justify-center">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={() => setSelectedPhoto('')}
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-800 text-amber-300 font-extrabold text-4xl flex items-center justify-center">
                    {userName.charAt(0) || 'হ'}
                  </div>
                )}
              </div>

              {/* Camera Icon on preview */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white dark:ring-slate-900"
                title={isBn ? 'নতুন ছবি আপলোড করুন' : 'Upload new photo'}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
              {userName}
            </p>
            <p className="text-[11px] text-slate-400">
              {isBn ? 'আপনার প্রোফাইল ছবি হেডার ও ব্যবহারকারী তালিকায় দৃশ্যমান হবে' : 'Photo will appear in header & user list'}
            </p>
          </div>

          {/* Upload Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/30'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'ক্যামেরা বা ফাইল থেকে ছবি সিলেক্ট করুন' : 'Click or Drag to Upload Photo'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isBn ? 'JPG, PNG, WebP ফরম্যাটের ছবি গ্রহণযোগ্য' : 'Supports JPG, PNG, WebP'}
              </p>
            </div>
          </div>

          {/* Preset Avatar Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'বা রেডিমেড প্রোফাইল ছবি পছন্দ করুন:' : 'Or pick a preset avatar:'}</span>
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {SCHOLAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhoto === url
                      ? 'border-emerald-600 scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 opacity-80 hover:opacity-100'
                  }`}
                  title={isBn ? `রেডিমেড ছবি ${i + 1}` : `Preset ${i + 1}`}
                >
                  <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                  {selectedPhoto === url && (
                    <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          {selectedPhoto ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'ছবি মুছুন' : 'Remove'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="text-xs font-bold gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isBn ? 'ছবি সংরক্ষণ করুন' : 'Save Photo'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
