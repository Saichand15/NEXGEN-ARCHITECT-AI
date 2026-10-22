import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {progress < 100 && <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />}
          <p className="text-slate-700">{label || 'Processing...'}</p>
        </div>
        <p className="text-slate-900 font-medium">{progress}%</p>
      </div>
      
      {/* Progress bar */}
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-600 via-teal-600 to-teal-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
               style={{ 
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 2s infinite'
               }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
