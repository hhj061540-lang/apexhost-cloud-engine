import React from 'react';
import { Globe, Server, ShieldCheck, Database, FileCode, PlusCircle, RotateCcw, Terminal, Rocket } from 'lucide-react';
import { DomainItem } from '../types';

interface NavbarProps {
  domains: DomainItem[];
  activeTab: 'domains' | 'search' | 'detail' | 'preview-hub';
  setActiveTab: (tab: 'domains' | 'search' | 'detail' | 'preview-hub') => void;
  selectedDomain: DomainItem | null;
  onSelectDomain?: (domain: DomainItem) => void;
  onResetData: () => void;
  onOpenHostsModal?: () => void;
  onOpenBrowser?: () => void;
  onPublishNeuralStack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  domains,
  activeTab,
  setActiveTab,
  selectedDomain,
  onSelectDomain,
  onResetData,
  onOpenHostsModal,
  onOpenBrowser,
  onPublishNeuralStack,
}) => {
  const activeCount = domains.filter(d => d.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('domains')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Globe className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">Apex<span className="text-sky-400">Host</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                  Cloud Registrar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Domain • DNS Zone • Vite 5902 Host • SSL</p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'domains'
                  ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>My Domains</span>
              <span className="ml-1 px-1.5 py-0.2 text-xs bg-slate-700/60 text-slate-300 rounded-full">
                {domains.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'search'
                  ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Buy Domain</span>
            </button>

            {selectedDomain && (
              <div className="flex items-center">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`px-3 py-1.5 rounded-l-lg text-sm font-medium transition-colors flex items-center space-x-1.5 max-w-[170px] sm:max-w-none truncate cursor-pointer ${
                    activeTab === 'detail'
                      ? 'bg-sky-500/20 text-sky-300 border-y border-l border-sky-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-y border-l border-transparent'
                  }`}
                  title={`Manage domain: ${selectedDomain.name}`}
                >
                  <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate font-mono">{selectedDomain.name}</span>
                  <span className="hidden md:inline text-[11px] text-emerald-400 font-mono">:5902</span>
                </button>
                {domains.length > 1 && onSelectDomain && (
                  <select
                    value={selectedDomain.id}
                    onChange={(e) => {
                      const found = domains.find(d => d.id === e.target.value);
                      if (found) {
                        onSelectDomain(found);
                      }
                    }}
                    className={`px-1 py-1.5 rounded-r-lg text-xs font-mono transition-colors focus:outline-none cursor-pointer border-y border-r ${
                      activeTab === 'detail'
                        ? 'bg-sky-950 text-sky-300 border-sky-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                    title="Switch domain name"
                  >
                    {domains.map(d => (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </nav>

          {/* Right Action stats & reset */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onPublishNeuralStack && (
              <button
                type="button"
                onClick={onPublishNeuralStack}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm shadow-emerald-500/10"
                title="Publish domain http://neural-stack.ai:3000 to hosting"
              >
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Publish</span>
                <span>neural-stack.ai:3000</span>
              </button>
            )}

            {onOpenBrowser && (
              <button
                type="button"
                onClick={onOpenBrowser}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm shadow-sky-500/10"
                title="Open browser preview for neural-stack.ai:3000"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Open Browser</span>
              </button>
            )}

            {onOpenHostsModal && (
              <button
                type="button"
                onClick={onOpenHostsModal}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-sky-400 hover:text-white transition text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
                title="macOS / Linux / Windows /etc/hosts Virtual DNS Resolver"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">/etc/hosts</span>
              </button>
            )}

            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Node:</span>
              <span className="font-mono text-emerald-400">76.76.21.21:3000</span>
            </div>

            <button
              onClick={onResetData}
              title="Reset demo data to initial defaults"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
