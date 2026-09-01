import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  PhoneCall, 
  Paperclip, 
  Image as ImageIcon, 
  Mic, 
  Play, 
  Pause, 
  CheckCheck, 
  Scissors, 
  Ruler, 
  ShieldCheck, 
  UserCheck,
  Bot
} from 'lucide-react';
import { MasterTailor, ChatMessage, CustomTailoringOption } from '../types';
import { MASTER_TAILORS, QUICK_CONSULTATION_PROMPTS } from '../data/tailors';

interface MasterTailorChatProps {
  initialTailorName?: string;
  initialContext?: string;
  onApplyCustomConfig?: (config: CustomTailoringOption) => void;
}

export const MasterTailorChat: React.FC<MasterTailorChatProps> = ({
  initialTailorName,
  initialContext,
  onApplyCustomConfig,
}) => {
  const [selectedTailor, setSelectedTailor] = useState<MasterTailor>(
    MASTER_TAILORS.find((t) => t.name.toLowerCase().includes(initialTailorName?.toLowerCase() || '')) ||
      MASTER_TAILORS[0]
  );

  const [inputMessage, setInputMessage] = useState(initialContext || '');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat message state keyed by tailor id
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'tailor',
      tailorId: selectedTailor.id,
      text: `Greetings! I am ${selectedTailor.name}. How may I advise you on fabric selection, bespoke tailoring dimensions, or crafting your next statement piece today?`,
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    if (initialContext) {
      setInputMessage(initialContext);
    }
  }, [initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/tailor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          tailorName: selectedTailor.name,
          chatHistory: [...messages, userMsg],
        }),
      });

      const data = await response.json();
      const tailorReply: ChatMessage = {
        id: `msg_tailor_${Date.now()}`,
        sender: 'tailor',
        tailorId: selectedTailor.id,
        text: data.reply || `I have noted your specifications carefully and will prepare the drafting scheme.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metaBadge: data.source === 'gemini-3.7-flash' ? 'Gemini Master AI' : 'Artisan Atelier',
      };

      setMessages((prev) => [...prev, tailorReply]);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackReply: ChatMessage = {
        id: `msg_fallback_${Date.now()}`,
        sender: 'tailor',
        tailorId: selectedTailor.id,
        text: `Thank you for sharing those details. We ensure every seam and embroidery plaque meets our rigorous atelier standards. Would you like me to inspect your measurement blueprint?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-fade-in">
      {/* Mobile Horizontal Tailor Selector */}
      <div className="lg:hidden mb-4 bg-white rounded-2xl border border-zinc-200 p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-black" />
            <span>Select Master Tailor</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">Tap tailor to switch</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MASTER_TAILORS.map((tailor) => {
            const isSelected = selectedTailor.id === tailor.id;
            return (
              <button
                key={tailor.id}
                onClick={() => {
                  setSelectedTailor(tailor);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `msg_switch_${Date.now()}`,
                      sender: 'system',
                      text: `Switched consultation to ${tailor.name} (${tailor.specialty})`,
                      timestamp: 'Just now',
                    },
                  ]);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <img
                  src={tailor.avatar}
                  alt={tailor.name}
                  className="w-6 h-6 rounded-lg object-cover border border-white/40"
                />
                <span>{tailor.name.split(' ')[0]}</span>
                <span className={`w-2 h-2 rounded-full ${tailor.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-13rem)] min-h-[540px] sm:min-h-[620px]">
        {/* LEFT COLUMN: Master Tailor Roster (Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 bg-white rounded-3xl border border-zinc-200 p-5 flex-col space-y-4 shadow-sm overflow-y-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-bold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Atelier Artisans</span>
            </div>
            <h2 className="text-xl font-bold font-serif-luxury text-black">
              Master Tailors Directory
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              Select an artisan specialist for immediate live consultation and bespoke styling advice.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {MASTER_TAILORS.map((tailor) => {
              const isSelected = selectedTailor.id === tailor.id;
              return (
                <div
                  key={tailor.id}
                  id={`tailor-card-${tailor.id}`}
                  onClick={() => {
                    setSelectedTailor(tailor);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `msg_switch_${Date.now()}`,
                        sender: 'system',
                        text: `Switched consultation to ${tailor.name} (${tailor.specialty})`,
                        timestamp: 'Just now',
                      },
                    ]);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-black shadow-md'
                      : 'bg-zinc-50 border-zinc-200 text-black hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={tailor.avatar}
                        alt={tailor.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-zinc-300"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          tailor.status === 'available'
                            ? 'bg-emerald-500'
                            : tailor.status === 'in-fitting'
                            ? 'bg-amber-500'
                            : 'bg-zinc-400'
                        }`}
                        title={`Status: ${tailor.status}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-serif-luxury font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                        {tailor.name}
                      </h3>
                      <p className={`text-xs font-medium truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>{tailor.title}</p>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {tailor.experienceYears} yrs exp · {tailor.completedGarments}+ garments
                      </span>
                    </div>
                  </div>
                  <p className={`text-[11px] mt-2 line-clamp-2 italic ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>"{tailor.bio}"</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 flex flex-col shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedTailor.avatar}
                alt={selectedTailor.name}
                className="w-11 h-11 rounded-2xl object-cover border border-zinc-300 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-black">
                    {selectedTailor.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Online & Active
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-medium">{selectedTailor.specialty}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <a
                href={`tel:${selectedTailor.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-bold text-black transition-all shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-black" />
                <span>Call Atelier</span>
              </a>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-zinc-50/50">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-zinc-200 text-zinc-700 font-medium">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <img
                      src={selectedTailor.avatar}
                      alt={selectedTailor.name}
                      className="w-8 h-8 rounded-xl object-cover border border-zinc-300 shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-lg p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                      isUser
                        ? 'bg-black text-white rounded-br-none shadow-md font-medium'
                        : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {!isUser && msg.metaBadge && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-black" />
                        <span>{msg.metaBadge}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    <div
                      className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${
                        isUser ? 'text-zinc-300' : 'text-zinc-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-600 bg-white border border-zinc-200 w-fit px-4 py-2.5 rounded-2xl shadow-xs">
                <span className="w-2 h-2 rounded-full bg-black animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-medium">{selectedTailor.name} is drafting styling advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Suggestions */}
          <div className="px-4 py-2 bg-white border-t border-zinc-200 overflow-x-auto flex items-center gap-2 scrollbar-none">
            <span className="text-[10px] text-zinc-500 whitespace-nowrap uppercase font-bold">
              Quick Inquiries:
            </span>
            {QUICK_CONSULTATION_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                id={`quick-prompt-${idx}`}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-black hover:text-white border border-zinc-200 text-[11px] text-zinc-800 whitespace-nowrap transition-all font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-zinc-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSendMessage("Attaching sketch photo of preferred Agbada sleeve embroidery.")}
                  className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 hover:text-black transition-colors"
                  title="Attach Design Sketch / Swatch Image"
                  aria-label="Attach Design Sketch / Swatch Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              <input
                id="tailor-chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${selectedTailor.name.split(' ')[0]} for fabric advice, styling tips, or measurement guidance...`}
                className="flex-1 bg-zinc-50 border border-zinc-300 text-black text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-black placeholder-zinc-400 font-medium"
              />

              <button
                type="submit"
                id="send-chat-btn"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-black hover:bg-zinc-800 text-white font-bold p-3 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send Message to Master Tailor"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

