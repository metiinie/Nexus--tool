import React, { useState, useEffect, useRef } from 'react';
import { useStore, SquadChatMessage } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Send, Terminal, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SquadChatProps {
    teamId: string;
}

export const SquadChat: React.FC<SquadChatProps> = ({ teamId }) => {
    const { getSquadChat, sendSquadMessage, user } = useStore();
    const [messages, setMessages] = useState<SquadChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const loadChat = async () => {
        try {
            const data = await getSquadChat(teamId);
            setMessages(data.reverse()); // Backend sends desc, UI needs asc for chat scroll
        } catch (e) { }
        setLoading(false);
    };

    useEffect(() => {
        loadChat();
        const interval = setInterval(loadChat, 10000); // 10s sync for "async" feel
        return () => clearInterval(interval);
    }, [teamId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError(null);
        try {
            await sendSquadMessage(teamId, newMessage);
            setNewMessage('');
            await loadChat();
        } catch (e: any) {
            setError(e.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="animate-spin text-cyan-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Awaiting uplink...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar p-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
                        <Terminal size={48} />
                        <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Channel Silent</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isOwn = msg.user.id === user?.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 px-2">
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${isOwn ? 'text-amber-400' : 'text-cyan-400'}`}>
                                            {msg.user.name.split(' ')[0]} <span className="text-slate-600 opacity-50">RANK {msg.user.level}</span>
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl border text-xs shadow-lg whitespace-pre-wrap ${isOwn
                                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-50 rounded-tr-none'
                                        : 'bg-slate-900/60 border-white/5 text-slate-300 rounded-tl-none'
                                        }`}>
                                        {msg.content.split(/(@\w+)/g).map((part, i) => (
                                            part.startsWith('@') ? <span key={i} className="text-cyan-400 font-black">{part}</span> : part
                                        ))}
                                    </div>
                                    <div className="px-2">
                                        <span className="text-[7px] font-mono text-slate-700 uppercase">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 space-y-2">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2"
                        >
                            <AlertCircle size={12} className="text-rose-400" />
                            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tight">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit tactical brief..."
                        className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-slate-700"
                    />
                    <button
                        type="submit"
                        disabled={sending}
                        className="absolute right-2 top-2 p-1.5 text-cyan-400 hover:text-white disabled:opacity-30 transition-all"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <p className="text-[8px] text-slate-600 font-mono uppercase flex items-center gap-1.5">
                        <Info size={10} /> Async Sub-space Link <span className="opacity-30">•</span> 5s Cooldown
                    </p>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-cyan-500/40"></div>
                        <div className="w-1 h-1 rounded-full bg-cyan-500/10"></div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
