import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Languages,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Contact, Language } from '../types';

interface RealtimeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  callType: 'voice' | 'video';
  preferredLanguage: Language;
}

interface CallSpeechItem {
  id: string;
  speaker: string;
  text: string;
  translation?: string;
  timestamp: string;
  risk?: 'LOW' | 'HIGH';
}

export const RealtimeCallModal: React.FC<RealtimeCallModalProps> = ({
  isOpen,
  onClose,
  contact,
  callType,
  preferredLanguage,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [speechHistory, setSpeechHistory] = useState<CallSpeechItem[]>([]);
  const [callInputText, setCallInputText] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Call duration timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Set up real browser Speech Recognition if supported
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript.trim()) {
            handleNewCallSpeech(transcript.trim(), contact.name);
          }
        };

        recognition.onerror = () => {
          setIsListeningMic(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        // Recognition fallback
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen, preferredLanguage, contact.name]);

  const toggleMicRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListeningMic) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (e) {
        setIsListeningMic(false);
      }
    }
  };

  const handleNewCallSpeech = (text: string, speakerName: string) => {
    const lower = text.toLowerCase();
    const isHighRisk =
      lower.includes('otp') ||
      lower.includes('password') ||
      lower.includes('pin') ||
      lower.includes('blocked in') ||
      lower.includes('bank account');

    const newItem: CallSpeechItem = {
      id: 'speech-' + Date.now(),
      speaker: speakerName,
      text,
      timestamp: formatTime(callDuration),
      risk: isHighRisk ? 'HIGH' : 'LOW',
    };

    setSpeechHistory((prev) => [...prev, newItem]);
  };

  const handleManualSpeechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callInputText.trim()) return;
    handleNewCallSpeech(callInputText.trim(), contact.name);
    setCallInputText('');
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasHighRiskInCall = speechHistory.some((s) => s.risk === 'HIGH');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#111b21] w-full max-w-4xl h-[88vh] max-h-[720px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-700 relative">
        {/* Left Side: Real WhatsApp Call Screen */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-radial from-[#1f2c34] to-[#111b21] relative overflow-hidden">
          {/* Header */}
          <div className="w-full flex items-center justify-between text-slate-300 text-xs z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a884] animate-pulse" />
              <span className="font-medium text-slate-200">
                WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call
              </span>
            </div>
            <span className="font-mono bg-black/40 px-3 py-1 rounded-full text-[#00a884] font-bold border border-[#00a884]/20">
              {formatTime(callDuration)}
            </span>
          </div>

          {/* Caller Profile */}
          <div className="flex flex-col items-center justify-center space-y-4 my-auto z-10">
            <div className="relative">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
              />
              <div className="absolute -inset-2 rounded-full border-2 border-[#00a884]/40 animate-ping pointer-events-none" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white tracking-wide">{contact.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">End-to-End Encrypted</p>
            </div>

            {/* Live Audio Waves */}
            <div className="flex items-center space-x-1 h-6">
              {[40, 75, 50, 90, 65, 80, 45, 95, 60, 85, 40, 70].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1 bg-[#00a884] rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center space-x-4 z-10 pb-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition cursor-pointer shadow-lg ${
                isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-700/80 text-white hover:bg-slate-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {callType === 'video' && (
              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-full transition cursor-pointer shadow-lg ${
                  !isVideoOn
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700/80 text-white hover:bg-slate-600'
                }`}
                title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}

            <button
              type="button"
              className="p-3.5 rounded-full bg-slate-700/80 text-white hover:bg-slate-600 cursor-pointer shadow-lg"
              title="Speaker"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xl transform hover:scale-105 transition"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: NUANCE Real-Time In-Call HUD */}
        <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-700 flex flex-col justify-between p-4 z-20">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>NUANCE Call Copilot</span>
                    <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-purple-300">Live Speech Translation &amp; Safety</p>
                </div>
              </div>

              {/* Mic Toggle for live speech recognition */}
              <button
                type="button"
                onClick={toggleMicRecognition}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center space-x-1 ${
                  isListeningMic
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Capture your microphone live"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListeningMic ? 'Listening...' : 'Live Mic'}</span>
              </button>
            </div>

            {/* In-Call Warning Banner if detected */}
            {hasHighRiskInCall && (
              <div className="mt-3 p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-200 text-xs space-y-1 animate-pulse">
                <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>LIVE IN-CALL WARNING: HIGH RISK</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-200">
                  The caller verbally requested sensitive verification codes/passwords. Do not share!
                </p>
              </div>
            )}

            {/* Live Subtitles & Transcript */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center space-x-1">
                  <Languages className="w-3 h-3 text-purple-400" />
                  <span>Real-Time In-Call Subtitles</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-purple-300 font-mono">
                  Live
                </span>
              </div>

              <div className="h-52 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                {speechHistory.length > 0 ? (
                  speechHistory.map((speech) => (
                    <div
                      key={speech.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 shadow-sm ${
                        speech.risk === 'HIGH'
                          ? 'bg-rose-950/40 border-rose-600/50'
                          : 'bg-slate-800/80 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-[#00a884]">{speech.speaker}</span>
                        <span>{speech.timestamp}</span>
                      </div>
                      <p className="text-white font-medium leading-relaxed">&ldquo;{speech.text}&rdquo;</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                    <span>Speak into your microphone or type what the caller says below to translate live.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test or Speak into Call Input */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <form onSubmit={handleManualSpeechSubmit} className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Type or speak words spoken in call..."
                value={callInputText}
                onChange={(e) => setCallInputText(e.target.value)}
                className="flex-1 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
