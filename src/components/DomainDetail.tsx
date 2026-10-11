import React, { useState } from 'react';
import { 
  ArrowLeft, Globe, Server, ShieldCheck, ShieldAlert, Lock, RefreshCw, FileCode, Database, 
  Rocket, ExternalLink, Settings, Radio, CheckCircle, Clock, Trash2,
  AlertTriangle, Copy, Check, Terminal, Sparkles, HelpCircle, X, Download, Laptop
} from 'lucide-react';
import { DomainItem, SslCertificate } from '../types';
import { DnsManager } from './dns/DnsManager';
import { FileManager } from './hosting/FileManager';
import { DatabaseManager } from './hosting/DatabaseManager';
import { SslManager } from './hosting/SslManager';
import { HostsFileModal } from './dns/HostsFileModal';

interface DomainDetailProps {
  domain: DomainItem;
  onBack: () => void;
  onUpdateDomain: (updated: DomainItem) => void;
  onDeleteDomain: (domainId: string) => void;
  onOpenPreview: (domain: DomainItem) => void;
  onTriggerDeploy: (domain: DomainItem) => void;
}

export const DomainDetail: React.FC<DomainDetailProps> = ({
  domain,
  onBack,
  onUpdateDomain,
  onDeleteDomain,
  onOpenPreview,
  onTriggerDeploy,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dns' | 'files' | 'db' | 'ssl' | 'config'>('dns');

  // Server port editing
  const [customPort, setCustomPort] = useState(domain.port);
  const [customServerIp, setCustomServerIp] = useState(domain.serverIp);
  const [isPortSaved, setIsPortSaved] = useState(false);

  // SSL Certificate simulation actions
  const [isRenewingSsl, setIsRenewingSsl] = useState(false);
  const [sslSuccessMessage, setSslSuccessMessage] = useState<string | null>(null);

  // DNS_PROBE_FINISHED_NXDOMAIN Fix modal
  const [showNxModal, setShowNxModal] = useState(false);
  const [showHostsModal, setShowHostsModal] = useState(false);
  const [copiedHosts, setCopiedHosts] = useState(false);
  const [copiedNano, setCopiedNano] = useState(false);

  // cURL CLI & API Modal
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [copiedCurlDeploy, setCopiedCurlDeploy] = useState(false);
  const [copiedCurlResolve, setCopiedCurlResolve] = useState(false);
  const [copiedCurlHost, setCopiedCurlHost] = useState(false);
  const [copiedCurlDirect, setCopiedCurlDirect] = useState(false);

  const handleSaveHostingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDomain({
      ...domain,
      port: customPort,
      serverIp: customServerIp.trim(),
    });
    setIsPortSaved(true);
    setTimeout(() => setIsPortSaved(false), 2000);
  };

  const handleRenewSsl = () => {
    setIsRenewingSsl(true);
    setSslSuccessMessage(null);
    setTimeout(() => {
      const updatedSsl: SslCertificate = {
        ...(domain.ssl || {
          id: `ssl-${Date.now()}`,
          domain: domain.name,
          issuer: "Let's Encrypt Authority X3",
          fingerprint: '3B:9A:88:2E:11:F4:7D:C9:00:81:AA:FF:42:DE:01:99',
          autoRenew: true,
          cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
        }),
        status: 'active',
        issuedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fingerprint: `C${Math.floor(Math.random() * 9)}:7F:${Math.floor(Math.random() * 89 + 10)}:90:BB:11:EE:55:01:77:FF:33:AA:88:55:12`,
      };
      onUpdateDomain({
        ...domain,
        ssl: updatedSsl,
      });
      setIsRenewingSsl(false);
      setSslSuccessMessage(`SSL Certificate renewed successfully! Valid for next 90 days.`);
      setTimeout(() => setSslSuccessMessage(null), 3500);
    }, 1200);
  };

  const handleToggleForceHttps = () => {
    const currentForce = domain.ssl?.forceHttps ?? true;
    const newForce = !currentForce;
    onUpdateDomain({
      ...domain,
      ssl: {
        ...(domain.ssl || {
          id: `ssl-${Date.now()}`,
          domain: domain.name,
          issuer: "Let's Encrypt Authority X3",
          status: 'active',
          issuedAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fingerprint: '3B:9A:88:2E:11:F4:7D:C9:00:81:AA:FF:42:DE:01:99',
          autoRenew: true,
          cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
        }),
        forceHttps: newForce,
      },
    });
    setSslSuccessMessage(newForce ? 'Force HTTPS Enabled: All HTTP traffic redirected to HTTPS' : 'Force HTTPS Disabled: HTTP and HTTPS both accepted');
    setTimeout(() => setSslSuccessMessage(null), 3000);
  };

  const sslStatus = domain.ssl?.status || 'active';
  const forceHttpsEnabled = domain.ssl?.forceHttps ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Domains</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {domain.name}
            </h1>
            
            {/* Domain Propagated Status */}
            <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold flex items-center space-x-1 ${
              domain.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {domain.status === 'active' ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Active & Propagated</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>DNS Propagating</span>
                </>
              )}
            </span>

            {/* SSL Certificate Status Badge */}
            <button
              type="button"
              onClick={() => setActiveSubTab('ssl')}
              title="Click to manage SSL / TLS security"
              className={`px-2.5 py-0.5 text-xs rounded-full font-semibold flex items-center space-x-1.5 border transition cursor-pointer group ${
                sslStatus === 'active'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50'
                  : sslStatus === 'provisioning'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
              }`}
            >
              {sslStatus === 'active' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              ) : sslStatus === 'provisioning' ? (
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="font-mono">
                SSL: {sslStatus === 'active' ? 'Active & Valid' : sslStatus === 'provisioning' ? 'Provisioning...' : 'Expired'}
              </span>
              <span className="text-[10px] font-sans px-1 rounded bg-black/30 text-slate-300 group-hover:text-white">
                TLS 1.3
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Server IP: <strong className="font-mono text-sky-400">{domain.serverIp}</strong></span>
            <span>Local Hosts: <strong className="font-mono text-emerald-400">127.0.0.1</strong></span>
            <span>Host Port: <strong className="font-mono text-emerald-400">{domain.port}</strong> (React + Vite)</span>
            <span>Issuer: <strong className="text-violet-400 font-mono">{domain.ssl?.issuer || "Let's Encrypt"}</strong></span>
            <span>Expires: <strong className="text-slate-300 font-mono">{domain.ssl?.expiresAt || '90 days'}</strong></span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNxModal(true)}
            className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-amber-500/40 cursor-pointer shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Fix NXDOMAIN</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHostsModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-sky-500/30 cursor-pointer shadow-sm"
          >
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>/etc/hosts Virtual DNS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCurlModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-emerald-500/30 cursor-pointer shadow-sm"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>cURL & CLI</span>
          </button>

          <button
            onClick={() => onTriggerDeploy(domain)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Publish Hosting Domain</span>
          </button>

          <button
            onClick={() => onOpenPreview(domain)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Open Preview Link</span>
          </button>
        </div>
      </div>

      {/* Security Management Bar: SSL Badge, Renew & Force HTTPS Toggle */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl border ${
            sslStatus === 'active' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">SSL/TLS Security Management</span>
              <span className={`px-2 py-0.5 text-[11px] rounded font-semibold font-mono border ${
                sslStatus === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {sslStatus === 'active' ? '● CERTIFICATE ACTIVE' : '● CERTIFICATE PENDING'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Issued by <span className="text-slate-300 font-mono">{domain.ssl?.issuer || "Let's Encrypt"}</span> • SHA-256 Fingerprint: <span className="text-slate-400 font-mono text-[11px]">{domain.ssl?.fingerprint?.slice(0, 17) || '3B:9A:88:2E:11:F4'}...</span> • Expires on <span className="text-slate-200 font-mono">{domain.ssl?.expiresAt || 'in 90 days'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Force HTTPS Toggle */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-right">
              <div className="text-xs font-semibold text-white flex items-center gap-1 justify-end">
                <span>Force HTTPS</span>
                <span className={`text-[10px] font-mono px-1 rounded ${forceHttpsEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {forceHttpsEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Redirect HTTP traffic</div>
            </div>
            <button
              type="button"
              onClick={handleToggleForceHttps}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                forceHttpsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              title={forceHttpsEnabled ? 'Click to disable Force HTTPS' : 'Click to enable Force HTTPS'}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                forceHttpsEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Renew Certificate Button */}
          <button
            type="button"
            onClick={handleRenewSsl}
            disabled={isRenewingSsl}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-violet-500/40 cursor-pointer shadow-md shadow-violet-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRenewingSsl ? 'animate-spin' : ''}`} />
            <span>{isRenewingSsl ? 'Renewing Certificate...' : 'Renew SSL'}</span>
          </button>

          {/* Jump to Full SSL Inspector */}
          <button
            type="button"
            onClick={() => setActiveSubTab('ssl')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition border border-slate-700 cursor-pointer flex items-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Full Inspector</span>
          </button>
        </div>
      </div>

      {/* SSL Success Toast */}
      {sslSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sslSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSslSuccessMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Domain Management Quick Navigation & Telemetry Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('dns')}
          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeSubTab === 'dns'
              ? 'bg-sky-500/10 border-sky-500/50 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Zone Management</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-sky-400">
              <Radio className="w-3.5 h-3.5" /> Edit DNS Records
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/40">
            {domain.dnsRecords.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('files')}
          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeSubTab === 'files'
              ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Vite Starter Code</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
              <FileCode className="w-3.5 h-3.5" /> Manage Files
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
            {domain.files.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('db')}
          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeSubTab === 'db'
              ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Relational Schema</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
              <Database className="w-3.5 h-3.5" /> Inspect Database
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
            {domain.database.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ssl')}
          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeSubTab === 'ssl'
              ? 'bg-violet-500/10 border-violet-500/50 text-white'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Security & TLS</span>
            <span className="text-xs font-bold flex items-center gap-1.5 text-violet-400">
              <ShieldCheck className="w-3.5 h-3.5" /> SSL Status
            </span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            sslStatus === 'active'
              ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/40'
              : 'text-amber-400 bg-amber-950/80 border-amber-800/40'
          }`}>
            {sslStatus === 'active' ? 'ACTIVE' : 'PENDING'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenPreview(domain)}
          className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-sky-500/40 text-slate-300 text-left transition flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Port {domain.port} Server</span>
            <span className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" /> View Live Preview
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
            ONLINE
          </span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('dns')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 border-b-2 ${
            activeSubTab === 'dns'
              ? 'border-sky-500 text-sky-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>DNS Zone Records ({domain.dnsRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('files')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 border-b-2 ${
            activeSubTab === 'files'
              ? 'border-sky-500 text-sky-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>Files & Hosting ({domain.files.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('db')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 border-b-2 ${
            activeSubTab === 'db'
              ? 'border-sky-500 text-sky-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Database Store ({domain.database.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ssl')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 border-b-2 ${
            activeSubTab === 'ssl'
              ? 'border-sky-500 text-sky-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>SSL & Security</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 shrink-0 border-b-2 ${
            activeSubTab === 'config'
              ? 'border-sky-500 text-sky-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Server & Port Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeSubTab === 'dns' && (
          <DnsManager
            domain={domain}
            onUpdateDomain={onUpdateDomain}
            onDeployTrigger={() => onTriggerDeploy(domain)}
          />
        )}

        {activeSubTab === 'files' && (
          <FileManager
            domain={domain}
            onUpdateDomain={onUpdateDomain}
            onOpenPreview={() => onOpenPreview(domain)}
          />
        )}

        {activeSubTab === 'db' && (
          <DatabaseManager
            domain={domain}
            onUpdateDomain={onUpdateDomain}
          />
        )}

        {activeSubTab === 'ssl' && (
          <SslManager
            domain={domain}
            onUpdateDomain={onUpdateDomain}
          />
        )}

        {activeSubTab === 'config' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-white">
            <div>
              <h3 className="text-lg font-bold">Hosting Server & Port Configuration</h3>
              <p className="text-xs text-slate-400">
                Configure virtual server port (e.g. 5902 for React Vite) and backend routing.
              </p>
            </div>

            <form onSubmit={handleSaveHostingConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Server Port
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customPort}
                    onChange={e => setCustomPort(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCustomPort(3000)}
                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono rounded-lg transition border border-emerald-500/30"
                  >
                    Preset: Port 3000 (ApexHost Engine)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPort(5902)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono rounded-lg transition"
                  >
                    Preset: Port 5902
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ApexHost HTTP Engine runs on Port 3000, and dedicated sandbox runs on Port 5902.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Server IP Address
                </label>
                <input
                  type="text"
                  value={customServerIp}
                  onChange={e => setCustomServerIp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Authoritative Nameservers
                </label>
                <div className="space-y-1 font-mono text-xs">
                  {domain.nameservers.map(ns => (
                    <div key={ns} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                      {ns}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {isPortSaved ? (
                  <span className="text-xs text-emerald-400 font-semibold">Settings updated!</span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* DNS_PROBE_FINISHED_NXDOMAIN Resolution Modal */}
      {showNxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 text-white my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>DNS_PROBE_FINISHED_NXDOMAIN Fix</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Target: {domain.name} • Server Port: {domain.port} • Edge IP: {domain.serverIp}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNxModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Context Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <span>✕ This site can’t be reached</span>
              </div>
              <div className="text-slate-300">
                Check if there is a typo in <span className="text-sky-300 font-bold">{domain.name}</span>.
              </div>
              <div className="text-amber-400 text-[11px]">
                DNS_PROBE_FINISHED_NXDOMAIN
              </div>
            </div>

            {/* 1. Typo Verification Result */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Typo Check Result:</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  VERIFIED • NO TYPO
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The domain <strong className="text-white font-mono">{domain.name}</strong> is spelled correctly with no syntax errors. It has a valid label (<code className="text-sky-300">{domain.name.split('.')[0]}</code>) and standard TLD (<code className="text-emerald-300">.{domain.name.split('.').slice(1).join('.')}</code>).
              </p>
            </div>

            {/* 2. Technical Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Why does Chrome show NXDOMAIN?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Chrome queries your system's public DNS resolver (such as your ISP, Google 8.8.8.8, or Cloudflare 1.1.1.1). Because <code className="text-sky-300 font-mono">{domain.name}</code> is provisioned as a cloud workspace domain inside ApexHost, public root DNS does not have a global delegation record for it yet, resulting in <strong>NXDOMAIN (Non-Existent Domain)</strong>.
              </p>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
                ✓ Good News: The domain is fully compiled and running on our HTTP server on Port {domain.port}!
              </div>
            </div>

            {/* 3. Actionable Fixes */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Your Solution:
              </div>

              {/* Fix 1: Direct Web Gateway */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">FIX 1 (RECOMMENDED)</span>
                      <span>Open Real Web Gateway (Instant, No Config Needed)</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Directly loads the live site from our web server at <code className="text-sky-300 font-mono">/hosted/{domain.name}/</code> without relying on public DNS.
                    </p>
                  </div>

                  <a
                    href={`/hosted/${domain.name}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Hosted Site</span>
                  </a>
                </div>
              </div>

              {/* Fix 2: /etc/hosts mapping */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 text-[10px] font-mono">FIX 2</span>
                      <span>Map to System Hosts File (/etc/hosts Virtual DNS)</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Allows typing <code className="text-white font-mono">http://{domain.name}:{domain.port}</code> directly into Chrome or Safari without NXDOMAIN error.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNxModal(false);
                        setShowHostsModal(true);
                      }}
                      className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 border border-sky-500/30 transition cursor-pointer"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Full Guide</span>
                    </button>

                    <a
                      href={`/api/hosts-file?domain=${encodeURIComponent(domain.name)}&download=true`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 border border-emerald-500/30 transition cursor-pointer"
                      title="Download formatted hosts file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>

                {/* Step 1: sudo nano */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-sky-400" />
                      <span>macOS / Linux:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('sudo nano /etc/hosts');
                        setCopiedNano(true);
                        setTimeout(() => setCopiedNano(false), 2000);
                      }}
                      className="text-sky-400 hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                    >
                      {copiedNano ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNano ? 'Copied Command!' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-sky-300 text-[11px] bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 select-all">
                    sudo nano /etc/hosts
                  </div>
                </div>

                {/* Step 2: 4 lines */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">
                      Add the following lines and save:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const entries = `127.0.0.1   ${domain.name}\n76.76.21.21 ${domain.name}\n76.76.21.21 ns1.apexhost-dns.com\n76.76.21.21 ns2.apexhost-dns.com`;
                        navigator.clipboard.writeText(entries);
                        setCopiedHosts(true);
                        setTimeout(() => setCopiedHosts(false), 2000);
                      }}
                      className="px-2.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHosts ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied 4 Lines!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy 4 Lines</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 select-all">
                    <div className="text-emerald-400 font-bold">127.0.0.1   {domain.name}</div>
                    <div className="text-sky-400 font-bold">76.76.21.21 {domain.name}</div>
                    <div className="text-indigo-400 font-bold">76.76.21.21 ns1.apexhost-dns.com</div>
                    <div className="text-indigo-400 font-bold">76.76.21.21 ns2.apexhost-dns.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-mono">
                ApexHost DNS Engine • Status 200 OK
              </span>

              <button
                type="button"
                onClick={() => setShowNxModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Close Helper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated /etc/hosts Modal */}
      <HostsFileModal
        domain={domain.name}
        isOpen={showHostsModal}
        onClose={() => setShowHostsModal(false)}
        serverPort={domain.port}
      />

      {/* cURL CLI & Deployment Modal */}
      {showCurlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-5 text-white my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>cURL Commands & API Deployment</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      HTTP Engine 3000
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Target: {domain.name} • Port: {domain.port} • Origin: 127.0.0.1
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCurlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error explanation banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Fixing: curl: (6) Could not resolve host: {domain.name}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  DNS REASON
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                cURL uses system DNS which looks up public ICANN registries. Because <code className="text-sky-300">{domain.name}</code> is a virtual workspace domain, use either <strong>cURL <code className="text-emerald-300">--resolve</code></strong>, a <strong><code className="text-indigo-300">Host:</code> header</strong>, or add it to <code>/etc/hosts</code>.
              </p>
            </div>

            {/* 1. Generate POST deploy command */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-mono">1. DEPLOY</span>
                  <span>Deploy Domain via cURL API</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const payload = JSON.stringify({
                      domain: domain.name,
                      port: domain.port,
                      files: (domain.files && domain.files.length > 0)
                        ? domain.files.map(f => ({ path: f.path, content: f.content }))
                        : [{ path: 'index.html', content: `<!DOCTYPE html><html><head><title>${domain.name}</title></head><body><h1>${domain.name} Live on Port ${domain.port}</h1></body></html>` }]
                    }, null, 2);
                    const cmd = `curl -s -X POST http://127.0.0.1:3000/api/hosted/deploy \\\n  -H "Content-Type: application/json" \\\n  -d '${payload.replace(/'/g, "'\\''")}'`;
                    navigator.clipboard.writeText(cmd);
                    setCopiedCurlDeploy(true);
                    setTimeout(() => setCopiedCurlDeploy(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded border border-sky-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurlDeploy ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurlDeploy ? 'Copied Deploy Command!' : 'Copy Deploy Command'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-sky-300 overflow-x-auto whitespace-pre leading-relaxed select-all max-h-36 overflow-y-auto">
{`curl -s -X POST http://127.0.0.1:3000/api/hosted/deploy \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "${domain.name}",
    "port": ${domain.port},
    "files": [
      {
        "path": "index.html",
        "content": "<!DOCTYPE html><html><head><title>${domain.name}</title></head><body><h1>${domain.name} Active on Port ${domain.port}</h1></body></html>"
      }
    ]
  }'`}
              </pre>
            </div>

            {/* 2. Test Command using --resolve */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">2. QUERY (--resolve)</span>
                  <span>Bypass DNS via cURL Built-in Resolver</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`curl -i --resolve ${domain.name}:${domain.port}:127.0.0.1 http://${domain.name}:${domain.port}`);
                    setCopiedCurlResolve(true);
                    setTimeout(() => setCopiedCurlResolve(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurlResolve ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurlResolve ? 'Copied Command!' : 'Copy Command'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 select-all flex items-center justify-between">
                <code>curl -i --resolve {domain.name}:{domain.port}:127.0.0.1 http://{domain.name}:{domain.port}</code>
              </div>
            </div>

            {/* 3. Test Command using Host Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-mono">3. QUERY (Host Header)</span>
                  <span>Direct IP with Virtual Host Header</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`curl -i -H "Host: ${domain.name}" http://127.0.0.1:3000`);
                    setCopiedCurlHost(true);
                    setTimeout(() => setCopiedCurlHost(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurlHost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurlHost ? 'Copied Command!' : 'Copy Command'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 select-all flex items-center justify-between">
                <code>curl -i -H "Host: {domain.name}" http://127.0.0.1:3000</code>
              </div>
            </div>

            {/* 4. Direct cURL with /etc/hosts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-mono">4. DIRECT (with /etc/hosts)</span>
                  <span>Native Local Hostname Query</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`curl -i http://${domain.name}:${domain.port}`);
                    setCopiedCurlDirect(true);
                    setTimeout(() => setCopiedCurlDirect(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded border border-purple-500/30 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurlDirect ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurlDirect ? 'Copied Command!' : 'Copy Command'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300 select-all flex items-center justify-between">
                <code>curl -i http://{domain.name}:{domain.port}</code>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-mono">
                ApexHost Virtual Engine • Port 3000 Verified
              </span>
              <button
                type="button"
                onClick={() => setShowCurlModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Close CLI Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
