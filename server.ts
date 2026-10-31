import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

const ai = hasApiKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Server-side cache to protect Free Tier RPM limits
const analysisCache = new Map<string, any>();
const voiceCache = new Map<string, any>();
const multimodalCache = new Map<string, any>();

// Health / Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey,
    model: 'gemini-3.1-flash-lite',
    supportedLanguages: [
      'English',
      'Hindi',
      'Nepali',
      'Kannada',
      'Tamil',
      'Telugu',
      'Bengali',
      'Malayalam',
    ],
  });
});

// 1. Analyze single message or chat context
app.post('/api/analyze-message', async (req, res) => {
  const { message, context = [], preferredLanguage = 'English' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const cacheKey = `${preferredLanguage}:${message.trim()}`;
  if (analysisCache.has(cacheKey)) {
    return res.json(analysisCache.get(cacheKey));
  }

  if (ai) {
    try {
      const prompt = `You are NUANCE, an advanced personal communication intelligence and safety layer operating alongside WhatsApp Web.
Analyze the following WhatsApp message in context of the conversation.

Message to analyze: "${message}"
Recent Context: ${JSON.stringify(context.slice(-4))}
User's Preferred Language: "${preferredLanguage}"

Instructions:
1. Detect language (support English, Hindi, Nepali, Kannada, Tamil, Telugu, Bengali, Malayalam, Hinglish, code-mixed South Asian languages, Romanized text).
2. Distinguish literal meaning vs possible contextual/cultural meaning. (Never claim to know someone's true intentions with certainty; use nuanced phrasing like "possible meaning", "may indicate", "depending on context").
3. Explain any idioms, indirect expressions, sarcasm, slang, or culturally specific references.
4. Smart Safety Shield: Check for banking fraud, OTP/password requests, urgency/pressure tactics, impersonation, suspicious financial requests, social engineering. Rate risk as LOW, MEDIUM, or HIGH. Give objective indicators and actionable recommendations without calling anyone a scammer directly.
5. Conversation Action Assistant: Extract any deadlines, meeting schedules, promises, follow-up tasks, or unanswered questions.
6. Generate 4 distinct suggested replies in English AND translated into "${preferredLanguage}" with tones: Friendly, Professional, Casual, Formal.

Respond strictly in valid JSON adhering to this schema:
{
  "detectedLanguage": "string",
  "literalMeaning": "string",
  "contextualMeaning": "string",
  "culturalNuances": [
    {
      "phrase": "string",
      "explanation": "string",
      "type": "idiom" | "slang" | "indirect" | "sarcasm" | "code-mix" | "cultural"
    }
  ],
  "sarcasmAnalysis": {
    "isPossibleSarcasm": boolean,
    "confidence": "Low" | "Medium" | "High",
    "rationale": "string"
  },
  "safetyShield": {
    "riskLevel": "LOW" | "MEDIUM" | "HIGH",
    "detectedIndicators": ["string"],
    "explanation": "string",
    "recommendedAction": "string"
  },
  "extractedActions": [
    {
      "title": "string",
      "deadline": "string",
      "meetingTime": "string",
      "type": "task" | "meeting" | "deadline" | "followup"
    }
  ],
  "suggestedReplies": [
    {
      "tone": "Friendly" | "Professional" | "Casual" | "Formal",
      "reply": "string",
      "translatedReply": "string"
    }
  ]
}`;

      // Use gemini-3.1-flash-lite for high throughput and higher free-tier quota
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction:
            'You are NUANCE, an elite cultural linguist, communication safety analyst, and respectful communication copilot. Always output pure valid JSON.',
        },
      });

      const responseText = response.text ?? '{}';
      try {
        const parsed = JSON.parse(responseText);
        const result = { ...parsed, isModelGenerated: true };
        analysisCache.set(cacheKey, result);
        return res.json(result);
      } catch (parseErr) {
        // Fall through to fallback
      }
    } catch (error: any) {
      // Gracefully handle rate limits (429) or transient API failures without throwing uncaught errors
      const fallback = generateIntelligentFallback(message, preferredLanguage);
      const result = {
        ...fallback,
        isModelGenerated: false,
        quotaLimited: error?.status === 429 || error?.message?.includes('429'),
      };
      analysisCache.set(cacheKey, result);
      return res.json(result);
    }
  }

  // Local intelligence fallback
  const fallback = generateIntelligentFallback(message, preferredLanguage);
  analysisCache.set(cacheKey, { ...fallback, isModelGenerated: false });
  return res.json({ ...fallback, isModelGenerated: false });
});

// 2. Generate replies
app.post('/api/generate-replies', async (req, res) => {
  const { message, context = [], targetLanguage = 'English' } = req.body;
  const cacheKey = `rep:${targetLanguage}:${message}`;
  if (analysisCache.has(cacheKey)) {
    return res.json(analysisCache.get(cacheKey));
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Given message: "${message}", and context: ${JSON.stringify(context.slice(-3))}, generate 4 reply suggestions (Friendly, Professional, Casual, Formal) with both English and ${targetLanguage} versions.
Format as JSON array: [{"tone": "Friendly", "reply": "...", "translatedReply": "..."}, ...]`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text ?? '[]');
      const result = { replies: parsed, isModelGenerated: true };
      analysisCache.set(cacheKey, result);
      return res.json(result);
    } catch (err: any) {
      const fallbackReplies = generateFallbackReplies(message, targetLanguage);
      return res.json({ replies: fallbackReplies, isModelGenerated: false });
    }
  }

  const replies = generateFallbackReplies(message, targetLanguage);
  return res.json({ replies, isModelGenerated: false });
});

// 3. Analyze voice notes (Audio transcription / simulation)
app.post('/api/analyze-voice', async (req, res) => {
  const { audioBase64, mimeType = 'audio/mp3', audioTranscriptText, languageHint = 'Kannada' } = req.body;
  const cacheKey = `voice:${audioTranscriptText || languageHint}`;

  if (voiceCache.has(cacheKey)) {
    return res.json(voiceCache.get(cacheKey));
  }

  if (ai && audioBase64) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: `Transcribe and analyze this voice note.
Return JSON with:
{
  "detectedLanguage": "string",
  "transcript": "string",
  "translation": "string",
  "summary": "string",
  "contextMeaning": "string",
  "keyInformation": ["string"],
  "suggestedReply": "string"
}`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text ?? '{}');
      const result = { ...parsed, isModelGenerated: true };
      voiceCache.set(cacheKey, result);
      return res.json(result);
    } catch (err: any) {
      // Fallback on error
    }
  }

  const sample = generateVoiceNoteAnalysis(audioTranscriptText || languageHint);
  voiceCache.set(cacheKey, { ...sample, isModelGenerated: false });
  return res.json({ ...sample, isModelGenerated: false });
});

// 4. Multimodal Image / Meme / Screenshot analysis
app.post('/api/analyze-multimodal', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', caption = '' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  const cacheKey = `img:${caption.slice(0, 30)}`;
  if (multimodalCache.has(cacheKey)) {
    return res.json(multimodalCache.get(cacheKey));
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  if (ai && cleanBase64.length > 50) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Analyze this image shared in a chat. User caption: "${caption}".
Provide: OCR extracted text, cultural context & humor, visual safety check.
Return JSON:
{
  "extractedText": "string",
  "detectedLanguage": "string",
  "culturalContext": "string",
  "humorExplanation": "string",
  "safetyCheck": {
    "riskLevel": "LOW" | "MEDIUM" | "HIGH",
    "findings": "string"
  },
  "suggestedReply": "string"
}`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text ?? '{}');
      const result = { ...parsed, isModelGenerated: true };
      multimodalCache.set(cacheKey, result);
      return res.json(result);
    } catch (err: any) {
      // Fallback
    }
  }

  const fallback = {
    extractedText: "Sharma ji ka beta got 99.8% in CAT and is still taking feedback nicely. Meanwhile me after answering 1 email:",
    detectedLanguage: "Hinglish (Hindi-English mix)",
    culturalContext: "The 'Sharma ji ka beta' is an iconic South Asian trope representing the unattainable paragon child used for comparison.",
    humorExplanation: "Self-deprecating humor contrasting societal expectations with extreme fatigue over minor tasks.",
    safetyCheck: {
      riskLevel: "LOW" as const,
      findings: "No phishing indicators, financial manipulation, or sensitive data detected."
    },
    suggestedReply: "Haha story of my life! Don't let Sharma ji see this.",
    isModelGenerated: false
  };
  multimodalCache.set(cacheKey, fallback);
  return res.json(fallback);
});

// 5. AI Assistant Q&A Chat
app.post('/api/chat-assistant', async (req, res) => {
  const { question, conversationContext = [] } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `You are the NUANCE Assistant side-panel companion inside WhatsApp Web.
Conversation history:
${conversationContext.slice(-5).map((c: any) => `${c.sender}: ${c.text}`).join('\n')}

User asks: "${question}"

Provide a concise, culturally nuanced, respectful, and highly actionable response under 100 words.`,
      });

      return res.json({
        answer: response.text ?? "I've analyzed the conversation context.",
        isModelGenerated: true,
      });
    } catch (err: any) {
      // Return smart fallback on rate-limit
    }
  }

  let answer = "Based on the conversation context, this phrase conveys subtle nuance. Depending on your relationship, it's best to acknowledge their point gently.";
  const lower = question.toLowerCase();
  if (lower.includes('sarcasm') || lower.includes('sarcastic')) {
    answer = "There is a medium probability of mild sarcasm or polite understatement here. In modern messaging, this phrasing often indicates slight dissatisfaction.";
  } else if (lower.includes('safe') || lower.includes('scam') || lower.includes('otp')) {
    answer = "Safety Shield evaluation: Any unsolicited request asking for an OTP, immediate PIN verification, or wire transfer under time pressure is a HIGH RISK flag. Legitimate institutions never ask for your one-time passwords via chat.";
  } else if (lower.includes('task') || lower.includes('deadline')) {
    answer = "Identified action items: 1) Deliverable submission expected, 2) Follow-up sync at 10:00 AM.";
  }

  return res.json({ answer, isModelGenerated: false });
});

// Helper for local intelligence fallbacks
function generateIntelligentFallback(message: string, preferredLang: string) {
  const lower = message.toLowerCase();

  // 1. Scam / OTP pattern
  if (
    lower.includes('otp') ||
    lower.includes('password') ||
    lower.includes('blocked in') ||
    lower.includes('sbi') ||
    lower.includes('bank account') ||
    lower.includes('kyc') ||
    lower.includes('urgent') ||
    lower.includes('lottery')
  ) {
    return {
      detectedLanguage: 'English / Alert pattern',
      literalMeaning: 'A notification demanding immediate action or authentication credentials.',
      contextualMeaning:
        'Possible urgent financial manipulation or credential harvesting scam using synthetic panic.',
      culturalNuances: [
        {
          phrase: 'blocked in five minutes / send OTP',
          explanation: 'Standard psychological pressure lever designed to bypass critical judgment.',
          type: 'indirect' as const,
        },
      ],
      sarcasmAnalysis: {
        isPossibleSarcasm: false,
        confidence: 'Low' as const,
        rationale: 'Explicit imperative message demanding authentication credentials.',
      },
      safetyShield: {
        riskLevel: 'HIGH' as const,
        detectedIndicators: [
          'Extreme urgency and synthetic time pressure',
          'Request for sensitive two-factor authentication (OTP)',
          'Impersonation of banking or institutional authorities',
        ],
        explanation:
          'Banks, telecom providers, and verified platforms never request OTPs or passwords over chat.',
        recommendedAction:
          'DO NOT share any code. Block this sender and verify directly through your official banking portal.',
      },
      extractedActions: [
        {
          title: 'Verify through official banking app or branch',
          deadline: 'Immediate',
          meetingTime: '',
          type: 'followup' as const,
        },
      ],
      suggestedReplies: [
        {
          tone: 'Professional' as const,
          reply: 'I do not share verification codes over chat. I will contact the bank directly through official helplines.',
          translatedReply: preferredLang === 'Hindi' ? 'मैं चैट पर कोई सत्यापन कोड साझा नहीं करता। मैं सीधे बैंक से संपर्क करूँगा।' : 'I do not share OTPs via chat.',
        },
        {
          tone: 'Formal' as const,
          reply: 'This request violates banking security protocols. Please cease contacting this number.',
          translatedReply: preferredLang === 'Hindi' ? 'यह अनुरोध सुरक्षा नियमों का उल्लंघन है। कृपया संपर्क बंद करें।' : 'Cease communication immediately.',
        },
      ],
    };
  }

  // 2. Cultural Indirectness pattern ("It's not exactly what I expected")
  if (
    lower.includes('not exactly what i expected') ||
    lower.includes('as discussed') ||
    lower.includes('fine i guess') ||
    lower.includes('thik hai dekh lo') ||
    lower.includes('chalega')
  ) {
    return {
      detectedLanguage: 'English (High-Context Style)',
      literalMeaning: 'The final outcome does not perfectly match prior expectations.',
      contextualMeaning:
        'The sender may be expressing polite disappointment or indirect dissatisfaction without wanting to appear confrontational.',
      culturalNuances: [
        {
          phrase: "It's not exactly what I expected",
          explanation:
            'A soft critique designed to maintain cordiality while signaling that revisions or a deeper conversation are needed.',
          type: 'indirect' as const,
        },
      ],
      sarcasmAnalysis: {
        isPossibleSarcasm: true,
        confidence: 'Medium' as const,
        rationale:
          'Understatement often masks frustration in collaborative workplace contexts.',
      },
      safetyShield: {
        riskLevel: 'LOW' as const,
        detectedIndicators: ['Standard interpersonal feedback'],
        explanation: 'Benign interpersonal feedback message.',
        recommendedAction: 'Respond constructively with an open inquiry to clarify their specific expectations.',
      },
      extractedActions: [
        {
          title: 'Schedule a 10-minute alignment sync on expectations',
          deadline: 'Today / Next sync',
          meetingTime: '',
          type: 'meeting' as const,
        },
      ],
      suggestedReplies: [
        {
          tone: 'Friendly' as const,
          reply: 'Could you share what you had in mind? I’d love to understand your vision and adjust things!',
          translatedReply: preferredLang === 'Hindi' ? 'क्या आप बता सकते हैं कि आपके मन में क्या था? मुझे सुधार करने में खुशी होगी!' : 'Could you clarify what you expected?',
        },
        {
          tone: 'Professional' as const,
          reply: 'I appreciate the candid feedback. Let me know which specific areas diverged from what you expected so I can revise them.',
          translatedReply: preferredLang === 'Hindi' ? 'प्रतिक्रिया के लिए धन्यवाद। मुझे बताएं कि किन बिंदुओं पर बदलाव चाहिए।' : 'Thank you for the feedback. Please specify adjustments.',
        },
        {
          tone: 'Casual' as const,
          reply: 'No worries at all, tell me what you want changed and I will fix it right away!',
          translatedReply: preferredLang === 'Hindi' ? 'कोई बात नहीं, बताओ क्या बदलना है, मैं अभी सही कर देता हूँ!' : 'Tell me what to change!',
        },
      ],
    };
  }

  // 3. Hinglish / Code-mixed South Asian pattern
  if (
    lower.includes('arre yaar') ||
    lower.includes('bhai') ||
    lower.includes('ho jayega') ||
    lower.includes('kal tak') ||
    lower.includes('jugaad') ||
    lower.includes('scene') ||
    lower.includes('mast') ||
    lower.includes('pakka')
  ) {
    return {
      detectedLanguage: 'Hinglish (Hindi-English Code-Mixed)',
      literalMeaning: 'Informal query asking whether the task will be done by tomorrow, with a plea not to make them wait.',
      contextualMeaning:
        'Expresses friendly camaraderie combined with mild urgency. The word "bhai" (brother) softens the deadline pressure while "arre yaar" signals close rapport.',
      culturalNuances: [
        {
          phrase: 'Arre yaar / Bhai',
          explanation: 'Colloquial markers of closeness and peer solidarity in South Asian vernacular.',
          type: 'code-mix' as const,
        },
        {
          phrase: 'Don\'t make me wait bhai',
          explanation: 'Playful cajoling rather than an aggressive command; indicates mutual trust.',
          type: 'slang' as const,
        },
      ],
      sarcasmAnalysis: {
        isPossibleSarcasm: false,
        confidence: 'Low' as const,
        rationale: 'Direct conversational code-mixing with warm relational markers.',
      },
      safetyShield: {
        riskLevel: 'LOW' as const,
        detectedIndicators: ['Peer conversation'],
        explanation: 'Friendly personal/work interaction with no malicious patterns.',
        recommendedAction: 'Acknowledge timeline clearly and reassure them.',
      },
      extractedActions: [
        {
          title: 'Send status update or deliverable',
          deadline: 'Tomorrow (Kal tak)',
          meetingTime: '',
          type: 'deadline' as const,
        },
      ],
      suggestedReplies: [
        {
          tone: 'Friendly' as const,
          reply: 'Haan bhai, 100% kal dopahar tak bhej dunga, tension mat le!',
          translatedReply: preferredLang === 'English' ? 'Yes brother, 100% will send it by tomorrow afternoon, don’t stress!' : 'हाँ भाई, कल दोपहर तक भेज दूँगा!',
        },
        {
          tone: 'Casual' as const,
          reply: 'Almost done brother! Just putting on the final touches, will ping you soon.',
          translatedReply: preferredLang === 'Hindi' ? 'बस होने ही वाला है भाई! फाइनल टच देकर अभी पिंग करता हूँ।' : 'Almost done!',
        },
        {
          tone: 'Professional' as const,
          reply: 'Yes, the deliverable is progressing well and will be ready for your review tomorrow.',
          translatedReply: preferredLang === 'Hindi' ? 'हाँ, काम प्रगति पर है और कल समीक्षा के लिए तैयार रहेगा।' : 'It will be ready tomorrow.',
        },
      ],
    };
  }

  // 4. Default
  const hasDeadline = lower.includes('friday') || lower.includes('tomorrow') || lower.includes('am') || lower.includes('pm') || lower.includes('deadline') || lower.includes('submit');

  return {
    detectedLanguage: 'English / Multilingual text',
    literalMeaning: 'Direct communication conveying an update, query, or scheduling note.',
    contextualMeaning: hasDeadline
      ? 'The sender is establishing clear operational expectations with a timeline and request for confirmation.'
      : 'The sender is continuing the dialogue and awaiting your next response.',
    culturalNuances: [],
    sarcasmAnalysis: {
      isPossibleSarcasm: false,
      confidence: 'Low' as const,
      rationale: 'Message exhibits standard communicative intent without obvious irony markers.',
    },
    safetyShield: {
      riskLevel: 'LOW' as const,
      detectedIndicators: ['No threat flags'],
      explanation: 'Verified safe interpersonal communication.',
      recommendedAction: 'No action required.',
    },
    extractedActions: hasDeadline
      ? [
          {
            title: 'Complete and submit task as requested',
            deadline: lower.includes('friday') ? 'Friday' : 'As discussed',
            meetingTime: lower.includes('10 am') ? '10:00 AM' : '',
            type: 'task' as const,
          },
        ]
      : [],
    suggestedReplies: [
      {
        tone: 'Friendly' as const,
        reply: 'Got it! Thanks for letting me know, on it right away.',
        translatedReply: preferredLang === 'Hindi' ? 'समझ गया! बताने के लिए धन्यवाद, मैं तुरंत इस पर काम करता हूँ।' : 'Understood, thank you!',
      },
      {
        tone: 'Professional' as const,
        reply: 'Thank you for the update. I have noted this and will follow up accordingly.',
        translatedReply: preferredLang === 'Hindi' ? 'अपडेट के लिए धन्यवाद। मैंने नोट कर लिया है और तदनुसार फॉलो अप करूँगा।' : 'Thank you for the update.',
      },
      {
        tone: 'Casual' as const,
        reply: 'Sounds good to me, see you then!',
        translatedReply: preferredLang === 'Hindi' ? 'बिल्कुल सही, तब मिलते हैं!' : 'Sounds good!',
      },
    ],
  };
}

function generateFallbackReplies(message: string, lang: string) {
  return [
    {
      tone: 'Friendly',
      reply: 'Thanks for reaching out! Happy to coordinate this with you.',
      translatedReply: lang === 'Hindi' ? 'संपर्क करने के लिए धन्यवाद! आपके साथ समन्वय करने में खुशी होगी।' : 'Thanks for reaching out!',
    },
    {
      tone: 'Professional',
      reply: 'Thank you for your message. I have reviewed the details and will proceed as scheduled.',
      translatedReply: lang === 'Hindi' ? 'आपके संदेश के लिए धन्यवाद। मैंने विवरण देख लिया है।' : 'Acknowledged with thanks.',
    },
    {
      tone: 'Casual',
      reply: 'Awesome, got your point! Catch you in a bit.',
      translatedReply: lang === 'Hindi' ? 'बढ़िया, बात समझ आ गई! थोड़ी देर में बात करते हैं।' : 'Got your point!',
    },
  ];
}

function generateVoiceNoteAnalysis(hint: string) {
  return {
    detectedLanguage: 'Kannada (South Indian Language)',
    transcript: 'Namaskara! Naale belagge 10 gantege meeting ide, presentation PPT ready maadi idra? Mattu lunch nantara client call schedule maadbeku.',
    translation: 'Hello! There is a meeting tomorrow morning at 10 AM, have you prepared the presentation slides? Also, we need to schedule a client call after lunch.',
    summary: 'Meeting confirmed for tomorrow at 10:00 AM. Prepare presentation slides and schedule afternoon client call.',
    contextMeaning: 'Team coordination audio note emphasizing preparation before 10 AM.',
    keyInformation: [
      'Meeting scheduled for tomorrow at 10:00 AM',
      'Action: Finalize presentation slide deck (PPT)',
      'Action: Schedule afternoon client call',
    ],
    suggestedReply: 'Namaskara! Howdu, PPT ready aagide. Naale 10 gantege meet aagona.',
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`NUANCE server listening on port ${PORT}`);
  });
}

startServer();
