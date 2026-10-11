import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Monitor,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';

interface HostsFileModalProps {
  domain: string;
  isOpen: boolean;
  onClose: () => void;
  serverPort?: number;
}

export const HostsFileModal: React.FC<HostsFileModalProps> = ({
  domain,
  isOpen,
  onClose,
  serverPort = 5902,
}) => {
  const [activeOs, setActiveOs] = useState<'mac-linux' | 'windows'>('mac-linux');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  // Exact entries requested
  const hostsLines = [
    `127.0.0.1   ${domain}`,
    `76.76.21.21 ${domain}`,
    `76.76.21.21 ns1.apexhost-dns.com`,
    `76.76.21.21 ns2.apexhost-dns.com`,
  ].join('\n');

  const macLinuxCommand = 'sudo nano /etc/hosts';
  const macFlushCache = 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder';
  const linuxFlushCache = 'sudo resolvectl flush-caches || sudo systemd-resolve --flush-caches';
  const macLinuxOneLiner = `echo -e "\\n127.0.0.1   ${domain}\\n76.76.21.21 ${domain}\\n76.76.21.21 ns1.apexhost-dns.com\\n76.76.21.21 ns2.apexhost-dns.com" | sudo tee -a /etc/hosts`;

  const windowsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  const windowsFlushCache = 'ipconfig /flushdns';

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen, domain]);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/hosts/status?domain=${encodeURIComponent(domain)}`);
      if (res.ok) {
        const json = await res.json();
        setStatusData(json);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleDownload = () => {
    window.location.href = `/api/hosts-file?domain=${encodeURIComponent(domain)}&download=true`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">/etc/hosts Virtual DNS Resolver</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                  Fix NXDOMAIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Route <span className="font-mono text-sky-400 font-semibold">{domain}</span> to ApexHost Edge without public root delegation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Explanation Alert */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-slate-200">
                Why does Chrome say: <span className="text-amber-300 font-mono">DNS_PROBE_FINISHED_NXDOMAIN</span>?
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your computer's default DNS queries the public root servers. Adding the lines below to your local <code className="text-sky-300 font-mono font-semibold">/etc/hosts</code> file tells your operating system and web browser to resolve <code className="text-sky-300 font-mono font-semibold">{domain}</code> and the ApexHost nameservers directly.
              </p>
            </div>
          </div>

          {/* OS Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveOs('mac-linux')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-2 cursor-pointer ${
                  activeOs === 'mac-linux'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>macOS / Linux</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOs('windows')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-2 cursor-pointer ${
                  activeOs === 'windows'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows</span>
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Download formatted hosts file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download hosts File</span>
            </button>
          </div>

          {/* Tab Content: macOS / Linux */}
          {activeOs === 'mac-linux' && (
            <div className="space-y-3">
              {/* Step 1: Open Terminal & Run sudo nano */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Open Terminal and edit hosts file:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(macLinuxCommand, 'nano-cmd')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'nano-cmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-sky-300 text-[11px] border border-slate-800/80 flex items-center justify-between">
                  <code>{macLinuxCommand}</code>
                </div>
              </div>

              {/* Step 2: Add lines */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Add the following lines and save:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(hostsLines, 'hosts-lines')}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'hosts-lines' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied 4 Lines!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy 4 Lines</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] border border-slate-800/80 space-y-1 select-all">
                  <div className="text-slate-500"># ApexHost Virtual DNS Resolution</div>
                  <div className="text-emerald-400 font-bold">127.0.0.1   {domain}</div>
                  <div className="text-sky-400 font-bold">76.76.21.21 {domain}</div>
                  <div className="text-indigo-400 font-bold">76.76.21.21 ns1.apexhost-dns.com</div>
                  <div className="text-indigo-400 font-bold">76.76.21.21 ns2.apexhost-dns.com</div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-[10px] text-slate-400">
                  💡 In <code className="text-slate-200">nano</code>: Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Ctrl + O</kbd>, then press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Enter</kbd> to save. Then press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-200">Ctrl + X</kbd> to exit.
                </div>
              </div>

              {/* Step 3: Flush DNS cache */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Flush local DNS Cache:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(macFlushCache, 'flush-cache')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'flush-cache' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-slate-300 text-[10px] border border-slate-800/80">
                  <span className="text-slate-500">macOS: </span>
                  <code className="text-amber-300">{macFlushCache}</code>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-slate-300 text-[10px] border border-slate-800/80">
                  <span className="text-slate-500">Linux: </span>
                  <code className="text-amber-300">{linuxFlushCache}</code>
                </div>
              </div>

              {/* Instant 1-Liner Alternative */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">⚡ Instant Terminal 1-Liner:</span>
                  <button
                    onClick={() => handleCopy(macLinuxOneLiner, 'oneliner')}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                  >
                    {copiedSection === 'oneliner' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'oneliner' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto select-all">
                  {macLinuxOneLiner}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Windows */}
          {activeOs === 'windows' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Open Notepad as Administrator</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Press the <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Windows Key</kbd>, type <code className="text-white">Notepad</code>, right-click and select <strong className="text-sky-300">"Run as administrator"</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Open the hosts file path:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(windowsPath, 'win-path')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'win-path' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'win-path' ? 'Copied!' : 'Copy Path'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-sky-300 text-[11px] border border-slate-800/80 select-all">
                  {windowsPath}
                </div>
                <p className="text-[10px] text-slate-500">
                  Tip: In Notepad's File Open dialog, change the bottom dropdown from "Text Documents (*.txt)" to "All Files (*.*)".
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Append the 4 lines and save (Ctrl + S):</span>
                  </div>
                  <button
                    onClick={() => handleCopy(hostsLines, 'win-lines')}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'win-lines' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'win-lines' ? 'Copied!' : 'Copy Entries'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] border border-slate-800/80 space-y-1 select-all">
                  <div className="text-emerald-400 font-bold">127.0.0.1   {domain}</div>
                  <div className="text-sky-400 font-bold">76.76.21.21 {domain}</div>
                  <div className="text-indigo-400 font-bold">76.76.21.21 ns1.apexhost-dns.com</div>
                  <div className="text-indigo-400 font-bold">76.76.21.21 ns2.apexhost-dns.com</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>Flush DNS in Command Prompt:</span>
                  </div>
                  <button
                    onClick={() => handleCopy(windowsFlushCache, 'win-flush')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedSection === 'win-flush' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'win-flush' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg font-mono text-amber-300 text-[11px] border border-slate-800/80">
                  {windowsFlushCache}
                </div>
              </div>
            </div>
          )}

          {/* System Hosts File Status */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Workspace /etc/hosts file status:</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {statusData?.isConfiguredInSystem ? 'Active & Configured' : 'Available'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`/hosted/${domain}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open via Gateway</span>
              </a>

              <a
                href={`http://${domain}:${serverPort}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                title="Works once /etc/hosts entry is added!"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open http://{domain}:{serverPort}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            ApexHost Cloud Engine • Anycast 76.76.21.21 • Port {serverPort}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Download File</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
