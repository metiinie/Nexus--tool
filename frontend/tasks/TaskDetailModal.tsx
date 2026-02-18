import React, { useEffect, useState } from 'react';
import { useStore, TaskComment } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { X, Send, Clock, MessageSquare, Shield, User, CheckCircle, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskDetailModal: React.FC = () => {
    const { activeTask, setActiveTask, addComment, resolveComment, getTaskComments, getTeamMembers, assignTask, user: currentUser } = useStore();
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<string>('standard');
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('observer');

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

        const me = membersData.find((m: any) => m.userId === currentUser?.id);
        if (me) setCurrentUserRole(me.role);

        setLoading(false);
    };

    const hasPermission = (action: string) => {
        const hierarchy: Record<string, string[]> = {
            commander: ['assign', 'comment', 'resolve', 'chat', 'manage'],
            navigator: ['assign', 'comment', 'resolve', 'chat'],
            operator: ['comment', 'chat', 'resolve_own'],
            observer: ['read']
        };
        const perms = hierarchy[currentUserRole] || [];
        if (perms.includes(action)) return true;
        if (action === 'resolve' && perms.includes('resolve_own')) {
            // Can only resolve blocks if assigned or creator? 
            // In backend it's: (membership.role === 'operator' && comment.task.assigneeId === userId)
            // We'll let the button show if they are the assignee.
            return activeTask?.assignee?.id === currentUser?.id;
        }
        return false;
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !activeTask || !activeTask.team) return;

        await addComment(activeTask.team.id, activeTask.id, newComment, commentType);
        setNewComment('');
        setCommentType('standard');
        await loadData();
    };

    const handleResolve = async (commentId: string) => {
        if (!activeTask || !activeTask.team) return;
        await resolveComment(activeTask.team.id, commentId);
        await loadData();
    };

    const handleAssign = async (assigneeId: string) => {
        if (!activeTask || !activeTask.team) return;
        if (!hasPermission('assign')) return;
        setLoading(true);
        await assignTask(activeTask.team.id, activeTask.id, assigneeId);
        await loadData();
        setLoading(false);
    };

    if (!activeTask) return null;

    const isSquadTask = !!activeTask.team;

    const renderContentWithMentions = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-cyan-400 font-black">{part}</span>;
            }
            return part;
        });
    };

    const getCommentStyles = (type: string) => {
        switch (type) {
            case 'block': return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
            case 'question': return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
            case 'update': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
            default: return 'border-white/5 bg-slate-800/40 text-slate-400';
        }
    };

    const getCommentIcon = (type: string) => {
        switch (type) {
            case 'block': return <AlertCircle size={10} />;
            case 'question': return <HelpCircle size={10} />;
            case 'update': return <Info size={10} />;
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    onClick={() => setActiveTask(null)}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full h-full md:h-auto md:max-w-3xl z-110 flex flex-col"
                >
                    <GlassCard className="h-full md:h-auto md:max-h-[85vh] overflow-hidden border-white/10 shadow-2xl bg-slate-950/40 flex flex-col rounded-none md:rounded-3xl">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-start bg-slate-950/60 sticky top-0 z-20">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tight">{activeTask.title}</h2>
                                    {isSquadTask && (
                                        <span className="text-[8px] md:text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                            Team Task
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                    Status: <span className="text-cyan-400">{activeTask.status}</span> • {new Date(activeTask.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTask(null)}
                                className="p-2 -mr-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                            <Shield size={14} className="text-cyan-400" /> Description
                                        </h3>
                                        <div className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                            {activeTask.description || "No description provided for this task."}
                                        </div>
                                    </div>

                                    {isSquadTask && (
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                                <MessageSquare size={14} className="text-fuchsia-400" /> Team Discussion
                                            </h3>

                                            <div className="space-y-4">
                                                {comments.length === 0 ? (
                                                    <div className="text-center py-8 border border-dashed border-white/5 rounded-xl">
                                                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No comments yet.</p>
                                                    </div>
                                                ) : (
                                                    comments.map(comment => (
                                                        <div key={comment.id} className={`p-3 rounded-xl border transition-all ${getCommentStyles(comment.type)} ${comment.resolved ? 'opacity-40 saturate-0' : ''}`}>
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                                                                    <span className="text-[10px] font-black">{comment.user.name?.charAt(0) || 'U'}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{comment.user.name || comment.user.email}</span>
                                                                            {comment.type !== 'standard' && (
                                                                                <span className="text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/10 flex items-center gap-1">
                                                                                    {getCommentIcon(comment.type)} {comment.type === 'block' ? 'Problem' : comment.type}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-[8px] font-mono opacity-40 shrink-0">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                    <p className="text-xs leading-normal break-words whitespace-pre-wrap">{renderContentWithMentions(comment.content)}</p>

                                                                    {(comment.type === 'block' || comment.type === 'question') && !comment.resolved && hasPermission('resolve') && (
                                                                        <button
                                                                            onClick={() => handleResolve(comment.id)}
                                                                            className="mt-2 text-[9px] font-black uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all bg-cyan-400/10 px-2 py-1 rounded"
                                                                        >
                                                                            <CheckCircle size={10} /> Mark as Resolved
                                                                        </button>
                                                                    )}
                                                                    {comment.resolved && (
                                                                        <div className="mt-2 text-[9px] font-black text-emerald-400 flex items-center gap-1 uppercase">
                                                                            <CheckCircle size={10} /> Resolved by {comment.resolvedBy?.name || 'Team Member'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Assignment Status</h3>

                                        <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                                    <User size={16} className="text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Created By</p>
                                                    <p className="text-xs font-bold text-white uppercase">{activeTask.user?.name || activeTask.user?.email.split('@')[0]}</p>
                                                </div>
                                            </div>

                                            {isSquadTask && (
                                                <div className="space-y-2 pt-2 border-t border-white/5">
                                                    <label className="text-[9px] text-slate-600 uppercase font-bold ml-1">Assigned To</label>
                                                    <select
                                                        disabled={!hasPermission('assign')}
                                                        className={`w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all ${!hasPermission('assign') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/20'}`}
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
                                                    {!hasPermission('assign') && (
                                                        <p className="text-[7px] text-slate-600 uppercase font-bold mt-1 ml-1 flex items-center gap-1">
                                                            <Shield size={8} /> Command Clearance Required
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono italic pt-2 border-t border-white/5">
                                                <Clock size={12} className="text-cyan-500" />
                                                <span className="uppercase tracking-widest">Target: {activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : 'ASAP'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer (Comment Input) - Sticky for Mobile */}
                        {isSquadTask && (
                            <div className="p-4 md:p-6 bg-slate-900/80 border-t border-white/5 sticky bottom-0 z-20 backdrop-blur-xl">
                                <form onSubmit={handleAddComment} className="space-y-4 max-w-2xl mx-auto">
                                    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                        {['standard', 'update', 'question', 'block'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setCommentType(type)}
                                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${commentType === type ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 scale-105' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5 grayscale opacity-50">
                                                <MessageSquare size={10} /> {commentType === 'block' ? "Describe the problem..." : "Type a message..."}
                                            </p>
                                            <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest italic">Use @name to tag members</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder={commentType === 'block' ? "REPORT AN ISSUE..." : "TYPE A MESSAGE..."}
                                                className={`w-full bg-slate-950 border rounded-2xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none transition-all shadow-2xl ${getCommentStyles(commentType)}`}
                                            />
                                            <button
                                                type="submit"
                                                className="absolute right-2.5 top-2.5 p-2 bg-white/5 rounded-xl text-white/50 hover:text-cyan-400 border border-white/5 transition-all"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

