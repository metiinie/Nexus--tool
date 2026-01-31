import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Target, BarChart2, Settings, User, LogOut, Users, Activity } from 'lucide-react';
import { TaskBoard } from './frontend/tasks/TaskBoard';
import { HabitGrid } from './frontend/habits/HabitGrid';
import { AnalyticsDashboard } from './frontend/analytics/AnalyticsDashboard';
import { GamificationBar } from './frontend/gamification/GamificationBar';
import { TeamsPage } from './frontend/teams/TeamsPage';
import { AuthPage } from './frontend/auth/AuthPage';
import { useStore } from './store';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive
        ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] border border-cyan-500/20 active'
        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
    `}
  >
    <div className="group-hover:scale-110 transition-transform duration-200">{icon}</div>
    <span className="font-medium text-sm">{label}</span>
    <div className="ml-auto opacity-0 group-[.active]:opacity-100 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></div>
  </NavLink>
);

const App: React.FC = () => {
  const { isAuthenticated, syncAll, isInitialSync, logout } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      syncAll();
      // Regular heart-beat sync every 30 seconds
      const interval = setInterval(syncAll, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, syncAll]);

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (isInitialSync) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute -inset-8 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <Activity className="text-cyan-400 w-12 h-12 animate-spin-slow" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-cyan-400 font-mono text-sm tracking-[0.5em] animate-pulse">SYNCHRONIZING NEURAL LINK</p>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen text-slate-200 font-sans selection:bg-cyan-500/30">

        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-xl p-4">
          <div className="mb-10 px-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-cyan-500/20">N</div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NEXUS</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavItem to="/tasks" icon={<Target size={20} />} label="Operations" />
            <NavItem to="/habits" icon={<Activity size={20} />} label="Neural Patterns" />
            <NavItem to="/analytics" icon={<BarChart2 size={20} />} label="Performance" />
            <NavItem to="/squadron" icon={<Users size={20} />} label="Squadron" />
          </nav>

          <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-white/5">
            <NavItem to="/settings" icon={<Settings size={20} />} label="System Config" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium text-sm font-mono uppercase tracking-[0.1em]">Terminate Link</span>
            </button>
          </div>
        </aside>

        {/* Mobile Layout Support */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-white/10 p-4 flex justify-around">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-cyan-400' : 'text-slate-500'}><LayoutDashboard size={20} /></NavLink>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'text-cyan-400' : 'text-slate-500'}><Target size={20} /></NavLink>
          <NavLink to="/habits" className={({ isActive }) => isActive ? 'text-cyan-400' : 'text-slate-500'}><Activity size={20} /></NavLink>
          <NavLink to="/squadron" className={({ isActive }) => isActive ? 'text-cyan-400' : 'text-slate-500'}><Users size={20} /></NavLink>
          <button onClick={handleLogout} className="text-slate-500"><LogOut size={20} /></button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <GamificationBar />

              <div className="flex-1 mt-8 animate-in fade-in duration-500">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                      <TaskBoard />
                      <div className="flex flex-col gap-8">
                        <HabitGrid />
                        <AnalyticsDashboard />
                      </div>
                    </div>
                  } />
                  <Route path="/tasks" element={<TaskBoard />} />
                  <Route path="/habits" element={<HabitGrid />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/squadron" element={<TeamsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        </main>

      </div>
    </HashRouter>
  );
};

export default App;
