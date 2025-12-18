import { useState, useRef, useEffect } from "react";
import { Sparkles, User, ArrowRight, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIDiscussionProps {
  chapterId: string;
  chapterTitle: string;
  chapterContent: string | null;
}

export function AIDiscussion({ chapterId, chapterTitle, chapterContent }: AIDiscussionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setStreamingContent('');
  }, [chapterId]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const systemContext = chapterContent 
        ? `You are an AI assistant helping readers understand "${chapterTitle}" from "The Leader's Guide to AI Teams" by Rayo Marji. 
           Use the chapter content to answer questions accurately and provide helpful insights.
           Keep responses concise but informative. Reference specific concepts from the chapter when relevant.
           
           Chapter content summary (first 3000 chars):
           ${chapterContent.substring(0, 3000)}...`
        : `You are an AI assistant helping readers understand "${chapterTitle}" from "The Leader's Guide to AI Teams" by Rayo Marji.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemContext },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch {
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      setStreamingContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-primary/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about this chapter!
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                I can explain concepts, generate quizzes, or answer questions.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'assistant' 
                  ? 'bg-primary/10' 
                  : 'bg-accent'
              }`}>
                {message.role === 'assistant' 
                  ? <Sparkles className="w-3.5 h-3.5 text-primary" />
                  : <User className="w-3.5 h-3.5" />
                }
              </div>
              <div className={`p-3 rounded-lg text-sm max-w-[85%] ${
                message.role === 'assistant'
                  ? 'bg-muted/50 rounded-tl-none text-muted-foreground'
                  : 'bg-primary/10 rounded-tr-none'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {streamingContent && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none text-sm text-muted-foreground max-w-[85%]">
                <div className="whitespace-pre-wrap">{streamingContent}</div>
              </div>
            </div>
          )}
          
          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this chapter..." 
            className="w-full bg-muted/50 border border-input rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
            data-testid="input-ai-question"
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 text-muted-foreground hover:text-primary disabled:opacity-50"
            data-testid="button-send-question"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
