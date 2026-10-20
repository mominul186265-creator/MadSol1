import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { processAiQuery, AiLiveDataContext } from './services/aiEngine';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AiAssistantView: React.FC = () => {
  const { user, institution } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addChatMessage,
    clearConversation,
    deleteConversation,
    studentInsights,
    performanceAlerts
  } = usePart7System();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    showToast(language === 'bn' ? 'কপি সম্পন্ন হয়েছে।' : 'Copied to clipboard.', 'success');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || !user || !institution) return;

    let convId = activeConversationId;
    if (!convId || !conversations.some((c) => c.id === convId)) {
      convId = createConversation(query.slice(0, 30) + '...');
    }

    // Add user message
    addChatMessage(convId, 'user', query);
    if (!queryToSend) setInputQuery('');
    setIsTyping(true);

    // Build real live data context from active institution
    const liveContext: AiLiveDataContext = {
      institutionId: institution.id,
      institutionName: language === 'bn' ? institution.nameBn : institution.nameEn,
      userRole: user.role,
      students: {
        total: 310,
        presentToday: 292,
        absentToday: 18,
        attendanceRate: 94.2,
        dueTotal: 128500,
        studentsWithDue: 38,
        hifzStudents: 58,
        topPerformers: ['মুহাম্মদ আব্দুল্লাহ', 'উমায়ের আহমাদ'],
        criticalStudents: ['জুবায়ের বিন খালিদ', 'আহমাদ সালমান']
      },
      finance: {
        thisMonthIncome: 345000,
        thisMonthExpense: 288200,
        netBalance: 56800,
        totalDue: 128500,
        donationMonth: 82000,
        chandaMonth: 48000
      },
      hifz: {
        totalEnrolled: 58,
        averageSabakScore: 91,
        averageRevisionScore: 76,
        laggingStudents: ['আহমাদ সালমান'],
        topHifzStudents: ['মুহাম্মদ আব্দুল্লাহ']
      },
      exams: {
        overallAverage: 82.5,
        passPercentage: 94.8,
        topClass: 'হিফজুল কুরআন (গ্রুপ-ক)'
      }
    };

    // Realistic processing latency
    setTimeout(() => {
      const result = processAiQuery(query, user.role, institution.id, liveContext, language);
      addChatMessage(convId!, 'assistant', result.replyText, result.suggestedFollowUps);
      setIsTyping(false);
    }, 700);
  };

  const suggestedQuestionsBn = [
    'আজ কতজন শিক্ষার্থী অনুপস্থিত?',
    'এই মাসে মোট বকেয়া কত?',
    'কোন শিক্ষার্থীর হিফজ অগ্রগতি কম?',
    'আজকের আয় ও ব্যয়ের হিসাব দেখাও।',
    'কোন ক্লাসে উপস্থিতি সবচেয়ে কম?',
    'এই মাসের চাঁদা সংগ্রহ কত?'
  ];

  const suggestedQuestionsEn = [
    'How many students are absent today?',
    'What is the total fee due this month?',
    'Which student has lagging Hifz progress?',
    'Show today income and expense summary.',
    'Which class has the lowest attendance?',
    'What is the monthly Chanda collection?'
  ];

  const questions = language === 'bn' ? suggestedQuestionsBn : suggestedQuestionsEn;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner & Multi-Institution Security Scope */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold">
                {language === 'bn' ? 'MadSol AI স্মার্ট সহকারী' : 'MadSol AI Smart Assistant'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                PRO AI
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {language === 'bn'
                ? 'অনুমোদিত প্রাতিষ্ঠানিক তথ্যের ভিত্তিতে বুদ্ধিমত্তাভিত্তিক বিশ্লেষণ ও তথ্য সেবা'
                : 'Intelligent multi-scoped database analytics and institutional assistant'}
            </p>
          </div>
        </div>

        {/* Security & Role Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/15">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="truncate max-w-[160px]">
              {language === 'bn' ? institution?.nameBn : institution?.nameEn}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Role: {user?.role}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* Left Sidebar: Conversations & History */}
        <div className="hidden lg:flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'bn' ? 'আলোচনার ইতিহাস' : 'Chat History'}
            </span>
            <button
              onClick={() => createConversation()}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন' : 'New'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-1.5">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {language === 'bn' ? 'কোনো পূর্ববর্তী আলোচনা নেই' : 'No previous conversations'}
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConversation?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`group relative p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{c.title || (language === 'bn' ? 'নতুন আলোচনা' : 'New Chat')}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.updatedAt}</span>
                    </div>
                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 transition-opacity"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Info Box */}
          <div className="mt-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {language === 'bn'
                ? 'মাল্টি-ইনস্টিটিউশন সিকিউর প্রোটোকল: অন্য প্রতিষ্ঠানের কোনো ডাটা অ্যাক্সেসযোগ্য নয়।'
                : 'Institution Scoped: Queries strictly restricted to authorized local records.'}
            </span>
          </div>
        </div>

        {/* Right Section: Active Chat Interface */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {activeConversation?.title || (language === 'bn' ? 'সরাসরি এআই অনুসন্ধান' : 'Direct AI Query')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeConversation) clearConversation(activeConversation.id);
                  showToast(language === 'bn' ? 'চ্যাট মুছে ফেলা হয়েছে।' : 'Chat cleared.', 'info');
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'চ্যাট পরিষ্কার' : 'Clear Chat'}
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(!activeConversation || activeConversation.messages.length === 0) && (
              <div className="py-8 px-4 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {language === 'bn'
                      ? 'MadSol AI-কে একটি প্রশ্ন করুন।'
                      : 'Ask MadSol AI anything about your institution.'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'bn'
                      ? 'হাজিরা, বকেয়া বেতন, হিফজ সবক, আয়-ব্যয় বা সাধারণ ছাত্র তথ্য জানতে নিচের প্রশ্নগুলোতে ক্লিক করুন।'
                      : 'Ask regarding student attendance, fee dues, Hifz progress, ledger balances or custom reports.'}
                  </p>
                </div>

                {/* Suggested Questions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 group transition-all text-left cursor-pointer"
                    >
                      <span className="line-clamp-2">{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render conversation messages */}
            {activeConversation?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gradient-to-br from-amber-400 to-emerald-600 text-white shadow-xs'
                    }`}
                  >
                    {isUser ? user?.fullNameBn.charAt(0) || 'U' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-2xl space-y-1.5 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                        isUser
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/60'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Follow-up Question Suggestions */}
                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((fu, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendQuery(fu)}
                            className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            💡 {fu}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-tl-xs flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1">
                    {language === 'bn' ? 'ডাটাবেস বিশ্লেষণ হচ্ছে...' : 'Analyzing institutional records...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="ai-assistant-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'মাদ্রাসার যে কোনো বিষয়ে AI-কে প্রশ্ন করুন (যেমন: আজকের অনুপস্থিতি বা বকেয়া)...'
                    : 'Ask anything about attendance, fees, Hifz, income/expense...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <Button
                id="ai-send-btn"
                type="submit"
                variant="primary"
                disabled={!inputQuery.trim() || isTyping}
                className="px-4 py-2.5 shrink-0 flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
