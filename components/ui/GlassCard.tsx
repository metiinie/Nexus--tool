import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-white/10 
        bg-slate-900/60 backdrop-blur-md shadow-lg
        transition-all duration-300
        ${hoverEffect ? 'hover:shadow-glow-primary hover:border-cyan-500/30 hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }} 
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};
