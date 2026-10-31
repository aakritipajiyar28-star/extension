/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_CONTACTS, INITIAL_STATS } from './data/mockConversations';
import { Contact, InsightStats, Language, Message, AnalysisResult } from './types';
import { WhatsAppInterface } from './components/WhatsAppInterface';
import { NuanceFloatingBadge } from './components/NuanceFloatingBadge';
import { NuanceSidePanel } from './components/NuanceSidePanel';
import { MultimodalModal } from './components/MultimodalModal';
import { RealtimeCallModal } from './components/RealtimeCallModal';
import {
  analyzeMessageApi,
  analyzeVoiceApi,
  analyzeMultimodalApi,
  chatAssistantApi,
  fetchServerStatus,
} from './services/nuanceApi';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('contact-1');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const [isNuanceActive, setIsNuanceActive] = useState<boolean>(true);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('copilot');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('Hindi');

  // Real-time call modal state
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);

  const [stats, setStats] = useState<InsightStats>(INITIAL_STATS);
  const [isMultimodalModalOpen, setIsMultimodalModalOpen] = useState<boolean>(false);

  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<any>(null);
  const [isVoiceLoading, setIsVoiceLoading] = useState<boolean>(false);

  const [multimodalResult, setMultimodalResult] = useState<any>(null);
  const [isMultimodalLoading, setIsMultimodalLoading] = useState<boolean>(false);

  const [aiChatHistory, setAiChatHistory] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string }[]
  >([
    {
      role: 'assistant',
      text: 'NUANCE Real-Time Copilot ready. Type or receive a message to begin real-time analysis.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Client-side cache
  const clientCacheRef = useRef<Map<string, AnalysisResult>>(new Map());
  const lastAnalyzedKeyRef = useRef<string>('');

  // Check server status
  useEffect(() => {
    fetchServerStatus().then((res) => {
      setHasApiKey(res.hasApiKey);
    });
  }, []);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Run analysis for a message with caching
  const runAnalysis = useCallback(
    async (messageText: string, contextMessages: string[] = []) => {
      if (!isNuanceActive || !messageText.trim()) return;

      const cacheKey = `${preferredLanguage}:${messageText.trim()}`;
      if (clientCacheRef.current.has(cacheKey)) {
        const cached = clientCacheRef.current.get(cacheKey)!;
        setAnalysis(cached);
        if (cached.safetyShield.riskLevel === 'HIGH') {
          setActiveTab('safety');
        }
        return;
      }

      if (lastAnalyzedKeyRef.current === cacheKey && isLoadingAnalysis) {
        return;
      }
      lastAnalyzedKeyRef.current = cacheKey;

      setIsLoadingAnalysis(true);
      try {
        const result = await analyzeMessageApi(messageText, contextMessages, preferredLanguage);
        clientCacheRef.current.set(cacheKey, result);
        setAnalysis(result);

        setStats((prev) => ({
          ...prev,
          messagesAnalysed: prev.messagesAnalysed + 1,
          translationsPerformed: prev.translationsPerformed + 1,
          safetyAlertsPrevented:
            result.safetyShield.riskLevel === 'HIGH'
              ? prev.safetyAlertsPrevented + 1
              : prev.safetyAlertsPrevented,
          tasksExtracted: prev.tasksExtracted + (result.extractedActions?.length || 0),
        }));

        if (result.safetyShield.riskLevel === 'HIGH') {
          setActiveTab('safety');
        }
      } catch (err) {
        // Fallback handled gracefully
      } finally {
        setIsLoadingAnalysis(false);
      }
    },
    [isNuanceActive, preferredLanguage, isLoadingAnalysis]
  );

  // Handle selecting a message in chat
  const handleSelectMessageForAnalysis = (msg: Message) => {
    setSelectedMessageId(msg.id);
    const context = activeContact?.messages?.map((m) => `${m.senderName}: ${m.text}`) || [];
    runAnalysis(msg.text, context);
  };

  // Handle selecting a contact
  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    const contact = contacts.find((c) => c.id === id);
    if (contact && contact.messages.length > 0) {
      const lastMsg = contact.messages[contact.messages.length - 1];
      setSelectedMessageId(lastMsg.id);
      const context = contact.messages.map((m) => `${m.senderName}: ${m.text}`);
      runAnalysis(lastMsg.text, context);
    } else {
      setSelectedMessageId(null);
      setAnalysis(null);
    }
  };

  // Add a new contact
  const handleAddNewContact = (name: string) => {
    const newContact: Contact = {
      id: 'contact-' + Date.now(),
      name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      subtitle: 'No messages yet',
      lastMessageTime: '',
      unreadCount: 0,
      onlineStatus: 'online',
      messages: [],
    };
    setContacts((prev) => [newContact, ...prev]);
    setActiveContactId(newContact.id);
    setSelectedMessageId(null);
    setAnalysis(null);
  };

  // Clear current chat
  const handleClearCurrentChat = () => {
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContactId ? { ...c, messages: [], subtitle: 'No messages yet' } : c))
    );
    setSelectedMessageId(null);
    setAnalysis(null);
  };

  // Start real-time call
  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsCallModalOpen(true);
  };

  // Handle sending a new message (either as 'me' or 'them')
  const handleSendMessage = (text: string, sender: 'me' | 'them' = 'them') => {
    const isMe = sender === 'me';
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      sender,
      senderName: isMe ? 'You' : activeContact?.name || 'Contact',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            lastMessageTime: newMsg.timestamp,
            subtitle: `${isMe ? 'You: ' : ''}${text}`,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setSelectedMessageId(newMsg.id);
    setCopiedSuggestion(null);

    // If NUANCE is active, immediately analyze real message
    if (isNuanceActive) {
      runAnalysis(text);
    }
  };

  const handleCopyReply = (text: string) => {
    setCopiedSuggestion(text);
  };

  const handleInsertReplyToChat = (text: string) => {
    setCopiedSuggestion(text);
  };

  const handleToggleNuance = () => {
    setIsNuanceActive((prev) => !prev);
  };

  // Analyze Voice Note
  const handleAnalyzeVoice = async (textHint: string) => {
    setIsVoiceLoading(true);
    try {
      const result = await analyzeVoiceApi({
        audioTranscriptText: textHint,
        languageHint: 'Kannada',
      });
      setVoiceAnalysisResult(result);
    } catch (err) {
      // Handled
    } finally {
      setIsVoiceLoading(false);
    }
  };

  // Analyze Multimodal Image
  const handleAnalyzeImage = async (base64: string, caption?: string) => {
    setIsMultimodalLoading(true);
    try {
      const result = await analyzeMultimodalApi(base64, caption);
      setMultimodalResult(result);
    } catch (err) {
      // Handled
    } finally {
      setIsMultimodalLoading(false);
    }
  };

  // AI Assistant Chat
  const handleSendAssistantMessage = async (msg: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = [...aiChatHistory, { role: 'user' as const, text: msg, timestamp: now }];
    setAiChatHistory(updatedHistory);
    setIsAssistantLoading(true);

    try {
      const context = (activeContact?.messages || []).map((m) => ({
        sender: m.senderName,
        text: m.text,
      }));
      const res = await chatAssistantApi(msg, context);
      setAiChatHistory([
        ...updatedHistory,
        {
          role: 'assistant',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      // Handled
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Clear Session Data
  const handleClearSessionData = () => {
    clientCacheRef.current.clear();
    lastAnalyzedKeyRef.current = '';
    setStats({
      messagesAnalysed: 0,
      translationsPerformed: 0,
      safetyAlertsPrevented: 0,
      tasksExtracted: 0,
      topLanguages: [],
      unfamiliarExpressions: [],
    });
    setAnalysis(null);
    setCopiedSuggestion(null);
    setVoiceAnalysisResult(null);
    setMultimodalResult(null);
  };

  const highRiskAlertsCount = (activeContact?.messages || []).filter((m) => m.safetyRisk === 'HIGH').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111b21] text-[#111b21]">
      {/* Main Workspace: WhatsApp Web + Chrome Extension Side Panel */}
      <main className="flex-1 flex overflow-hidden relative">
        <WhatsAppInterface
          contacts={contacts}
          activeContactId={activeContactId}
          onSelectContact={handleSelectContact}
          onSendMessage={handleSendMessage}
          onSelectMessageForAnalysis={handleSelectMessageForAnalysis}
          selectedMessageId={selectedMessageId}
          isNuanceActive={isNuanceActive}
          copiedSuggestion={copiedSuggestion}
          onOpenVoiceTab={() => {
            setIsSidePanelOpen(true);
            setActiveTab('voice');
            handleAnalyzeVoice('Voice note audio');
          }}
          onOpenMultimodalTab={() => setIsMultimodalModalOpen(true)}
          onStartCall={handleStartCall}
          suggestedReplies={analysis?.suggestedReplies || []}
          onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
          isSidePanelOpen={isSidePanelOpen}
          onAddNewContact={handleAddNewContact}
          onClearCurrentChat={handleClearCurrentChat}
        />

        {/* Expandable NUANCE Extension Side Panel */}
        <NuanceSidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          isNuanceActive={isNuanceActive}
          onToggleActive={handleToggleNuance}
          analysis={analysis}
          isLoadingAnalysis={isLoadingAnalysis}
          activeContact={activeContact}
          onCopyReply={handleCopyReply}
          onInsertReplyToChat={handleInsertReplyToChat}
          preferredLanguage={preferredLanguage}
          onChangeLanguage={setPreferredLanguage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          onClearSessionData={handleClearSessionData}
          hasApiKey={hasApiKey}
          onRunAnalysisForMessage={(text) => runAnalysis(text)}
          onAnalyzeCustomVoice={handleAnalyzeVoice}
          voiceAnalysisResult={voiceAnalysisResult}
          isVoiceLoading={isVoiceLoading}
          multimodalResult={multimodalResult}
          isMultimodalLoading={isMultimodalLoading}
          onAnalyzeImage={handleAnalyzeImage}
          aiChatHistory={aiChatHistory}
          onSendAssistantMessage={handleSendAssistantMessage}
          isAssistantLoading={isAssistantLoading}
          onStartCall={handleStartCall}
        />

        {/* Floating Extension Badge */}
        {!isSidePanelOpen && (
          <NuanceFloatingBadge
            isNuanceActive={isNuanceActive}
            isOpen={isSidePanelOpen}
            onToggleOpen={() => setIsSidePanelOpen(true)}
            pendingAlertsCount={highRiskAlertsCount}
          />
        )}
      </main>

      {/* Real-time Voice & Video Call Modal with NUANCE HUD */}
      <RealtimeCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        contact={activeContact}
        callType={callType}
        preferredLanguage={preferredLanguage}
      />

      {/* Multimodal Meme & Screenshot Scanner */}
      <MultimodalModal
        isOpen={isMultimodalModalOpen}
        onClose={() => setIsMultimodalModalOpen(false)}
        onAnalyzeImage={handleAnalyzeImage}
        multimodalResult={multimodalResult}
        isLoading={isMultimodalLoading}
        onInsertReply={handleInsertReplyToChat}
      />
    </div>
  );
}
