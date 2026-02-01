import React, { useState } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Trash2, CheckCircle2, AlertCircle, Clock, MoreVertical, Edit2, X, ChevronRight, Zap, Target, Archive, User, MessageSquare } from 'lucide-react';
import { useStore } from '../../store';
import { Task, Status, Priority } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { STATUS_COLUMNS, PRIORITY_COLORS } from '../../constants';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  onUpdate: (data: Partial<Task>) => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const { setActiveTask } = useStore();

  const handleUpdateTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate({ title: editTitle });
    }
    setIsEditing(false);
  };

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={controls}
      className="mb-4 relative group"
    >
      <GlassCard className={`p-4 ${task.status === 'done' ? 'opacity-60 grayscale' : 'opacity-100'} transition-all`} hoverEffect>
        <div className="flex items-start gap-4">
          <div
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-cyan-400 mt-1 transition-colors"
          >
            <GripVertical size={18} />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-slate-900/50 border border-cyan-500/30 rounded px-2 py-1 text-sm text-white w-full outline-none focus:border-cyan-500"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                />
              </div>
            ) : (
              <h4
                className={`text-sm font-bold tracking-tight text-slate-100 group-hover:text-cyan-300 transition-colors cursor-text ${task.status === 'done' ? 'line-through' : ''}`}
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </h4>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-3">
              <select
                value={task.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as any })}
                className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-transparent font-black cursor-pointer outline-none transition-all ${PRIORITY_COLORS[task.priority]}`}
              >
                <option value="low" className="bg-slate-900">Low</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="high" className="bg-slate-900">High</option>
                <option value="critical" className="bg-slate-900 font-bold text-fuchsia-400">Critical</option>
              </select>

              {task.team && (
                <div className="flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-black uppercase tracking-tighter">
                  <span className="opacity-60">{task.team.name}</span>
                </div>
              )}

              {task.assignee && (
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 font-black uppercase tracking-tighter">
                  <User size={10} />
                  <span>{task.assignee.name || task.assignee.email.split('@')[0]}</span>
                </div>
              )}

              {task.commentsCount ? (
                <div className="flex items-center gap-1 text-[8px] text-slate-500 font-mono uppercase tracking-widest">
                  <MessageSquare size={10} />
                  <span>{task.commentsCount}</span>
                </div>
              ) : null}

              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono ml-auto">
                <Clock size={10} />
                <span>{new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setActiveTask(task)}
              className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
              title="Mission Intelligence"
            >
              <Edit2 size={16} />
            </button>
            {task.status !== 'done' && (
              <button
                onClick={() => onUpdate({ status: 'done' })}
                className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                title="Succeed Operation"
              >
                <CheckCircle2 size={18} />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Terminate Operation"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </GlassCard>
    </Reorder.Item>
  );
};

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [activeTab, setActiveTab] = useState<Status>('todo');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      status: 'todo',
      priority: newPriority
    });
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  const getStatusIcon = (id: string) => {
    switch (id) {
      case 'backlog': return <Archive size={14} />;
      case 'todo': return <Target size={14} />;
      case 'in-progress': return <Zap size={14} />;
      case 'done': return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_#06b6d4]"></span>
            Operations Command
          </h2>
          <p className="text-[10px] text-slate-400 font-mono tracking-[0.2em] mt-1 ml-4 uppercase opacity-60">Strategic Mission Orchestration</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm
            ${isAdding
              ? 'bg-rose-500/10 border border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-cyan-500 border border-cyan-400 text-slate-950 shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95'}
          `}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          <span>{isAdding ? 'Abort' : 'Initiate Mission'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="mb-8">
              <GlassCard className="p-6 border-cyan-500/30 bg-cyan-500/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest ml-1">Objective Descriptor</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter strategic objective..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="w-full md:w-48 space-y-2">
                    <label className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest ml-1">Threat Level</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Priority)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-fuchsia-400/50 appearance-none font-bold italic"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                      <option value="critical">CRITICAL</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    Authorize
                  </button>
                </div>
              </GlassCard>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-900/50 border border-white/5 p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar scroll-smooth snap-x">
        {STATUS_COLUMNS.map((col) => (
          <button
            key={col.id}
            onClick={() => setActiveTab(col.id as Status)}
            className={`
              flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all min-w-[80px] snap-center
              ${activeTab === col.id ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-500'}
            `}
          >
            <span className="text-[10px] font-black uppercase tracking-tighter tabular-nums">
              {getTasksByStatus(col.id as Status).length}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest">{col.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-1 overflow-auto pb-12 pr-1 md:pr-2 custom-scrollbar">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id as Status);
          const isHiddenOnMobile = activeTab !== col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col gap-4 min-w-0 md:min-w-[280px] ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}
            >
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className={`${col.id === 'done' ? 'text-emerald-400' : col.id === 'in-progress' ? 'text-zap-400 text-amber-400' : 'text-slate-400'}`}>
                    {getStatusIcon(col.id)}
                  </span>
                  <h3 className="text-[11px] font-black uppercase text-slate-100 tracking-[0.2em] italic">{col.label}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{colTasks.length}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {colTasks.length === 0 ? (
                  <div className="h-32 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2 grayscale opacity-50">
                    <Archive size={20} />
                    <span className="text-[10px] uppercase font-mono tracking-widest">No Active Data</span>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={colTasks}
                    onReorder={() => { }}
                    className="flex flex-col gap-0"
                  >
                    {colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={(data) => updateTask(task.id, data)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <TaskDetailModal />
    </div>
  );
};
