import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  CheckCircle2,
  Brain,
  Copy,
  Check,
  Zap,
  Bot,
  User,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MermaidDiagram } from './MermaidDiagram';
import { ToolCallExecution } from '../../types';

export const ChatContainer: React.FC = () => {
  const { user, conversations, activeConvId, sendMessage, isStreaming, thinkingEnabled, webSearchEnabled } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; mimeType: string; data?: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages, isStreaming]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    const textToSend = inputText;
    const attsToSend = [...attachments];

    setInputText('');
    setAttachments([]);

    await sendMessage(textToSend, attsToSend);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'image/jpeg',
            url: URL.createObjectURL(file),
            data: base64Data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to parse content blocks (Markdown text, Code blocks, Mermaid diagrams)
  const renderMessageContent = (content: string) => {
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/gi;

    // Check for mermaid blocks
    if (mermaidRegex.test(content)) {
      const parts = [];
      let lastIndex = 0;
      let match;
      mermaidRegex.lastIndex = 0;

      while ((match = mermaidRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`text_${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>);
        }
        const chartCode = match[1].trim();
        parts.push(<MermaidDiagram key={`mermaid_${match.index}`} chart={chartCode} />);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < content.length) {
        parts.push(<span key={`text_end`}>{content.slice(lastIndex)}</span>);
      }
      return <div>{parts}</div>;
    }

    return (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  };

  const suggestedPrompts = [
    '🛒 Add organic milk, avocados & sourdough to shopping list',
    '🧹 Assign Liam a 25-point chore to walk Buddy the retriever',
    '📅 Add Emma\'s pediatrician checkup for Friday at 10 AM',
    '💵 Log a $45 expense for HVAC furnace filters',
    '🥗 Check low stock items in our pantry',
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {currentConv?.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md overflow-hidden ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold'
                }`}
              >
                {isUser ? (
                  user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                  )
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>

              {/* Bubble Content */}
              <div
                className={`group relative max-w-[85%] md:max-w-[78%] rounded-3xl p-4 md:p-5 shadow-xl transition-all ${
                  isUser
                    ? 'bg-gradient-to-br from-violet-600/90 to-indigo-600/90 text-white rounded-tr-sm border border-violet-400/20'
                    : 'bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-slate-200 rounded-tl-sm'
                }`}
              >
                {/* User Attachments Preview */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.attachments.map((att, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-white/20 max-w-[180px]">
                        {att.mimeType.startsWith('image/') ? (
                          <img src={att.url || att.data} alt={att.name} className="w-full h-28 object-cover" />
                        ) : (
                          <div className="p-3 bg-slate-800 text-xs text-white">{att.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tool Call Execution Badges */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {msg.toolCalls.map((tool: ToolCallExecution, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-violet-500/30 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-violet-300 font-bold">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>Tool Call: {tool.name}()</span>
                          </div>
                          {tool.status === 'executing' ? (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                              Executing...
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Success
                            </span>
                          )}
                        </div>
                        {tool.args && (
                          <div className="text-[11px] text-slate-400">
                            Args: {JSON.stringify(tool.args)}
                          </div>
                        )}
                        {tool.result && (
                          <div className="text-[11px] text-cyan-300 bg-slate-900/80 p-2 rounded-xl mt-1">
                            Result: {JSON.stringify(tool.result)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Text */}
                {msg.content ? (
                  renderMessageContent(msg.content)
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <Sparkles className="w-4 h-4 animate-spin text-violet-400" /> Lina is thinking & orchestrating household actions...
                  </div>
                )}

                {/* Copy Button */}
                {!isUser && msg.content && (
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Timestamp */}
                <div className="text-[10px] text-slate-400/80 mt-2 text-right">{msg.timestamp}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {currentConv?.messages.length <= 2 && (
        <div className="px-4 pb-2 max-w-4xl mx-auto w-full flex items-center gap-2 overflow-x-auto no-scrollbar">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all shadow-sm shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-2">
          {/* File Attachments Bar */}
          {attachments.length > 0 && (
            <div className="flex gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              {attachments.map((att, index) => (
                <div key={index} className="relative group">
                  <img src={att.url || att.data} alt={att.name} className="w-12 h-12 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-600 text-white text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center rounded-3xl bg-slate-900/90 border border-slate-800 focus-within:border-violet-500/80 shadow-xl transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 text-slate-400 hover:text-violet-400 transition-colors pl-4"
              title="Attach image or photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Lina anything or say 'Add 2 gallons of milk to shopping list'..."
              rows={1}
              className="flex-1 bg-transparent py-3.5 px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-28"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && attachments.length === 0) || isStreaming}
              className="m-1.5 p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-violet-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
