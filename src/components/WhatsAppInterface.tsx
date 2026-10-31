import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  Phone,
  Video,
  ShieldAlert,
  Sparkles,
  Play,
  Pause,
  MessageSquare,
  Users,
  CircleDot,
  Radio,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { Contact, Message, SuggestedReply } from '../types';

interface WhatsAppInterfaceProps {
  contacts: Contact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  onSendMessage: (text: string, sender: 'me' | 'them') => void;
  onSelectMessageForAnalysis: (msg: Message) => void;
  selectedMessageId: string | null;
  isNuanceActive: boolean;
  copiedSuggestion: string | null;
  onOpenVoiceTab: () => void;
  onOpenMultimodalTab: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  suggestedReplies?: SuggestedReply[];
  onToggleSidePanel: () => void;
  isSidePanelOpen: boolean;
  onAddNewContact: (name: string) => void;
  onClearCurrentChat: () => void;
}

export const WhatsAppInterface: React.FC<WhatsAppInterfaceProps> = ({
  contacts,
  activeContactId,
  onSelectContact,
  onSendMessage,
  onSelectMessageForAnalysis,
  selectedMessageId,
  isNuanceActive,
  copiedSuggestion,
  onOpenVoiceTab,
  onOpenMultimodalTab,
  onStartCall,
  suggestedReplies = [],
  onToggleSidePanel,
  isSidePanelOpen,
  onAddNewContact,
  onClearCurrentChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [sendAs, setSendAs] = useState<'me' | 'them'>('them');
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'unread') return Boolean(c.unreadCount && c.unreadCount > 0);
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), sendAs);
    setInputText('');
  };

  const handleQuickReplyClick = (replyText: string) => {
    setInputText(replyText);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    onAddNewContact(newContactName.trim());
    setNewContactName('');
    setIsNewContactModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] overflow-hidden select-none">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Authentic WhatsApp Web */}
        <div className="w-80 md:w-96 flex flex-col border-r border-[#e9edef] bg-white h-full">
          {/* Authentic WhatsApp Top Bar */}
          <div className="h-14 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef]">
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer border border-slate-200"
              />
            </div>

            <div className="flex items-center space-x-3.5 text-[#54656f]">
              <button
                type="button"
                onClick={() => setIsNewContactModalOpen(true)}
                title="New Chat"
                className="p-1.5 rounded-full hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
              >
                <Plus className="w-5 h-5 text-[#00a884]" />
              </button>
              <button title="Communities" className="hover:text-slate-800 transition cursor-pointer">
                <Users className="w-5 h-5" />
              </button>
              <button title="Status" className="hover:text-slate-800 transition cursor-pointer">
                <CircleDot className="w-5 h-5" />
              </button>
              <button title="Channels" className="hover:text-slate-800 transition cursor-pointer">
                <Radio className="w-5 h-5" />
              </button>
              <button title="Menu" className="hover:text-slate-800 transition cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar & Filter Pills */}
          <div className="p-2 border-b border-[#f0f2f5] space-y-2">
            <div className="flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-[#54656f] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none text-[#111b21]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 px-1 overflow-x-auto scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'favorites', label: 'Favourites' },
                { id: 'groups', label: 'Groups' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-[#00a884] text-white font-semibold'
                      : 'bg-[#f0f2f5] text-[#54656f] hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f5f6f6]">
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === activeContactId;

              return (
                <div
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  className={`flex items-center px-3.5 py-3 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6] bg-white'
                  }`}
                >
                  <div className="relative shrink-0 mr-3">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {contact.onlineStatus === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-[#111b21] truncate">
                        {contact.name}
                      </span>
                      <span className="text-[11px] text-[#667781] shrink-0">
                        {contact.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#667781] truncate mr-2">
                        {contact.subtitle || 'Tap to chat'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] whatsapp-bg relative">
          {/* Chat Top Header */}
          <div className="h-14 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0 z-10">
            <div className="flex items-center space-x-3">
              <img
                src={activeContact?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                alt={activeContact?.name || 'Contact'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-[#111b21]">
                  {activeContact?.name || 'Contact'}
                </div>
                <div className="text-xs text-[#00a884] font-medium">
                  {activeContact?.onlineStatus || 'online'}
                </div>
              </div>
            </div>

            {/* Chat action buttons */}
            <div className="flex items-center space-x-2 text-[#54656f]">
              <button
                type="button"
                onClick={() => onStartCall('video')}
                className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                title="Start Video Call"
              >
                <Video className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => onStartCall('voice')}
                className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onToggleSidePanel}
                className={`p-2 rounded-full transition cursor-pointer ${
                  isSidePanelOpen
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-slate-200 text-[#54656f] hover:text-purple-700'
                }`}
                title="Toggle NUANCE Extension Side Panel"
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClearCurrentChat}
                className="p-2 rounded-full hover:bg-slate-200 hover:text-rose-600 transition cursor-pointer"
                title="Clear messages in this chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {activeContact?.messages && activeContact.messages.length > 0 ? (
              activeContact.messages.map((message) => {
                const isMe = message.sender === 'me';
                const isSelected = selectedMessageId === message.id;
                const isHighRisk = message.safetyRisk === 'HIGH';

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                  >
                    {/* Safety Alert if detected */}
                    {!isMe && isHighRisk && isNuanceActive && (
                      <div className="mb-1 max-w-[85%] md:max-w-[70%] bg-rose-600 text-white rounded-lg p-2.5 text-xs flex items-center space-x-2 shadow-md">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                        <div className="font-semibold text-[11px]">
                          ⚠️ Security Alert: High risk request detected. Do not share sensitive codes!
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      onClick={() => isNuanceActive && onSelectMessageForAnalysis(message)}
                      className={`relative max-w-[85%] md:max-w-[70%] rounded-lg p-2.5 text-sm shadow-2xs transition-all cursor-pointer ${
                        isMe
                          ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                          : isHighRisk && isNuanceActive
                          ? 'bg-rose-50 text-rose-950 border border-rose-300 rounded-tl-none'
                          : 'bg-white text-[#111b21] rounded-tl-none'
                      } ${
                        isSelected && isNuanceActive
                          ? 'ring-2 ring-purple-600 ring-offset-1'
                          : ''
                      }`}
                    >
                      {/* Text Message */}
                      <div>
                        {!isMe && (
                          <div className="text-[11px] font-bold text-[#00a884] mb-0.5">
                            {message.senderName}
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>

                      {/* Timestamp & checks */}
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-[#667781]">
                        <span>{message.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Clean WhatsApp Empty Chat State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                <div className="w-16 h-16 rounded-full bg-[#00a884]/10 text-[#00a884] flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    Chat with {activeContact?.name || 'Contact'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Messages are end-to-end encrypted. Type any message below to chat with real-time NUANCE intelligence.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Smart Quick Reply Pills right above input */}
          {isNuanceActive && suggestedReplies && suggestedReplies.length > 0 && (
            <div className="bg-slate-50/95 border-t border-purple-200/80 px-3 py-1.5 flex items-center space-x-2 overflow-x-auto scrollbar-none shadow-xs">
              <span className="text-[10px] font-bold text-purple-700 flex items-center space-x-1 shrink-0 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Smart Replies:</span>
              </span>

              {suggestedReplies.slice(0, 3).map((sr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickReplyClick(sr.reply)}
                  className="bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200 hover:border-purple-300 text-xs px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer shadow-2xs font-medium flex items-center space-x-1"
                >
                  <span className="text-[9px] font-bold uppercase text-purple-600 mr-0.5">
                    {sr.tone}:
                  </span>
                  <span>{sr.reply}</span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Composer */}
          <div className="bg-[#f0f2f5] px-4 py-2.5 flex items-center space-x-2 border-t border-[#e9edef] shrink-0">
            {/* Sender toggle so user can type what they receive or what they send */}
            <div className="flex items-center bg-slate-200 rounded-lg p-0.5 text-[10px] font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setSendAs('them')}
                className={`px-2 py-1 rounded cursor-pointer transition ${
                  sendAs === 'them' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600'
                }`}
                title="Send as incoming message to test NUANCE analysis"
              >
                Incoming
              </button>
              <button
                type="button"
                onClick={() => setSendAs('me')}
                className={`px-2 py-1 rounded cursor-pointer transition ${
                  sendAs === 'me' ? 'bg-[#00a884] text-white shadow-2xs font-bold' : 'text-slate-600'
                }`}
                title="Send as your message"
              >
                Me
              </button>
            </div>

            <button
              type="button"
              className="p-1.5 text-[#54656f] hover:text-[#111b21] rounded-full hover:bg-slate-200 cursor-pointer"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenMultimodalTab}
              title="Upload image or screenshot"
              className="p-1.5 text-[#54656f] hover:text-purple-700 rounded-full hover:bg-slate-200 cursor-pointer transition"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <form onSubmit={handleSend} className="flex-1 flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={
                    sendAs === 'them'
                      ? 'Type incoming message to analyze with NUANCE...'
                      : 'Type your message...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-white text-[#111b21] text-sm px-4 py-2 rounded-lg border border-transparent focus:border-[#00a884] focus:outline-none placeholder:text-[#8696a0] shadow-2xs"
                />
              </div>

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full transition shadow-2xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenVoiceTab}
                  title="Voice Note"
                  className="p-2 text-[#54656f] hover:text-[#111b21] rounded-full hover:bg-slate-200 cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* New Contact Creator Modal */}
      {isNewContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateContact}
            className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200"
          >
            <h3 className="text-sm font-bold text-slate-800">Start New Chat</h3>
            <input
              type="text"
              placeholder="Contact name or phone number..."
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              autoFocus
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00a884]"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewContactModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-3.5 py-1.5 rounded-lg bg-[#00a884] text-white font-semibold hover:bg-[#008f6f] cursor-pointer"
              >
                Create Chat
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
