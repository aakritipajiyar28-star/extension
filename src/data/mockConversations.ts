import { Contact, InsightStats } from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'Contact',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    subtitle: 'No messages yet',
    lastMessageTime: '',
    unreadCount: 0,
    onlineStatus: 'online',
    messages: [],
  },
];

export const INITIAL_STATS: InsightStats = {
  messagesAnalysed: 0,
  translationsPerformed: 0,
  safetyAlertsPrevented: 0,
  tasksExtracted: 0,
  topLanguages: [],
  unfamiliarExpressions: [],
};
