import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`mb-4 space-y-1 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold tracking-tight text-white ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-400 ${className}`}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 ${className}`}>
    {children}
  </div>
);
