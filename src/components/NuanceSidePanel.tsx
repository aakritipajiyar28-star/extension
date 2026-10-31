import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Languages,
  Mic,
  CalendarCheck,
  Brain,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
  X,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  PhoneCall,
  Edit3,
  Trash2,
  Lock,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AnalysisResult,
  Contact,
  ExtractedAction,
  InsightStats,
  Language,
  SuggestedReply,
} from '../types';

interface NuanceSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isNuanceActive: boolean;
  onToggleActive: () => void;
  analysis: AnalysisResult | null;
  isLoadingAnalysis: boolean;
  activeContact: Contact;
  onCopyReply: (text: string) => void;
  onInsertReplyToChat: (text: string) => void;
  preferredLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: InsightStats;
  onClearSessionData: () => void;
  hasApiKey: boolean;
  onRunAnalysisForMessage: (text: string) => void;
  onAnalyzeCustomVoice: (textHint: string) => void;
  voiceAnalysisResult: any;
  isVoiceLoading: boolean;
  multimodalResult: any;
  isMultimodalLoading: boolean;
  onAnalyzeImage: (base64: string, caption?: string) => void;
  aiChatHistory: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  onSendAssistantMessage: (msg: string) => void;
  isAssistantLoading: boolean;
  onStartCall: (type: 'voice' | 'video') => void;
}

const LANGUAGES: Language[] = [
  'English',
  'Hindi',
  'Nepali',
  'Kannada',
  'Tamil',
  'Telugu',
  'Bengali',
  'Malayalam',
];

export const NuanceSidePanel: React.FC<NuanceSidePanelProps> = ({
  isOpen,
  onClose,
  isNuanceActive,
  onToggleActive,
  analysis,
  isLoadingAnalysis,
  activeContact,
  onCopyReply,
  onInsertReplyToChat,
  preferredLanguage,
  onChangeLanguage,
  activeTab,
  setActiveTab,
  stats,
  onClearSessionData,
  hasApiKey,
  onRunAnalysisForMessage,
  onAnalyzeCustomVoice,
  voiceAnalysisResult,
  isVoiceLoading,
  multimodalResult,
  isMultimodalLoading,
  onAnalyzeImage,
  aiChatHistory,
  onSendAssistantMessage,
  isAssistantLoading,
  onStartCall,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingReplyTone, setEditingReplyTone] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState<string>('');
  const [assistantInput, setAssistantInput] = useState('');
  const [actionsList, setActionsList] = useState<ExtractedAction[]>([]);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (analysis?.extractedActions) {
      setActionsList(analysis.extractedActions);
    }
  }, [analysis]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onCopyReply(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (reply: SuggestedReply) => {
    setEditingReplyTone(reply.tone);
    setEditedReplyText(reply.reply);
  };

  const handleSaveEditAndInsert = () => {
    if (editedReplyText.trim()) {
      onInsertReplyToChat(editedReplyText.trim());
      setEditingReplyTone(null);
    }
  };

  const handleAddReminder = (action: ExtractedAction) => {
    setReminderToast(`Reminder set: "${action.title}"`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const toggleActionComplete = (id: string) => {
    setActionsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleSendAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAssistantLoading) return;
    onSendAssistantMessage(assistantInput.trim());
    setAssistantInput('');
  };

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[420px] bg-white h-full border-l border-slate-200 flex flex-col shadow-2xl z-30 transition-all duration-300 relative select-none">
      {/* Extension Header */}
      <div className="bg-[#111b21] text-white p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white">NUANCE</span>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/30 px-1.5 py-0.2 rounded font-mono">
                  Extension
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Call Quick Launcher */}
            <button
              type="button"
              onClick={() => onStartCall('voice')}
              className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 cursor-pointer transition shadow-2xs"
              title="Start Live Call Intelligence HUD"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Mode</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="mt-2.5 bg-white/10 rounded-lg p-2 flex items-center justify-between border border-white/10">
          <div className="flex items-center space-x-2">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                isNuanceActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {isNuanceActive ? <ShieldCheck className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div className="text-xs font-bold flex items-center space-x-1.5 text-white">
                <span>{isNuanceActive ? 'NUANCE Active' : 'NUANCE Paused'}</span>
                {isNuanceActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleActive}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
              isNuanceActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                isNuanceActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-slate-50 border-b border-slate-200 flex overflow-x-auto text-xs font-semibold px-2 scrollbar-none">
        {[
          { id: 'copilot', label: 'Copilot', icon: MessageSquare },
          { id: 'culture', label: 'Meaning & Subtext', icon: Brain },
          { id: 'translate', label: 'Translate', icon: Languages },
          { id: 'voice', label: 'Voice Notes', icon: Mic },
          { id: 'safety', label: 'Safety', icon: ShieldAlert },
          { id: 'actions', label: 'Tasks', icon: CalendarCheck },
          { id: 'multimodal', label: 'Meme/OCR', icon: ImageIcon },
          { id: 'ask-ai', label: 'Ask AI', icon: Sparkles },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 px-3 py-2 border-b-2 whitespace-nowrap transition cursor-pointer text-[11px] ${
                isActive
                  ? 'border-purple-600 text-purple-700 font-bold bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* If Paused */}
        {!isNuanceActive && (
          <div className="bg-slate-100 rounded-xl p-4 text-center space-y-2 border border-slate-200">
            <EyeOff className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">NUANCE is Paused</h4>
            <p className="text-[11px] text-slate-500">
              Message monitoring and AI suggestions are stopped.
            </p>
            <button
              type="button"
              onClick={onToggleActive}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shadow-xs"
            >
              Resume NUANCE
            </button>
          </div>
        )}

        {/* Reminder notification toast */}
        {reminderToast && (
          <div className="p-2.5 bg-emerald-600 text-white text-xs rounded-lg shadow-md flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4" />
            <span>{reminderToast}</span>
          </div>
        )}

        {/* TAB: COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-3">
            {/* Active message */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Current Message</span>
                <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded text-[10px] font-medium">
                  {analysis?.detectedLanguage || 'Detecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium italic">
                &ldquo;{analysis?.originalMessage || 'Select any message to view smart replies'}&rdquo;
              </p>
            </div>

            {/* Smart Suggested Replies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Suggested Replies</span>
                </h4>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500">Lang:</span>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => onChangeLanguage(e.target.value as Language)}
                    className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingAnalysis ? (
                <div className="p-5 text-center text-xs text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 text-purple-600 animate-spin mx-auto" />
                  <span>Generating contextual replies...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis?.suggestedReplies.map((reply, idx) => {
                    const isEditing = editingReplyTone === reply.tone;
                    const toneColor =
                      reply.tone === 'Friendly'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : reply.tone === 'Professional'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : reply.tone === 'Casual'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200';

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:border-purple-300 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full border ${toneColor}`}
                          >
                            {reply.tone}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(reply)}
                              className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(reply.reply, `rep-${idx}`)}
                              className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                              title="Copy"
                            >
                              {copiedId === `rep-${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={editedReplyText}
                              onChange={(e) => setEditedReplyText(e.target.value)}
                              rows={2}
                              className="w-full text-xs p-1.5 bg-slate-50 border border-purple-300 rounded focus:outline-none"
                            />
                            <div className="flex justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingReplyTone(null)}
                                className="text-[10px] px-2 py-0.5 text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditAndInsert}
                                className="text-[10px] px-2.5 py-0.5 bg-purple-600 text-white rounded font-medium cursor-pointer"
                              >
                                Insert
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {reply.reply}
                            </p>
                            {reply.translatedReply && preferredLanguage !== 'English' && (
                              <div className="text-[11px] text-purple-900 bg-purple-50/60 p-1.5 rounded border border-purple-100">
                                <span className="font-semibold">{preferredLanguage}: </span>
                                <span>{reply.translatedReply}</span>
                              </div>
                            )}

                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => onInsertReplyToChat(reply.reply)}
                                className="text-[11px] bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-medium cursor-pointer flex items-center space-x-1 shadow-2xs"
                              >
                                <span>Insert to Chat</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: MEANING & SUBTEXT */}
        {activeTab === 'culture' && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Literal Meaning
              </span>
              <p className="text-xs text-slate-800 bg-slate-50 p-2 rounded border border-slate-200/80">
                {analysis?.literalMeaning || 'Evaluating text...'}
              </p>
            </div>

            <div className="bg-purple-50/60 rounded-xl border border-purple-200 p-3 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                Contextual Meaning &amp; Subtext
              </span>
              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {analysis?.contextualMeaning || 'Evaluating conversational subtext...'}
              </p>
            </div>

            {/* Sarcasm flag if any */}
            {analysis?.sarcasmAnalysis.isPossibleSarcasm && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 space-y-1">
                <span className="font-bold">Possible Sarcasm Detected:</span>
                <p className="text-[11px]">{analysis.sarcasmAnalysis.rationale}</p>
              </div>
            )}

            {/* Idioms / Expressions */}
            {analysis?.culturalNuances && analysis.culturalNuances.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-slate-800">Key Expressions</span>
                <div className="space-y-1.5">
                  {analysis.culturalNuances.map((nuance, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-semibold text-purple-900">&ldquo;{nuance.phrase}&rdquo;</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{nuance.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: TRANSLATE */}
        {activeTab === 'translate' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onChangeLanguage(l)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    preferredLanguage === l
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Original</span>
              <p className="text-xs text-slate-800 font-medium">
                {analysis?.originalMessage || 'Select a message'}
              </p>
            </div>

            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-700 uppercase">
                Translated ({preferredLanguage})
              </span>
              <p className="text-xs text-purple-950 font-medium">
                {analysis?.suggestedReplies?.[0]?.translatedReply || analysis?.literalMeaning}
              </p>
            </div>
          </div>
        )}

        {/* TAB: VOICE NOTES */}
        {activeTab === 'voice' && (
          <div className="space-y-3">
            <div className="bg-[#111b21] text-white rounded-xl p-3.5 space-y-3">
              <div className="text-xs text-purple-300 font-semibold">
                Kannada Voice Note (0:34)
              </div>

              <button
                type="button"
                onClick={() => onAnalyzeCustomVoice('Kannada sample')}
                disabled={isVoiceLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded-lg font-semibold cursor-pointer transition flex items-center justify-center space-x-1.5"
              >
                {isVoiceLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
                <span>{isVoiceLoading ? 'Transcribing...' : 'Transcribe & Translate'}</span>
              </button>
            </div>

            {voiceAnalysisResult && (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Transcript</span>
                  <p className="text-slate-800 font-medium">&ldquo;{voiceAnalysisResult.transcript}&rdquo;</p>
                </div>

                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-700">Translation</span>
                  <p className="text-purple-950 font-medium">&ldquo;{voiceAnalysisResult.translation}&rdquo;</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-600">Summary</span>
                  <p className="text-slate-700">{voiceAnalysisResult.summary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onInsertReplyToChat(voiceAnalysisResult.suggestedReply)}
                  className="w-full text-xs bg-[#00a884] hover:bg-[#008f6f] text-white py-2 rounded-lg font-semibold cursor-pointer transition"
                >
                  Insert Reply into WhatsApp
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: SAFETY SHIELD */}
        {activeTab === 'safety' && (
          <div className="space-y-3">
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                analysis?.safetyShield.riskLevel === 'HIGH'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>Risk Level</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                    analysis?.safetyShield.riskLevel === 'HIGH'
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {analysis?.safetyShield.riskLevel || 'LOW'}
                </span>
              </div>

              <p className="text-xs leading-relaxed">{analysis?.safetyShield.explanation}</p>

              <div className="bg-white/80 p-2 rounded text-xs font-semibold">
                Action: {analysis?.safetyShield.recommendedAction}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TASKS & DEADLINES */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Extracted Tasks &amp; Schedule</h4>
            {actionsList.length > 0 ? (
              <div className="space-y-2">
                {actionsList.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={Boolean(act.completed)}
                        onChange={() => toggleActionComplete(act.id)}
                        className="cursor-pointer"
                      />
                      <span className={`font-semibold ${act.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {act.title}
                      </span>
                    </div>
                    {act.deadline && (
                      <span className="inline-block text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                        Due: {act.deadline}
                      </span>
                    )}
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddReminder(act)}
                        className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded cursor-pointer"
                      >
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4">No tasks found</div>
            )}
          </div>
        )}

        {/* TAB: MEME / OCR */}
        {activeTab === 'multimodal' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onAnalyzeImage('mock-meme', 'Sharma ji ka beta meme')}
              disabled={isMultimodalLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded-lg font-semibold cursor-pointer transition flex items-center justify-center space-x-1.5"
            >
              {isMultimodalLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Analyze Sample Meme</span>
            </button>

            {multimodalResult && (
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 text-[10px] uppercase">Extracted Text</span>
                  <p className="text-slate-800 mt-0.5">&ldquo;{multimodalResult.extractedText}&rdquo;</p>
                </div>
                <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs">
                  <span className="font-bold text-purple-700 text-[10px] uppercase">Context &amp; Lore</span>
                  <p className="text-purple-950 mt-0.5">{multimodalResult.culturalContext}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ASK AI */}
        {activeTab === 'ask-ai' && (
          <div className="flex flex-col h-[400px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {aiChatHistory.map((c, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs leading-relaxed ${
                    c.role === 'user'
                      ? 'bg-purple-600 text-white ml-auto max-w-[85%]'
                      : 'bg-white text-slate-800 border border-slate-200 mr-auto max-w-[85%]'
                  }`}
                >
                  {c.text}
                </div>
              ))}
              {isAssistantLoading && (
                <div className="text-[11px] text-purple-600 animate-pulse">Thinking...</div>
              )}
            </div>

            <form onSubmit={handleSendAssistant} className="p-2 bg-white border-t border-slate-200 flex gap-1.5">
              <input
                type="text"
                placeholder="Ask about this chat..."
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded focus:outline-none"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded cursor-pointer font-medium"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <label className="font-semibold text-slate-700">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onClearSessionData}
                className="w-full text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-1.5 rounded font-medium cursor-pointer transition mt-2"
              >
                Clear Local Session Data
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
