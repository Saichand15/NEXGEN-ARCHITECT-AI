import { useState, useEffect } from 'react';
import { Check, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Project } from '../App';
import { ProgressBar } from './ProgressBar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProcessingScreenProps {
  project: Project;
  onComplete: () => void;
}

export function ProcessingScreen({ project, onComplete }: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'warning' | 'success'; message: string }>>([]);

  useEffect(() => {
    const steps = [
      { progress: 20, step: 'Analyzing image...', delay: 500 },
      { progress: 40, step: 'Detecting walls...', delay: 800, log: { type: 'info' as const, message: 'Wall detection complete' } },
      { progress: 60, step: 'Identifying rooms...', delay: 1000, log: { type: 'success' as const, message: `Detected ${project.rooms.length || 5} rooms` } },
      { progress: 75, step: 'Finding doors and windows...', delay: 1200, log: { type: 'success' as const, message: `Found ${project.doors || 9} doors and ${project.windows || 14} windows` } },
      { progress: 85, step: 'Generating 3D model...', delay: 1500, log: { type: 'warning' as const, message: 'Low confidence in kitchen area - review recommended' } },
      { progress: 100, step: 'Complete!', delay: 1800 },
    ];

    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex < steps.length) {
        const { progress, step, delay, log } = steps[stepIndex];
        setTimeout(() => {
          setProgress(progress);
          setCurrentStep(step);
          if (log) {
            setLogs(prev => [...prev, log]);
          }
          stepIndex++;
          if (stepIndex < steps.length) {
            runStep();
          } else {
            setTimeout(onComplete, 1000);
          }
        }, delay);
      }
    };

    runStep();
  }, [project, onComplete]);

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-slate-900 mb-2">Processing Floor Plan</h2>
          <p className="text-slate-600">AI is analyzing your building plan and creating a 3D model</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={progress} label={currentStep} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Image Preview with Overlay */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-slate-900">Floor Plan Analysis</h3>
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  {showOverlay ? (
                    <>
                      <EyeOff className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700 text-sm">Hide Overlay</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700 text-sm">Show Overlay</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative bg-slate-50 aspect-video">
                <ImageWithFallback
                  src={project.thumbnail}
                  alt="Processing"
                  className="w-full h-full object-contain"
                />
                {showOverlay && progress > 40 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10">
                    <svg className="w-full h-full" viewBox="0 0 800 600">
                      {/* Vectorized wall overlay */}
                      <rect x="100" y="100" width="600" height="400" fill="none" stroke="#14b8a6" strokeWidth="3" opacity="0.7" />
                      <rect x="100" y="100" width="300" height="400" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
                      <rect x="100" y="100" width="600" height="200" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
                      
                      {/* Door markers */}
                      {progress > 60 && (
                        <>
                          <line x1="250" y1="100" x2="300" y2="100" stroke="#0ea5e9" strokeWidth="4" />
                          <line x1="450" y1="100" x2="500" y2="100" stroke="#0ea5e9" strokeWidth="4" />
                        </>
                      )}
                      
                      {/* Window markers */}
                      {progress > 60 && (
                        <>
                          <rect x="150" y="100" width="40" height="10" fill="#f59e0b" opacity="0.8" />
                          <rect x="550" y="100" width="40" height="10" fill="#f59e0b" opacity="0.8" />
                          <rect x="100" y="250" width="10" height="40" fill="#f59e0b" opacity="0.8" />
                        </>
                      )}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-slate-900 mb-4">Processing Log</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    log.type === 'success'
                      ? 'bg-teal-50 border border-teal-100'
                      : log.type === 'warning'
                      ? 'bg-amber-50 border border-amber-100'
                      : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  {log.type === 'success' && <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />}
                  {log.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                  {log.type === 'info' && <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />}
                  <p className={`text-sm ${
                    log.type === 'success' ? 'text-teal-900' :
                    log.type === 'warning' ? 'text-amber-900' :
                    'text-blue-900'
                  }`}>
                    {log.message}
                  </p>
                </div>
              ))}
              
              {logs.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Starting analysis...</p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {progress > 60 && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Detected Rooms</span>
                  <span className="text-slate-900 font-medium">{project.rooms.length || 5}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Doors</span>
                  <span className="text-slate-900 font-medium">{project.doors || 9}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Windows</span>
                  <span className="text-slate-900 font-medium">{project.windows || 14}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
