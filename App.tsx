import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Target, BarChart2, Settings, User, LogOut, Users, Activity, Trophy, Plus } from 'lucide-react';
import { TaskBoard } from './frontend/tasks/TaskBoard';
import { HabitGrid } from './frontend/habits/HabitGrid';
import { AnalyticsDashboard } from './frontend/analytics/AnalyticsDashboard';
import { GamificationBar } from './frontend/gamification/GamificationBar';
import { TeamsPage } from './frontend/teams/TeamsPage';
import { SettingsPage } from './frontend/settings/SettingsPage';
import { TrophyRoom } from './frontend/achievements/TrophyRoom';
import { AuthPage } from './frontend/auth/AuthPage';
import { VerifyEmailPage } from './frontend/auth/VerifyEmailPage';
import { ResetPasswordPage } from './frontend/auth/ResetPasswordPage';
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

const MobileNavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center justify-center gap-1 transition-all duration-300 relative py-1
      ${isActive
        ? 'text-cyan-400 scale-110'
        : 'text-slate-500'}
    `}
  >
    <div className="relative">
      {icon}
      <NavLink to={to} className={({ isActive }) => isActive ? "absolute -inset-2 bg-cyan-400/10 blur-lg rounded-full" : "hidden"} />
    </div>
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
  </NavLink>
);

const App: React.FC = () => {
  const { isAuthenticated, syncAll, isInitialSync, logout, visualPrefs, setOnline } = useStore();
  const [showQuickAction, setShowQuickAction] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      syncAll();

      const handleOnline = () => {
        setOnline(true);
        syncAll();
      };
      const handleOffline = () => setOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const interval = setInterval(() => {
        if (navigator.onLine) syncAll();
      }, 60000); // 1 min sync

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, syncAll, setOnline]);

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
          <p className="text-cyan-400 font-mono text-sm tracking-[0.5em] animate-pulse">SYNCING YOUR DATA</p>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className={`flex h-screen text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative ${!visualPrefs.motion ? 'no-animate' : ''}`}>

        {/* Global Visual Overlays */}
        {visualPrefs.scanlines && (
          <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-[scanline_8s_linear_infinite] opacity-20"></div>
          </div>
        )}

        {visualPrefs.chromatic && (
          <div className="fixed inset-0 pointer-events-none z-[9998] mix-blend-screen opacity-[0.02]">
            <div className="absolute inset-0 bg-red-500 translate-x-[1px]"></div>
            <div className="absolute inset-0 bg-blue-500 -translate-x-[1px]"></div>
          </div>
        )}

        <div
          className="fixed inset-0 pointer-events-none z-[9997] bg-[radial-gradient(circle_at_50%_50%,transparent,rgba(0,0,0,0.4))]"
          style={{ opacity: visualPrefs.intensity / 100 }}
        ></div>

        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-xl p-4 relative z-10">
          <div className="mb-10 px-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-cyan-500/20">N</div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">NEXUS</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
            <NavItem to="/tasks" icon={<Target size={20} />} label="Tasks" />
            <NavItem to="/habits" icon={<Activity size={20} />} label="Habits" />
            <NavItem to="/analytics" icon={<BarChart2 size={20} />} label="Analytics" />
            <NavItem to="/achievements" icon={<Trophy size={20} />} label="Achievements" />
            <NavItem to="/squadron" icon={<Users size={20} />} label="Teams" />
          </nav>

          <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-white/5">
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium text-sm font-mono uppercase tracking-[0.1em]">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation - Elite Command Ribbon */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-10 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-2 rounded-[28px] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative pointer-events-auto">
            <MobileNavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Home" />
            <MobileNavItem to="/tasks" icon={<Target size={18} />} label="Tasks" />

            {/* Quick Launch Portal */}
            <div className="relative -top-8">
              <button
                onClick={() => window.location.hash = '#/tasks'}
                className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-[0_10px_25px_rgba(6,182,212,0.4)] active:scale-90 transition-all border-4 border-slate-900/90"
              >
                <Plus size={28} strokeWidth={3} />
              </button>
              <div className="absolute -inset-2 bg-cyan-500/20 blur-xl -z-10 rounded-full animate-pulse"></div>
            </div>

            <MobileNavItem to="/habits" icon={<Activity size={18} />} label="Habits" />
            <MobileNavItem to="/squadron" icon={<Users size={18} />} label="Teams" />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex flex-col z-10 w-full">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8 pb-28 md:pb-8 scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <GamificationBar />

              <div className="flex-1 mt-6 md:mt-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 h-full">
                      <TaskBoard />
                      <div className="flex flex-col gap-6 md:gap-8">
                        <HabitGrid />
                        <AnalyticsDashboard />
                      </div>
                    </div>
                  } />
                  <Route path="/tasks" element={<TaskBoard />} />
                  <Route path="/habits" element={<HabitGrid />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/achievements" element={<TrophyRoom />} />
                  <Route path="/squadron" element={<TeamsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
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
