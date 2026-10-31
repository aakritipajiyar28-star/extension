import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

interface MultimodalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeImage: (base64: string, caption?: string) => void;
  multimodalResult: any;
  isLoading: boolean;
  onInsertReply: (reply: string) => void;
}

const SAMPLE_MEMES = [
  {
    id: 'sharma-ji',
    title: 'Sharma Ji Ka Beta Meme',
    description: 'Indian parent comparison meme about perfection vs exhaustion',
    imageUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    caption: 'Sharma ji ka beta got 99.8% in CAT and is still taking feedback nicely. Meanwhile me:',
  },
  {
    id: 'fake-payment',
    title: 'Suspicious Payment Slip',
    description: 'Deceptive screenshot mimicking a UPI/bank transfer',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    caption: 'Urgent: Payment sent of Rs 50,000. Send goods immediately to this address.',
  },
];

export const MultimodalModal: React.FC<MultimodalModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeImage,
  multimodalResult,
  isLoading,
  onInsertReply,
}) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_MEMES[0]);
  const [userCaption, setUserCaption] = useState('');

  if (!isOpen) return null;

  const handleRunSample = (sample: typeof SAMPLE_MEMES[0]) => {
    setSelectedSample(sample);
    setUserCaption(sample.caption);
    onAnalyzeImage(sample.imageUrl, sample.caption);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onAnalyzeImage(base64, userCaption || file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold">Multimodal Image, Meme &amp; Screenshot Intelligence</h3>
              <p className="text-[11px] text-slate-400">
                OCR text extraction, cultural humor decoding, and visual safety inspection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Sample Selectors */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-800">
              Select Sample or Upload an Image:
            </span>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_MEMES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleRunSample(sample)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedSample.id === sample.id
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-800">{sample.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sample.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Custom */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <div className="text-xs text-slate-600">
              Or analyze your own WhatsApp screenshot, meme, or receipt:
            </div>
            <label className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center space-x-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Trigger Analysis */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleRunSample(selectedSample)}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Analyzing Image...' : 'Analyze Image with NUANCE'}</span>
            </button>
          </div>

          {/* Analysis Results */}
          {multimodalResult && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              {/* OCR */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  OCR Extracted Text ({multimodalResult.detectedLanguage || 'Detected'})
                </span>
                <p className="text-xs text-slate-800 font-medium">
                  &ldquo;{multimodalResult.extractedText}&rdquo;
                </p>
              </div>

              {/* Cultural Context */}
              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                  Cultural Context &amp; Reference Interpretation
                </span>
                <p className="text-xs text-purple-950 font-medium leading-relaxed">
                  {multimodalResult.culturalContext}
                </p>
              </div>

              {/* Humor */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Humor, Irony &amp; Sarcasm Decode
                </span>
                <p className="text-xs text-slate-700">{multimodalResult.humorExplanation}</p>
              </div>

              {/* Safety */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  multimodalResult.safetyCheck?.riskLevel === 'HIGH'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1">
                    {multimodalResult.safetyCheck?.riskLevel === 'HIGH' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Visual Safety Verification</span>
                  </span>
                  <span className="text-[10px] uppercase font-black">
                    {multimodalResult.safetyCheck?.riskLevel || 'LOW'} Risk
                  </span>
                </div>
                <p className="text-xs">{multimodalResult.safetyCheck?.findings}</p>
              </div>

              {/* Suggested Reply */}
              {multimodalResult.suggestedReply && (
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 flex items-center justify-between">
                  <div className="mr-2">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase">
                      Suggested Conversational Response
                    </span>
                    <p className="text-xs text-indigo-950 font-medium mt-0.5">
                      &ldquo;{multimodalResult.suggestedReply}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onInsertReply(multimodalResult.suggestedReply);
                      onClose();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer shadow-2xs flex items-center space-x-1 shrink-0"
                  >
                    <span>Insert to Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
