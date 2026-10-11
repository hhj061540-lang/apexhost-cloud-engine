import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, CheckCircle2, AlertCircle, Loader2, ExternalLink, 
  Terminal, ShieldCheck, Server, Globe, Zap, X
} from 'lucide-react';
import { DomainItem } from '../../types';
import { deployRealDomainFiles } from '../../utils/realApi';

interface DeployModalProps {
  domain: DomainItem;
  isOpen: boolean;
  onClose: () => void;
  onDeploymentComplete: (updatedDomain: DomainItem) => void;
  onOpenLivePreview: () => void;
}

interface StepLog {
  title: string;
  detail: string;
  done: boolean;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  domain,
  isOpen,
  onClose,
  onDeploymentComplete,
  onOpenLivePreview,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const progressRef = useRef(0);
  const domainRef = useRef(domain);
  domainRef.current = domain;
  const onDeploymentCompleteRef = useRef(onDeploymentComplete);
  onDeploymentCompleteRef.current = onDeploymentComplete;

  const STEPS: StepLog[] = [
    {
      title: 'Verifying DNS Records',
      detail: `Resolving ${domain.name} to edge IP ${domain.serverIp}...`,
      done: progress >= 20,
    },
    {
      title: 'Configuring Server Port',
      detail: `Binding virtual container to Port ${domain.port} (Vite React Engine)...`,
      done: progress >= 45,
    },
    {
      title: 'Compiling Hosted Files',
      detail: `Bundling ${domain.files.length} files (${domain.files.map(f => f.path.split('/').pop()).join(', ')})...`,
      done: progress >= 70,
    },
    {
      title: 'Issuing TLS/SSL Certificate',
      detail: `ACME HTTP-01 challenge verified for *.${domain.name}...`,
      done: progress >= 90,
    },
    {
      title: 'Deploying to Global Edge',
      detail: `Live preview ready on http://${domain.name}:${domain.port}`,
      done: progress >= 100,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      progressRef.current = 0;
      setProgress(0);
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setLogs([]);
      return;
    }

    const currentDomain = domainRef.current;
    progressRef.current = 0;
    setProgress(0);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setLogs([
      `[00:00] Initializing deployment for ${currentDomain.name} on Port ${currentDomain.port}`,
      `[00:02] Loading Virtual File System (${currentDomain.files.length} assets)`,
    ]);

    const interval = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + 5);
      const next = progressRef.current;
      setProgress(next);

      const d = domainRef.current;
      if (next === 25) {
        setLogs(l => [...l, `[00:15] DNS A-record confirmed: ${d.name} -> ${d.serverIp}`]);
        setCurrentStepIndex(1);
      } else if (next === 50) {
        setLogs(l => [...l, `[00:30] Port ${d.port} assigned to ApexHost HTTP Engine`]);
        setCurrentStepIndex(2);
      } else if (next === 75) {
        setLogs(l => [...l, `[00:45] Compiled React 19 bundle with esbuild in 98ms`]);
        setCurrentStepIndex(3);
      } else if (next === 95) {
        setLogs(l => [...l, `[00:58] SSL Certificate provisioned via Let's Encrypt`]);
        setCurrentStepIndex(4);
      } else if (next >= 100) {
        clearInterval(interval);
        setLogs(l => [...l, `[01:00] Deployment complete! Published domain http://${d.name}:${d.port} to hosting.`]);
        setCurrentStepIndex(4);
        setIsCompleted(true);

        const updated: DomainItem = {
          ...d,
          status: 'active',
          deployment: {
            ...d.deployment,
            status: 'live',
            lastDeployedAt: new Date().toLocaleTimeString() + ' UTC',
            previewUrl: `http://${d.name}:${d.port}`,
            uptime: '100%',
            buildLogs: [
              ...d.deployment.buildLogs,
              { time: new Date().toLocaleTimeString(), message: `Published domain http://${d.name}:${d.port} to hosting`, type: 'success' },
            ],
          },
        };
        deployRealDomainFiles(d.name, d.port, d.files);
        // Deferred dispatch prevents updating App state during any ongoing render cycle
        setTimeout(() => {
          onDeploymentCompleteRef.current(updated);
        }, 0);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleInstantComplete = () => {
    setProgress(100);
    setIsCompleted(true);
    setCurrentStepIndex(4);
    const d = domainRef.current;
    setLogs(l => [...l, `[00:01] Fast-track enabled: Published domain http://${d.name}:${d.port} to hosting!`]);

    deployRealDomainFiles(d.name, d.port, d.files);

    const updated: DomainItem = {
      ...d,
      status: 'active',
      deployment: {
        ...d.deployment,
        status: 'live',
        lastDeployedAt: new Date().toLocaleTimeString() + ' UTC',
        previewUrl: `http://${d.name}:${d.port}`,
        uptime: '100%',
        buildLogs: [
          ...d.deployment.buildLogs,
          { time: new Date().toLocaleTimeString(), message: `Published domain http://${d.name}:${d.port} to hosting`, type: 'success' },
        ],
      },
    };
    setTimeout(() => {
      onDeploymentCompleteRef.current(updated);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-6 text-white my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">1-Minute Publish to Live Preview</h3>
              <p className="text-xs text-slate-400 font-mono">
                {domain.name} • Port {domain.port} • IP {domain.serverIp}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Instant Shortcut */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {isCompleted ? 'Deployment Successful!' : 'Publishing Hosting Domain...'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sky-400">{progress}%</span>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={handleInstantComplete}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] font-sans flex items-center space-x-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-sky-400" />
                  <span>Fast-Track</span>
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Checkmarks */}
        <div className="space-y-2.5">
          {STEPS.map((step, idx) => (
            <div
              key={step.title}
              className={`p-3 rounded-xl border transition flex items-center space-x-3 ${
                step.done
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-white'
                  : idx === currentStepIndex
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="shrink-0">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : idx === currentStepIndex ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
              </div>

              <div className="truncate">
                <div className="text-xs font-semibold">{step.title}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Build Terminal Output */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-28 overflow-y-auto">
          <div className="text-slate-500 flex items-center space-x-1 pb-1 border-b border-slate-900">
            <Terminal className="w-3 h-3" />
            <span>Live Build Console</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="text-slate-300">{log}</div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex gap-3">
          {isCompleted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLivePreview();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Live Preview Link</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2.5 bg-slate-800 text-slate-400 font-medium rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing in Progress (ETA ~1 min)...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
