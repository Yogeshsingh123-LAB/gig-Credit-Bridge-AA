import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-xs font-medium text-slate-400">{message}</p>
    </div>
  );
};
