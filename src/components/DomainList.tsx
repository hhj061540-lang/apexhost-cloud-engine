import React, { useState } from 'react';
import { 
  Globe, Server, ShieldCheck, ShieldAlert, Trash2, ExternalLink, 
  Settings, Database, FileCode, CheckCircle, Clock, Plus, Search,
  Radio, AlertTriangle
} from 'lucide-react';
import { DomainItem } from '../types';

interface DomainListProps {
  domains: DomainItem[];
  onSelectDomain: (domain: DomainItem) => void;
  onDeleteDomain: (domainId: string) => void;
  onOpenSearch: () => void;
  onOpenPreview: (domain: DomainItem) => void;
}

export const DomainList: React.FC<DomainListProps> = ({
  domains,
  onSelectDomain,
  onDeleteDomain,
  onOpenSearch,
  onOpenPreview,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [domainToDelete, setDomainToDelete] = useState<DomainItem | null>(null);

  const filteredDomains = domains.filter(d => 
    d.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.serverIp.includes(filterQuery) ||
    d.port.toString().includes(filterQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <span>Registered Domains & Cloud Hosting</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage DNS zone records, virtual files, React/Vite server port 5902, SSL certificates and live preview links.
          </p>
        </div>

        <button
          onClick={onOpenSearch}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Domain</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Total Domains</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{domains.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Active DNS Zones</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {domains.filter(d => d.status === 'active').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Vite Hosting (Port 5902)</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
            {domains.filter(d => d.port === 5902).length} Live
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">SSL Certificates</div>
          <div className="text-2xl font-bold font-mono text-violet-400 mt-1">
            {domains.filter(d => d.ssl?.status === 'active').length} Verified
          </div>
        </div>
      </div>

      {/* 1-Click Purchase Featured Domains Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              1-Click Purchase Available Domains (Port 5902 Ready)
            </span>
          </div>
          <button
            onClick={() => onOpenSearch()}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1 cursor-pointer"
          >
            <span>Search All TLDs →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { name: 'reactvite-app.dev', price: '$14.99/yr', tag: 'React 19 Vite' },
            { name: 'cloudedge-fast.io', price: '$34.99/yr', tag: 'Anycast Edge' },
            { name: 'apex-cluster.app', price: '$13.50/yr', tag: 'Zero-config TLS' },
            { name: 'neural-stack.ai', price: '$69.99/yr', tag: 'Cloud Scalable' },
          ].map(d => (
            <div
              key={d.name}
              onClick={() => onOpenSearch()}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 hover:shadow-lg transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-mono text-xs font-bold text-white group-hover:text-sky-400 transition">
                  {d.name}
                </div>
                <div className="text-[10px] text-slate-400">{d.tag}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-emerald-400">{d.price}</div>
                <span className="text-[10px] text-sky-400 group-hover:underline">Click to Buy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search domains by name, IP, or port..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
        {filterQuery && (
          <button
            onClick={() => setFilterQuery('')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Domain Cards Grid */}
      {filteredDomains.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Globe className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-medium">No domains found matching your criteria</p>
          <button
            onClick={onOpenSearch}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg text-xs"
          >
            Search & Buy Domain
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDomains.map(domain => {
            const hasPendingDns = domain.dnsRecords.some(r => r.status === 'pending' || r.status === 'syncing');

            return (
              <div
                key={domain.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg group"
              >
                {/* Domain Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-mono font-bold text-white tracking-tight">
                          {domain.name}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold flex items-center space-x-1 ${
                          domain.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {domain.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Pending DNS</span>
                            </>
                          )}
                        </span>

                        {/* SSL Certificate Status Badge */}
                        <span className={`px-2 py-0.5 text-[11px] rounded-full font-semibold font-mono flex items-center space-x-1 border ${
                          (domain.ssl?.status ?? 'active') === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : (domain.ssl?.status) === 'provisioning'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          {(domain.ssl?.status ?? 'active') === 'active' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>SSL Active</span>
                            </>
                          ) : (domain.ssl?.status) === 'provisioning' ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                              <span>SSL Issuing</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              <span>SSL Expired</span>
                            </>
                          )}
                          <span className="text-[9px] px-1 rounded bg-black/40 text-slate-300 font-sans">
                            {domain.ssl?.forceHttps ? 'HTTPS' : 'HTTP/S'}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Registered: <span className="font-mono text-slate-300">{domain.registeredAt}</span> • Expires: <span className="font-mono text-slate-300">{domain.expiresAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onOpenPreview(domain)}
                        title="Open Live Preview Link"
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDomainToDelete(domain)}
                        title="Delete Domain"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Tech Row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[11px]">Server IP</div>
                      <div className="font-mono text-sky-400 font-semibold mt-0.5 truncate">
                        {domain.serverIp}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[11px]">Host Port</div>
                      <div className="font-mono text-emerald-400 font-semibold mt-0.5">
                        Port {domain.port}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[11px]">SSL Security</div>
                      <div className="font-semibold text-violet-400 mt-0.5 flex items-center space-x-1 truncate">
                        {domain.ssl?.status === 'active' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>TLS Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                            <span>Issuing</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-slate-400 text-[11px]">DNS Records</div>
                      <div className="font-mono text-slate-200 font-semibold mt-0.5">
                        {domain.dnsRecords.length} records
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Notice if DNS syncing */}
                {hasPendingDns && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                    <span>DNS records syncing across worldwide nodes (1-min fast propagation active).</span>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <FileCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>{domain.files.length} files</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>{domain.database.length} DB tables</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenPreview(domain)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => onSelectDomain(domain)}
                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1 shadow-md shadow-sky-500/20 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Manage Domain</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Domain Confirmation Modal */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl p-6 text-white space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold">Delete Domain & Release Hosting?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-white font-mono">{domainToDelete.name}</strong>?
                This will release the DNS zone, delete all {domainToDelete.files.length} hosted files, drop all database tables, and terminate the port {domainToDelete.port} server routing.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDomainToDelete(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDomain(domainToDelete.id);
                  setDomainToDelete(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
              >
                Yes, Delete Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
