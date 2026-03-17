import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Brain, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const Cortext: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I am Cortext, your AI-powered Registry Assistant. I can help you navigate architectural blueprints, analyze data lineages, or find specific entities across the mesh. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSuggest = (e: any) => {
            setInput(e.detail);
        };
        window.addEventListener('cortext-suggest', handleSuggest);
        return () => window.removeEventListener('cortext-suggest', handleSuggest);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                role: 'assistant',
                content: `I've analyzed your request regarding "${input}". Currently, I can see 142 active entities and 86 defined relationships. If you're looking for specific metadata or lineage paths, please provide the entity identifier or domain context.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-80px)] p-6 gap-6 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Brain className="h-10 w-10 shrink-0" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                            Cor<span className="text-primary italic">text</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium italic text-xs uppercase tracking-[0.2em]">Registry Intelligence Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setMessages([messages[0]])} className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-muted/20">
                        <Trash2 className="h-3 w-3" /> Clear Session
                    </Button>
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest flex gap-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Neural Bridge Active
                    </Badge>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Chat Section */}
                <Card className="flex-1 flex flex-col rounded-[40px] border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />

                    <ScrollArea className="flex-1 p-8" ref={scrollRef}>
                        <div className="space-y-8 max-w-4xl mx-auto">
                            {messages.map((m, i) => (
                                <div key={i} className={cn(
                                    "flex gap-4 group",
                                    m.role === 'user' ? "flex-row-reverse" : ""
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md transition-all group-hover:scale-110",
                                        m.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div className={cn(
                                        "flex flex-col gap-2 max-w-[80%]",
                                        m.role === 'user' ? "items-end" : ""
                                    )}>
                                        <div className={cn(
                                            "p-5 rounded-[24px] text-sm leading-relaxed shadow-sm",
                                            m.role === 'assistant'
                                                ? "bg-muted/50 rounded-tl-none font-medium text-foreground/90"
                                                : "bg-primary text-primary-foreground rounded-tr-none font-bold"
                                        )}>
                                            {m.content}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-2 italic">
                                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse shadow-md">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="bg-muted/50 p-5 rounded-[24px] rounded-tl-none flex gap-2 items-center">
                                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Section */}
                    <div className="p-8 pt-0 border-t border-slate-200 dark:border-slate-800/50 bg-white/5">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="relative group mt-6"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe a domain, query a schema, or ask about architectural lineage..."
                                className="h-16 pl-6 pr-32 rounded-3xl border-slate-200 dark:border-slate-800 bg-card/80 backdrop-blur-md shadow-xl text-md focus-visible:ring-primary/20 transition-all font-medium italic"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="h-10 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Transmit
                                    <Send className="ml-2 h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </form>
                        <div className="flex items-center justify-center gap-8 mt-6">
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest">
                                <Search className="h-3 w-3" /> Press Enter to send
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest">
                                <Sparkles className="h-3 w-3" /> Context Awareness: Enabled
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Cortext;
