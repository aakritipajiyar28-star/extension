import React from 'react';
import { Sparkles, ShieldCheck, Languages, Brain, Mic, CheckCircle2, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-purple-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">NUANCE</h2>
            <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-mono">Chrome Extension</span>
          </div>

          <p className="text-sm text-purple-100 font-medium leading-relaxed">
            &ldquo;Understand the Language. Preserve the Meaning. Protect the Conversation.&rdquo;
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            NUANCE is an intelligent multimodal communication companion that operates seamlessly alongside WhatsApp Web to bridge cultural gaps, decipher code-mixed languages, and safeguard your conversations.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start space-x-3">
              <Brain className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-950">Cultural &amp; Context Intelligence</h4>
                <p className="text-[11px] text-purple-850 mt-0.5">
                  Differentiates literal meaning from contextual meaning, decodes subtle high-context feedback, idioms, and sarcasm without claiming absolute certainty.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start space-x-3">
              <Languages className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-950">Multilingual &amp; Code-Mixed Copilot</h4>
                <p className="text-[11px] text-blue-850 mt-0.5">
                  Full comprehension of Romanized South Asian communication (Hinglish, Kanglish, Nepali-English, Tanglish) and tone-tailored reply drafting.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Voice Trust &amp; Smart Safety Shield</h4>
                <p className="text-[11px] text-emerald-850 mt-0.5">
                  Real-time detection of urgency pressure, OTP requests, and impersonation, plus automated Kannada/regional voice note transcription.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy pledge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>User-Controlled Privacy First</span>
            </div>
            <p>
              Turn NUANCE ON or OFF anytime. When paused, message analysis stops completely and no data leaves your browser.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              Enter WhatsApp Web with NUANCE
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center">
            Independent third-party prototype • Not affiliated with WhatsApp LLC
          </div>
        </div>
      </div>
    </div>
  );
};
