import { AnalysisResult, Language } from '../types';

export async function fetchServerStatus(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasApiKey: false, model: 'local-heuristic' };
  }
}

export async function analyzeMessageApi(
  message: string,
  context: string[] = [],
  preferredLanguage: Language = 'English'
): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, preferredLanguage }),
  });

  if (!res.ok) {
    throw new Error('Failed to analyze message');
  }

  const data = await res.json();
  return {
    messageId: 'msg-' + Date.now(),
    originalMessage: message,
    detectedLanguage: data.detectedLanguage || 'English',
    literalMeaning: data.literalMeaning || message,
    contextualMeaning: data.contextualMeaning || 'Standard conversational communication.',
    culturalNuances: data.culturalNuances || [],
    sarcasmAnalysis: data.sarcasmAnalysis || { isPossibleSarcasm: false, confidence: 'Low', rationale: 'Direct statement.' },
    safetyShield: data.safetyShield || { riskLevel: 'LOW', detectedIndicators: ['No threat flags'], explanation: 'Safe interaction.', recommendedAction: 'No action required.' },
    extractedActions: (data.extractedActions || []).map((act: any, idx: number) => ({
      id: 'act-' + Date.now() + '-' + idx,
      title: act.title,
      deadline: act.deadline,
      meetingTime: act.meetingTime,
      type: act.type || 'task',
    })),
    suggestedReplies: data.suggestedReplies || [],
    isModelGenerated: Boolean(data.isModelGenerated),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function generateRepliesApi(
  message: string,
  context: string[] = [],
  targetLanguage: Language = 'English'
) {
  const res = await fetch('/api/generate-replies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, targetLanguage }),
  });
  if (!res.ok) throw new Error('Failed to generate replies');
  return await res.json();
}

export async function analyzeVoiceApi(params: {
  audioBase64?: string;
  audioTranscriptText?: string;
  languageHint?: string;
}) {
  const res = await fetch('/api/analyze-voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to analyze voice note');
  return await res.json();
}

export async function analyzeMultimodalApi(imageBase64: string, caption = '') {
  const res = await fetch('/api/analyze-multimodal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, caption }),
  });
  if (!res.ok) throw new Error('Failed to analyze image');
  return await res.json();
}

export async function chatAssistantApi(question: string, conversationContext: { sender: string; text: string }[]) {
  const res = await fetch('/api/chat-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, conversationContext }),
  });
  if (!res.ok) throw new Error('Assistant failed');
  return await res.json();
}
