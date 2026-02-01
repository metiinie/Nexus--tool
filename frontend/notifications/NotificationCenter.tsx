import React, { useState } from 'react';
import { useStore, Notification } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { Bell, BellOff, CheckCircle2, AlertTriangle, Info, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string, priority: string) => {
        if (priority === 'urgent') return <AlertTriangle className="text-rose-500" size={16} />;
        if (priority === 'high') return <Zap className="text-amber-500" size={16} />;
        if (type === 'level_up') return <CheckCircle2 className="text-emerald-500" size={16} />;
        return <Info className="text-cyan-500" size={16} />;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all relative group ${unreadCount > 0 ? 'text-cyan-400' : 'text-slate-500'}`}
            >
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 z-[70]"
                        >
                            <GlassCard className="overflow-hidden border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-2xl">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Bell size={14} className="text-cyan-400" /> Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllNotificationsRead()}
                                            className="text-[9px] font-mono text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                                        >
                                            Mark All Read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center space-y-3">
                                            <BellOff className="mx-auto text-slate-700" size={32} />
                                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No Notifications</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-white/5">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.isRead && markNotificationRead(n.id)}
                                                    className={`p-4 transition-colors cursor-pointer group ${n.isRead ? 'opacity-50 grayscale-[0.5]' : 'bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06]'}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="mt-0.5">{getIcon(n.type, n.priority)}</div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className={`text-[11px] font-black uppercase tracking-tight ${n.isRead ? 'text-slate-400' : 'text-white'}`}>
                                                                    {n.title}
                                                                </h4>
                                                                <span className="text-[8px] font-mono text-slate-600 mt-0.5">
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                                                {n.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-slate-900/50 text-center border-t border-white/5">
                                    <p className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.3em]">Stay up to date</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
