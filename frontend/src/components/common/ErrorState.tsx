import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please check your network connection or try again later.',
  onRetry,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center max-w-md mx-auto space-y-4">
      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-base font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
