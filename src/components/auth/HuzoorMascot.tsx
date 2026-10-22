import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Volume2, VolumeX } from 'lucide-react';

export type MascotFocusField =
  | 'idle'
  | 'identifier'
  | 'password'
  | 'password-peek'
  | 'remember'
  | 'submit'
  | 'signup'
  | 'madrasa-name'
  | 'mobile'
  | 'pin'
  | 'role';

interface HuzoorMascotProps {
  activeField: MascotFocusField;
  isPulling?: boolean;
  language?: 'bn' | 'en';
  onMascotClick?: () => void;
  className?: string;
  customTip?: string;
}

export const HuzoorMascot: React.FC<HuzoorMascotProps> = ({
  activeField,
  isPulling = false,
  language = 'bn',
  onMascotClick,
  className = '',
  customTip,
}) => {
  const isBn = language === 'bn';
  const [clickCount, setClickCount] = useState(0);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'shy' | 'excited'>('happy');
  const [isBlinking, setIsBlinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Natural eye blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Update mood based on active field
  useEffect(() => {
    if (activeField === 'password') {
      setMascotMood('shy');
    } else if (activeField === 'submit') {
      setMascotMood('excited');
    } else if (activeField === 'identifier' || activeField === 'mobile' || activeField === 'madrasa-name') {
      setMascotMood('thinking');
    } else {
      setMascotMood('happy');
    }
  }, [activeField]);

  // Contextual speech messages
  const getSpeechText = () => {
    if (customTip) return customTip;

    if (clickCount > 0 && activeField === 'idle') {
      const easterGreetings = isBn
        ? [
            'আসসালামু আলাইকুম! কোনো সাহায্য লাগলে বলুন 😊',
            'মাদ্রাসার সকল হিসাব ও হাজিরা এখন স্মার্ট! 📖',
            'জ্ঞান অর্জন প্রত্যেক মুসলমানের ওপর ফরজ। ✨',
            'ফিল্ডে ক্লিক করুন, আমি দেখিয়ে দেব! 👉',
          ]
        : [
            'Assalamu Alaikum! How can I assist you? 😊',
            'Smart cloud management for modern madrasas! 📖',
            'Seeking knowledge is sacred duty for every Muslim. ✨',
            'Click on any field and I will guide you! 👉',
          ];
      return easterGreetings[(clickCount - 1) % easterGreetings.length];
    }

    if (isPulling) {
      return isBn
        ? 'হৈ হৈ! এইতো আপনার ফর্মটি টেনে নিয়ে আসছি... 🤲'
        : 'Heave-ho! Bringing in your form right now... 🤲';
    }

    switch (activeField) {
      case 'identifier':
        return isBn
          ? 'এখানে আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বরটি লিখুন 📱'
          : 'Enter your registered email or mobile number here 📱';
      case 'password':
        return isBn
          ? 'চোখ বন্ধ করে নিয়েছি! আপনার পাসওয়ার্ড সম্পূর্ণ গোপন ও নিরাপদ 🙈'
          : 'Eyes closed! Your secret password is safe with us 🙈';
      case 'password-peek':
        return isBn
          ? 'উঁকি দিয়ে দেখছি! পাসওয়ার্ড সঠিক আছে তো? 👀'
          : 'Peeking through! Is the password typed correctly? 👀';
      case 'remember':
        return isBn
          ? 'পরের বার দ্রুত প্রবেশের জন্য আমাকে মনে রাখুন 👍'
          : 'Check to keep yourself remembered for fast sign in 👍';
      case 'submit':
        return isBn
          ? 'বিসমিল্লাহ বলে বাটনে চাপ দিন, প্রবেশ করছি! 🚀'
          : 'Say Bismillah and click to sign in! 🚀';
      case 'signup':
        return isBn
          ? 'নতুন মাদ্রাসার জন্য সহজে বিনামূল্যে সাইন আপ করুন! 🏛️'
          : 'Sign up your new madrasa easily and for free! 🏛️';
      case 'madrasa-name':
        return isBn
          ? 'আপনার প্রিয় মাদ্রাসার পূর্ণ নাম ও ঠিকানা লিখুন 🕌'
          : 'Enter the full name and address of your madrasa 🕌';
      case 'mobile':
        return isBn
          ? '১১ ডিজিটের সক্রিয় মোবাইল নম্বরটি দিন (যেমন: 017...) 📞'
          : 'Enter active 11-digit mobile number (e.g. 017...) 📞';
      case 'pin':
        return isBn
          ? 'মুহতামিমের দেওয়া ৪-৬ ডিজিটের গোপন পিন কোড লিখুন 🔑'
          : 'Enter the 4-6 digit secret access PIN from Muhtamim 🔑';
      case 'role':
        return isBn
          ? 'আপনি শিক্ষক, পরিচালক নাকি অভিভাবক—বেছে নিন 🎓'
          : 'Select your role: Director, Teacher, or Parent 🎓';
      case 'idle':
      default:
        return isBn
          ? 'আসসালামু আলাইকুম! লগইন বা সাইন আপ করতে যেকোনো ঘরে ক্লিক করুন 😊'
          : 'Assalamu Alaikum! Click any field to begin signing in 😊';
    }
  };

  const handleMascotTap = () => {
    setClickCount((prev) => prev + 1);
    if (onMascotClick) onMascotClick();

    // Friendly audio-visual feedback
    if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {
        // audio context not allowed without interaction
      }
    }
  };

  // Determine arm/hand positions based on active field
  const isCoveringEyes = activeField === 'password';
  const isPeekingEyes = activeField === 'password-peek';
  const isPointing = activeField === 'identifier' || activeField === 'remember' || activeField === 'submit' || activeField === 'pin';
  const isCheering = activeField === 'submit';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Interactive Speech Bubble */}
      <div
        className={`relative z-20 mb-2 max-w-[240px] sm:max-w-[270px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3 rounded-2xl shadow-lg border-2 ${
          activeField === 'password'
            ? 'border-indigo-400 dark:border-indigo-500'
            : activeField === 'submit'
            ? 'border-amber-400 dark:border-amber-500 animate-pulse'
            : 'border-emerald-500/80 dark:border-emerald-500'
        } transition-all duration-300 transform scale-100 hover:scale-[1.02] cursor-pointer`}
        onClick={handleMascotTap}
        title={isBn ? 'হুজুরকে ট্যাপ করুন' : 'Tap mascot for tips'}
      >
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400 mt-0.5">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold leading-relaxed">
              {getSpeechText()}
            </p>
            <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 font-medium">
              <span>{isBn ? 'মাদসোল সহকারী' : 'MadSol Mascot'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {isBn ? 'ট্যাপ করুন ✨' : 'Tap me ✨'}
              </span>
            </div>
          </div>
        </div>

        {/* Speech Bubble Arrow pointing down to Huzoor */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-500" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-white dark:border-t-slate-800" />
      </div>

      {/* Huzoor SVG Mascot Container */}
      <div
        onClick={handleMascotTap}
        className={`relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${
          isPulling ? 'animate-bounce' : ''
        }`}
        title={isBn ? 'মুহতামিম / হুজুর কার্টুন সহকারী' : 'Huzoor Mascot Assistant'}
      >
        {/* Glow halo behind head */}
        <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/25 blur-xl rounded-full scale-90 pointer-events-none" />

        {/* SVG Mascot Graphic */}
        <svg
          viewBox="0 0 200 240"
          className="w-36 h-44 sm:w-44 sm:h-52 drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for skin, cap, clothes */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffdfbf" />
              <stop offset="100%" stopColor="#f7c89e" />
            </linearGradient>
            <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="shawlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="tupiBorder" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 1. Body / Kurta */}
          <path
            d="M 55 145 C 50 170 42 220 38 238 C 70 242 130 242 162 238 C 158 220 150 170 145 145 Z"
            fill="url(#kurtaGrad)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />

          {/* Emerald Green Shawl / Rumal Drape */}
          <path
            d="M 68 135 C 68 185 64 220 62 236 L 76 236 C 78 200 80 160 84 140 Z"
            fill="url(#shawlGrad)"
          />
          <path
            d="M 132 135 C 132 185 136 220 138 236 L 124 236 C 122 200 120 160 116 140 Z"
            fill="url(#shawlGrad)"
          />

          {/* Kurta Collar & Buttons */}
          <path d="M 92 135 L 92 185" stroke="#94a3b8" strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" />
          <circle cx="92" cy="148" r="2" fill="#047857" />
          <circle cx="92" cy="160" r="2" fill="#047857" />
          <circle cx="92" cy="172" r="2" fill="#047857" />

          {/* 2. Neck */}
          <rect x="88" y="120" width="24" height="20" rx="6" fill="url(#skinGrad)" stroke="#e2a87a" strokeWidth="1" />

          {/* 3. Head & Ears */}
          {/* Left Ear */}
          <circle cx="62" cy="95" r="9" fill="url(#skinGrad)" stroke="#e2a87a" strokeWidth="1" />
          <path d="M 62 92 C 60 94 60 97 63 98" stroke="#d97706" strokeWidth="1" fill="none" />
          {/* Right Ear */}
          <circle cx="138" cy="95" r="9" fill="url(#skinGrad)" stroke="#e2a87a" strokeWidth="1" />
          <path d="M 138 92 C 140 94 140 97 137 98" stroke="#d97706" strokeWidth="1" fill="none" />

          {/* Head Base */}
          <ellipse cx="100" cy="95" rx="38" ry="42" fill="url(#skinGrad)" stroke="#e2a87a" strokeWidth="1" />

          {/* Cheeks Blush */}
          <ellipse cx="76" cy="106" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />
          <ellipse cx="124" cy="106" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />

          {/* 4. Tupi / Islamic Prayer Cap */}
          <path
            d="M 62 82 C 62 50 80 40 100 40 C 120 40 138 50 138 82 C 126 84 74 84 62 82 Z"
            fill="url(#capGrad)"
            stroke="#94a3b8"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
          {/* Tupi Embroidered Band */}
          <path
            d="M 62 78 C 80 82 120 82 138 78 L 138 84 C 120 88 80 88 62 84 Z"
            fill="url(#tupiBorder)"
          />
          {/* Small Top Crest / Crescent on Tupi */}
          <circle cx="100" cy="50" r="3" fill="#10b981" />
          <path d="M 75 62 Q 100 58 125 62" stroke="#cbd5e1" strokeWidth="1" fill="none" />
          <path d="M 80 70 Q 100 66 120 70" stroke="#cbd5e1" strokeWidth="1" fill="none" />

          {/* 5. Beard (Neat, Respectful Sunnah Beard) */}
          <path
            d="M 66 98 C 66 135 84 144 100 144 C 116 144 134 135 134 98 C 126 108 116 112 100 112 C 84 112 74 108 66 98 Z"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1"
          />
          {/* Beard highlights/texture */}
          <path d="M 85 125 Q 100 132 115 125" stroke="#64748b" strokeWidth="1" fill="none" />
          <path d="M 90 133 Q 100 138 110 133" stroke="#64748b" strokeWidth="1" fill="none" />

          {/* 6. Mouth / Smile */}
          <path
            d={
              isCheering
                ? 'M 90 110 Q 100 122 110 110 Z'
                : 'M 91 110 Q 100 118 109 110'
            }
            fill={isCheering ? '#991b1b' : 'none'}
            stroke="#475569"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 7. Nose */}
          <path d="M 98 94 C 97 99 99 103 102 103 C 104 103 104 101 104 99" stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* 8. Eyes & Eyebrows */}
          {/* Left Eyebrow */}
          <path
            d={isCheering ? 'M 74 82 Q 84 76 90 81' : 'M 74 84 Q 82 80 89 84'}
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right Eyebrow */}
          <path
            d={isCheering ? 'M 110 81 Q 116 76 126 82' : 'M 111 84 Q 118 80 126 84'}
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Eye */}
          {isBlinking || isCoveringEyes ? (
            <path d="M 76 93 Q 83 98 89 93" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : (
            <g>
              <ellipse cx="82" cy="92" rx="6" ry="6.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
              {/* Pupil tracking rightward if pointing */}
              <circle
                cx={isPointing ? 85 : 82}
                cy={isPointing ? 92 : 92}
                r="3.5"
                fill="#0f172a"
              />
              <circle cx={isPointing ? 86 : 83} cy="90" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Right Eye */}
          {isBlinking || isCoveringEyes ? (
            <path d="M 111 93 Q 117 98 124 93" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : (
            <g>
              <ellipse cx="118" cy="92" rx="6" ry="6.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
              {/* Pupil tracking rightward if pointing */}
              <circle
                cx={isPointing ? 121 : 118}
                cy={isPointing ? 92 : 92}
                r="3.5"
                fill="#0f172a"
              />
              <circle cx={isPointing ? 122 : 119} cy="90" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Spectacles (Round Wire Frames) */}
          <circle cx="82" cy="92" r="11" stroke="#059669" strokeWidth="1.8" fill="none" opacity="0.85" />
          <circle cx="118" cy="92" r="11" stroke="#059669" strokeWidth="1.8" fill="none" opacity="0.85" />
          <path d="M 93 92 Q 100 89 107 92" stroke="#059669" strokeWidth="1.8" fill="none" />
          <path d="M 71 91 L 62 89" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 129 91 L 138 89" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />

          {/* 9. Interactive Hands & Arms */}

          {/* CASE A: Covering Eyes (Password Mode 🙈) */}
          {isCoveringEyes && !isPeekingEyes && (
            <g className="transition-all duration-300">
              {/* Left Hand covering left eye */}
              <path
                d="M 58 140 C 60 110 70 96 82 92 C 86 91 90 95 88 100 C 84 108 72 120 68 142 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              {/* Right Hand covering right eye */}
              <path
                d="M 142 140 C 140 110 130 96 118 92 C 114 91 110 95 112 100 C 116 108 128 120 132 142 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              {/* Fingers detail */}
              <circle cx="80" cy="92" r="3.5" fill="#ffdfbf" />
              <circle cx="85" cy="94" r="3.5" fill="#ffdfbf" />
              <circle cx="120" cy="92" r="3.5" fill="#ffdfbf" />
              <circle cx="115" cy="94" r="3.5" fill="#ffdfbf" />
            </g>
          )}

          {/* CASE B: Peeking Eyes (Password Peek Mode 👀) */}
          {isPeekingEyes && (
            <g className="transition-all duration-300">
              {/* Hands covering but fingers split allowing eye to peek */}
              <path
                d="M 58 140 C 60 110 68 100 75 98 C 76 104 74 114 68 142 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
              <path
                d="M 142 140 C 140 110 132 100 125 98 C 124 104 126 114 132 142 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* CASE C: Pulling Rope Mode ("হিত দিয়ে টেনে নিয়ে আসবে") */}
          {isPulling && (
            <g className="animate-pulse">
              {/* Golden Rope passing through hands */}
              <path
                d="M 10 170 Q 70 162 130 160 Q 170 158 200 156"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
              {/* Left Pulling Arm */}
              <path
                d="M 52 145 C 50 160 60 175 75 172 C 82 170 78 160 70 158 C 62 155 58 145 52 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
              {/* Right Pulling Arm */}
              <path
                d="M 148 145 C 145 158 135 172 120 168 C 114 165 116 156 124 154 C 132 150 142 145 148 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* CASE D: Pointing Rightwards Towards The Form Inputs */}
          {isPointing && !isCoveringEyes && !isPulling && (
            <g className="transition-all duration-300">
              {/* Left hand relaxed holding book */}
              <path
                d="M 52 145 C 48 165 52 185 64 195 C 68 198 74 192 72 184 C 68 174 62 158 56 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1"
              />
              {/* Islamic Book in left hand */}
              <rect x="58" y="175" width="22" height="28" rx="3" fill="#047857" stroke="#fbbf24" strokeWidth="1.5" transform="rotate(-15 58 175)" />
              <path d="M 64 182 L 76 179" stroke="#fbbf24" strokeWidth="1" />

              {/* Right Arm dynamically pointing directly towards the input card */}
              <path
                d="M 145 145 C 158 148 175 145 192 140 C 196 139 198 143 194 146 C 182 155 162 165 144 168 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              {/* Extended Index Finger pointing right */}
              <path
                d="M 188 138 L 198 136 C 200 135 201 138 199 140 L 190 144 Z"
                fill="#ffdfbf"
                stroke="#d97706"
                strokeWidth="1"
              />
              {/* Golden Pointer Sparkle at fingertip */}
              <circle cx="200" cy="136" r="3" fill="#f59e0b" className="animate-ping" />
              <circle cx="200" cy="136" r="2" fill="#ffffff" />
            </g>
          )}

          {/* CASE E: Cheering / Thumbs-Up (Submit Mode) */}
          {isCheering && !isPulling && (
            <g className="transition-all duration-300">
              {/* Left hand thumbs-up */}
              <path
                d="M 52 145 C 45 130 50 115 62 110 C 66 108 70 112 68 116 C 64 126 62 135 56 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
              <circle cx="64" cy="108" r="3" fill="#10b981" />

              {/* Right hand thumbs-up */}
              <path
                d="M 148 145 C 155 130 150 115 138 110 C 134 108 130 112 132 116 C 136 126 138 135 144 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
              <circle cx="136" cy="108" r="3" fill="#10b981" />
            </g>
          )}

          {/* CASE F: Default Standing Pose (Gentle Greeting) */}
          {!isPointing && !isCoveringEyes && !isPulling && !isCheering && (
            <g className="transition-all duration-300">
              {/* Left Arm holding Tasbeeh or Book */}
              <path
                d="M 52 145 C 48 165 52 185 64 195 C 68 198 74 192 72 184 C 68 174 62 158 56 145 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1"
              />
              {/* Green Book */}
              <rect x="58" y="175" width="22" height="28" rx="3" fill="#047857" stroke="#fbbf24" strokeWidth="1.5" transform="rotate(-15 58 175)" />
              <path d="M 64 182 L 76 179" stroke="#fbbf24" strokeWidth="1" />

              {/* Right Arm raised in friendly 'Marhaban' / pointing welcoming gesture */}
              <path
                d="M 146 145 C 156 155 166 168 172 180 C 176 186 170 190 164 184 C 158 178 150 168 144 158 Z"
                fill="url(#skinGrad)"
                stroke="#e2a87a"
                strokeWidth="1.2"
              />
              {/* Welcoming open palm */}
              <circle cx="170" cy="184" r="5" fill="#ffdfbf" stroke="#d97706" strokeWidth="1" />
            </g>
          )}
        </svg>

        {/* Small floating status badge under mascot */}
        <div className="mt-1 flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
          <span>{isBn ? 'মুহতামিম কার্টুন সহকারী' : 'Huzoor Mascot Guide'}</span>
        </div>
      </div>
    </div>
  );
};
