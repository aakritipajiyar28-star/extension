export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type Language =
  | 'English'
  | 'Hindi'
  | 'Nepali'
  | 'Kannada'
  | 'Tamil'
  | 'Telugu'
  | 'Bengali'
  | 'Malayalam';

export interface CulturalNuance {
  phrase: string;
  explanation: string;
  type: 'idiom' | 'slang' | 'indirect' | 'sarcasm' | 'code-mix' | 'cultural';
}

export interface SarcasmAnalysis {
  isPossibleSarcasm: boolean;
  confidence: 'Low' | 'Medium' | 'High';
  rationale: string;
}

export interface SafetyShield {
  riskLevel: RiskLevel;
  detectedIndicators: string[];
  explanation: string;
  recommendedAction: string;
}

export interface ExtractedAction {
  id: string;
  title: string;
  deadline?: string;
  meetingTime?: string;
  type: 'task' | 'meeting' | 'deadline' | 'followup';
  completed?: boolean;
}

export interface SuggestedReply {
  tone: 'Friendly' | 'Professional' | 'Casual' | 'Formal';
  reply: string;
  translatedReply?: string;
}

export interface AnalysisResult {
  messageId: string;
  originalMessage: string;
  detectedLanguage: string;
  literalMeaning: string;
  contextualMeaning: string;
  culturalNuances: CulturalNuance[];
  sarcasmAnalysis: SarcasmAnalysis;
  safetyShield: SafetyShield;
  extractedActions: ExtractedAction[];
  suggestedReplies: SuggestedReply[];
  isModelGenerated: boolean;
  timestamp: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'them';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'voice' | 'image';
  voiceDuration?: string;
  audioUrl?: string;
  imageUrl?: string;
  imageCaption?: string;
  safetyRisk?: RiskLevel;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  subtitle: string;
  lastMessageTime: string;
  unreadCount?: number;
  onlineStatus?: string;
  tag?: string;
  messages: Message[];
}

export interface InsightStats {
  messagesAnalysed: number;
  translationsPerformed: number;
  safetyAlertsPrevented: number;
  tasksExtracted: number;
  topLanguages: { language: string; percentage: number }[];
  unfamiliarExpressions: { expression: string; count: number; meaning: string }[];
}

export interface ExtensionSettings {
  isNuanceActive: boolean;
  preferredLanguage: Language;
  autoAnalyzeIncoming: boolean;
  highRiskBannerAlerts: boolean;
  toneStyleDefault: 'Friendly' | 'Professional' | 'Casual' | 'Formal';
  respectLocalPrivacy: boolean;
}
