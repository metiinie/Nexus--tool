import React, { useEffect, useState } from 'react';
import { useStore, TaskComment } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import { X, Send, Clock, MessageSquare, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskDetailModal: React.FC = () => {
    const { activeTask, setActiveTask, addComment, getTaskComments, getTeamMembers, assignTask, user: currentUser } = useStore();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTask && activeTask.team) {
            loadData();
        }
    }, [activeTask]);

    const loadData = async () => {
        if (!activeTask || !activeTask.team) return;
        setLoading(true);
        const [commentsData, membersData] = await Promise.all([
            getTaskComments(activeTask.team.id, activeTask.id),
            getTeamMembers(activeTask.team.id)
        ]);
        setComments(commentsData);
        setMembers(membersData);
        setLoading(false);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !activeTask || !activeTask.team) return;

        await addComment(activeTask.team.id, activeTask.id, newComment);
        setNewComment('');
        // Reload comments
        const commentsData = await getTaskComments(activeTask.team.id, activeTask.id);
        setComments(commentsData);
    };

    const handleAssign = async (assigneeId: string) => {
        if (!activeTask || !activeTask.team) return;
        setLoading(true);
        await assignTask(activeTask.team.id, activeTask.id, assigneeId);

        const member = members.find(m => m.userId === assigneeId);
        setActiveTask({
            ...activeTask,
            assigneeId,
            assignee: member ? {
                id: member.userId,
                name: member.user.name,
                email: member.user.email
            } : null
        } as any);
        setLoading(false);
    };

    if (!activeTask) return null;

    const isSquadTask = !!activeTask.team;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    onClick={() => setActiveTask(null)}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl z-110"
                >
                    <GlassCard className="overflow-hidden border-white/10 shadow-2xl bg-slate-900/90">
                        <div className="p-6 border-b border-white/5 flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{activeTask.title}</h2>
                                    {isSquadTask && (
                                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                            Squad Operation
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                    Initiated {new Date(activeTask.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTask(null)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <Shield size={14} className="text-cyan-400" /> Mission intelligence
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                        {activeTask.description || "No tactical briefing provided for this operation."}
                                    </p>
                                </div>

                                {isSquadTask && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                            <MessageSquare size={14} className="text-fuchsia-400" /> Neural Updates
                                        </h3>

                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {comments.length === 0 ? (
                                                <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                                                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No signals detected</p>
                                                </div>
                                            ) : (
                                                comments.map(comment => (
                                                    <div key={comment.id} className="flex gap-3 items-start">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-black">{comment.user.name?.charAt(0) || comment.user.email.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-cyan-400 uppercase">{comment.user.name || comment.user.email}</span>
                                                                <span className="text-[8px] font-mono text-slate-600">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 leading-normal">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <form onSubmit={handleAddComment} className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Transmit mission update..."
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 top-2 p-1.5 text-cyan-400 hover:text-white transition-colors"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewComment('Operation acknowledged. Progressing toward objective.');
                                                }}
                                                className="px-4 py-2 bg-slate-800 border border-white/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all border-emerald-500/20"
                                            >
                                                ACK
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Operator Status</h3>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                                <User size={16} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Primary Owner</p>
                                                <p className="text-xs font-bold text-white uppercase">{activeTask.user?.name || activeTask.user?.email.split('@')[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isSquadTask && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Deployment</h3>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-600 uppercase font-bold ml-1">Assigned Operator</label>
                                            <select
                                                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                                                value={activeTask.assignee?.id || ''}
                                                onChange={(e) => handleAssign(e.target.value)}
                                            >
                                                <option value="">Unassigned</option>
                                                {members.map(m => (
                                                    <option key={m.userId} value={m.userId}>
                                                        {m.user.name || m.user.email} {m.userId === currentUser?.id ? '(You)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Timeline</h3>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono italic">
                                        <Clock size={12} />
                                        <span>Targeting {activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
