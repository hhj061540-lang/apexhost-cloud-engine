import React, { useState } from 'react';
import { Search, ShoppingCart, CheckCircle2, XCircle, Sparkles, Shield, Server, Zap, ArrowRight, Loader2, Globe, Radio, Rocket } from 'lucide-react';
import { AvailableDomainResult, DomainItem } from '../types';
import { checkRealRdap, queryRealDns, RealRdapResult } from '../utils/realApi';

interface DomainSearchBuyProps {
  onPurchaseDomain: (newDomain: DomainItem) => void;
  existingDomainNames: string[];
}

const COMMON_TLDS = ['.com', '.io', '.dev', '.app', '.ai', '.net'];

export const FEATURED_AVAILABLE_DOMAINS: AvailableDomainResult[] = [
  {
    name: 'reactvite-app.dev',
    tld: '.dev',
    price: 14.99,
    available: true,
    popularity: 'Recommended',
    reason: 'Ready for React 19 + Port 5902',
  },
  {
    name: 'cloudedge-fast.io',
    tld: '.io',
    price: 34.99,
    available: true,
    popularity: 'Hot',
    reason: 'Anycast CDN & Global Edge',
  },
  {
    name: 'apex-cluster.app',
    tld: '.app',
    price: 13.50,
    available: true,
    popularity: 'Standard',
    reason: 'Zero-config TLS & Enforced HTTPS',
  },
  {
    name: 'neural-stack.ai',
    tld: '.ai',
    price: 69.99,
    available: true,
    popularity: 'Premium',
    reason: 'Optimized for high-concurrency cloud apps',
  },
];

export const DomainSearchBuy: React.FC<DomainSearchBuyProps> = ({
  onPurchaseDomain,
  existingDomainNames,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTld, setSelectedTld] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<AvailableDomainResult[]>([]);
  const [realRdapData, setRealRdapData] = useState<Record<string, RealRdapResult>>({});

  // Checkout Modal State
  const [purchasingDomain, setPurchasingDomain] = useState<AvailableDomainResult | null>(null);
  const [portChoice, setPortChoice] = useState<number>(5902);
  const [frameworkChoice, setFrameworkChoice] = useState<'React + Vite' | 'Static HTML'>('React + Vite');
  const [autoRenew, setAutoRenew] = useState(true);
  const [registrantEmail, setRegistrantEmail] = useState('admin@apexhost.dev');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [launchStep, setLaunchStep] = useState<'idle' | 'registering' | 'dns' | 'files' | 'redirecting'>('idle');

  const handleSearch = async (queryOverride?: string) => {
    const raw = (queryOverride || searchTerm).trim().toLowerCase();
    if (!raw) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Clean query
      let baseName = raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
      let explicitTld = '';

      const matchedTld = COMMON_TLDS.find(t => baseName.endsWith(t));
      if (matchedTld) {
        explicitTld = matchedTld;
        baseName = baseName.substring(0, baseName.length - matchedTld.length);
      }
      baseName = baseName.replace(/[^a-z0-9-]/g, '') || 'app';

      const tldsToSearch = explicitTld
        ? [explicitTld]
        : selectedTld === 'all'
        ? ['.com', '.dev', '.io', '.app', '.ai']
        : [selectedTld];

      // Perform real ICANN RDAP checks for queried domains
      const generated: AvailableDomainResult[] = [];
      const rdapMap: Record<string, RealRdapResult> = {};

      for (const tld of tldsToSearch) {
        const fullName = `${baseName}${tld}`;
        const isAlreadyInAccount = existingDomainNames.includes(fullName);

        // Real live RDAP check
        let isRealAvailable = !isAlreadyInAccount;
        let rdapReason = isAlreadyInAccount ? 'Registered in your ApexHost account' : undefined;

        try {
          const rdapRes = await checkRealRdap(fullName);
          rdapMap[fullName] = rdapRes;
          if (rdapRes.isRegistered) {
            isRealAvailable = false;
            rdapReason = `Registered via ${rdapRes.registrar || 'ICANN Accredited Registrar'}`;
          }
        } catch (e) {
          // If check fails, fallback
        }

        let price = 12.99;
        if (tld === '.dev') price = 14.99;
        if (tld === '.io') price = 34.99;
        if (tld === '.ai') price = 69.99;
        if (tld === '.app') price = 13.50;

        let popularity: 'Hot' | 'Premium' | 'Recommended' | 'Standard' = 'Standard';
        if (tld === '.dev' || tld === '.com') popularity = 'Recommended';
        if (tld === '.ai') popularity = 'Hot';

        generated.push({
          name: fullName,
          tld,
          price,
          available: isRealAvailable,
          popularity,
          reason: rdapReason,
        });
      }

      setRealRdapData(rdapMap);
      setResults(generated);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const executeLaunchForDomain = (
    domainTarget: AvailableDomainResult,
    targetPort: number = portChoice,
    targetFramework: 'React + Vite' | 'Static HTML' = frameworkChoice,
    targetAutoRenew: boolean = autoRenew
  ) => {
    setIsPurchasing(true);
    setLaunchStep('registering');

    setTimeout(() => {
      setLaunchStep('dns');
      setTimeout(() => {
        setLaunchStep('files');

        const newDomain: DomainItem = {
          id: `dom-${Date.now()}`,
          name: domainTarget.name,
          tld: domainTarget.tld,
          price: domainTarget.price,
          status: 'active',
          registeredAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          autoRenew: targetAutoRenew,
          privacyProtection: true,
          nameservers: ['ns1.apexhost-dns.com', 'ns2.apexhost-dns.com'],
          serverIp: '76.76.21.21',
          port: targetPort,
          dnsRecords: [
            {
              id: `dns-${Date.now()}-1`,
              type: 'A',
              name: '@',
              value: '76.76.21.21',
              ttl: 300,
              status: 'propagated',
              updatedAt: new Date().toLocaleTimeString(),
            },
            {
              id: `dns-${Date.now()}-2`,
              type: 'CNAME',
              name: 'www',
              value: domainTarget.name,
              ttl: 300,
              status: 'propagated',
              updatedAt: new Date().toLocaleTimeString(),
            },
            {
              id: `dns-${Date.now()}-3`,
              type: 'TXT',
              name: '@',
              value: 'v=spf1 include:_spf.apexhost.net ~all',
              ttl: 3600,
              status: 'propagated',
              updatedAt: new Date().toLocaleTimeString(),
            },
          ],
          files: [
            {
              id: `file-${Date.now()}-1`,
              path: 'index.html',
              type: 'html',
              size: 680,
              updatedAt: new Date().toLocaleTimeString(),
              content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${domainTarget.name} - Port ${targetPort}</title>
  </head>
  <body style="background: #090d16; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
    <div style="background: #141c2e; padding: 40px; border-radius: 16px; border: 1px solid #23314d; text-align: center; max-width: 500px;">
      <span style="background: #10b98122; color: #10b981; padding: 4px 12px; border-radius: 99px; font-size: 13px;">⚡ Active on Port ${targetPort}</span>
      <h1 style="margin: 20px 0 10px 0; font-size: 26px;">${domainTarget.name}</h1>
      <p style="color: #94a3b8; font-size: 14px;">Connected to server IP 76.76.21.21 with automated SSL certificates.</p>
      <div id="root"></div>
    </div>
  </body>
</html>`,
            },
            {
              id: `file-${Date.now()}-2`,
              path: 'src/App.tsx',
              type: 'tsx',
              size: 1200,
              updatedAt: new Date().toLocaleTimeString(),
              content: `import React, { useState } from 'react';

export default function App() {
  const [visits, setVisits] = useState(1);
  return (
    <div style={{ marginTop: '20px', padding: '16px', background: '#0b1120', borderRadius: '12px' }}>
      <h3 style={{ color: '#38bdf8', margin: '0 0 8px 0' }}>React + Vite Production Sandbox</h3>
      <p style={{ color: '#cbd5e1', fontSize: '14px' }}>Port ${targetPort} is serving this reactive module.</p>
      <button 
        onClick={() => setVisits(v => v + 1)}
        style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Ping Server (\${visits})
      </button>
    </div>
  );
}`,
            },
            {
              id: `file-${Date.now()}-3`,
              path: 'vite.config.ts',
              type: 'ts',
              size: 280,
              updatedAt: new Date().toLocaleTimeString(),
              content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${targetPort},
    host: '0.0.0.0',
    strictPort: true
  }
});`,
            },
          ],
          database: [
            {
              id: `tbl-${Date.now()}-1`,
              name: 'app_metrics',
              description: 'Default telemetry and visitor records',
              columns: ['id', 'event', 'timestamp'],
              rows: [
                { id: '1', event: 'Domain Purchased & DNS Linked', timestamp: new Date().toLocaleTimeString() },
                { id: '2', event: `Vite Server Initialized on Port ${targetPort}`, timestamp: new Date().toLocaleTimeString() },
              ],
              createdAt: new Date().toLocaleTimeString(),
              updatedAt: new Date().toLocaleTimeString(),
            },
          ],
          ssl: {
            id: `ssl-${Date.now()}`,
            domain: domainTarget.name,
            issuer: "Let's Encrypt Authority X3",
            status: 'active',
            issuedAt: new Date().toISOString().split('T')[0],
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fingerprint: 'A1:C9:88:2E:44:F2:7D:C9:00:81:AA:FF:11:EE:22:88',
            forceHttps: true,
            autoRenew: true,
            cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
          },
          deployment: {
            status: 'live',
            lastDeployedAt: new Date().toLocaleTimeString() + ' UTC',
            previewUrl: `https://preview-${domainTarget.name.replace(/\./g, '-')}.apexhost.dev`,
            port: targetPort,
            framework: targetFramework,
            uptime: '100%',
            buildLogs: [
              { time: new Date().toLocaleTimeString(), message: 'Domain registered & DNS zone configured', type: 'info' },
              { time: new Date().toLocaleTimeString(), message: `Vite configured to listen on port ${targetPort}`, type: 'info' },
              { time: new Date().toLocaleTimeString(), message: 'Auto SSL certificate issued by Let\'s Encrypt', type: 'success' },
              { time: new Date().toLocaleTimeString(), message: 'Preview link deployed & ready', type: 'success' },
            ],
          },
        };

        // Real server deployment of starter Vite React files
        import('../utils/realApi').then(({ deployRealDomainFiles }) => {
          deployRealDomainFiles(newDomain.name, newDomain.port, newDomain.files);
        });

        setTimeout(() => {
          setLaunchStep('redirecting');
          setTimeout(() => {
            setIsPurchasing(false);
            setPurchasingDomain(null);
            setLaunchStep('idle');
            onPurchaseDomain(newDomain);
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  };

  const handleExecutePurchase = () => {
    if (!purchasingDomain) return;
    executeLaunchForDomain(purchasingDomain, portChoice, frameworkChoice, autoRenew);
  };

  const samplePrompts = ['myapp.dev', 'mycompany.io', 'coolstartup.com', 'reactvite-app.dev'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time DNS & Cloud Hosting Registrar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find, Buy & Host Your Domain Name
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Check domain availability, buy instantly, configure DNS A/CNAME records to server IP <code className="text-sky-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">76.76.21.21</code>, and host React + Vite apps on Port <code className="text-emerald-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">5902</code>.
        </p>
      </div>

      {/* Domain Search Box */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Enter domain name (e.g. myapp.dev, mycompany.io, coolstartup.com)..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Check Domain</span>
              </>
            )}
          </button>
        </form>

        {/* TLD filter pills & suggestions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium mr-1">Filter TLD:</span>
            {['all', ...COMMON_TLDS].map(tld => (
              <button
                key={tld}
                type="button"
                onClick={() => {
                  setSelectedTld(tld);
                  if (searchTerm.trim()) {
                    setTimeout(() => handleSearch(), 50);
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono transition cursor-pointer ${
                  selectedTld === tld
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {tld}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Click to check:</span>
            {samplePrompts.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setSearchTerm(prompt);
                  handleSearch(prompt);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 font-mono text-xs transition cursor-pointer hover:border-sky-500/40"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results or Featured Domains Ready to Purchase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <span>
              {hasSearched ? 'Domain Availability Results' : '🔥 Available Domains Ready for Instant Purchase'}
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {hasSearched
              ? `${results.filter(r => r.available).length} of ${results.length} available`
              : 'Featured Curated Domains (Port 5902 Ready)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(hasSearched ? results : FEATURED_AVAILABLE_DOMAINS).map(item => (
            <div
              key={item.name}
              onClick={() => {
                if (item.available) setPurchasingDomain(item);
              }}
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                item.available
                  ? 'bg-slate-900/90 border-slate-800 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer group hover:-translate-y-0.5'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-bold text-white tracking-wide group-hover:text-sky-300 transition">
                      {item.name}
                    </span>
                    {item.popularity && item.available && (
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                        item.popularity === 'Recommended'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : item.popularity === 'Hot'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.popularity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {item.available ? (
                      <span className="flex items-center text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Available for registration
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-rose-400">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> {item.reason || 'Already registered'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-white">
                    ${item.price.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400">/year</span>
                </div>
              </div>

              {/* Features included */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-slate-300">
                    <Shield className="w-3 h-3 text-sky-400 mr-1" /> Free SSL
                  </span>
                  <span className="flex items-center text-slate-300">
                    <Server className="w-3 h-3 text-indigo-400 mr-1" /> Vite 5902 Ready
                  </span>
                  <span className="flex items-center text-slate-300">
                    <Zap className="w-3 h-3 text-emerald-400 mr-1" /> Instant DNS
                  </span>
                </div>

                {item.available ? (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPurchasingDomain(item);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs transition duration-150 flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Confirm & Launch</span>
                    </button>
                    <button
                      type="button"
                      title="1-Click Instant Launch with default Vite React on Port 5902"
                      onClick={(e) => {
                        e.stopPropagation();
                        executeLaunchForDomain(item, 5902, 'React + Vite', true);
                      }}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold rounded-lg text-xs transition border border-slate-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>1-Click</span>
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="mt-2 sm:mt-0 px-3 py-1.5 bg-slate-800 text-slate-500 font-medium rounded-lg text-xs cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-semibold text-white text-base">Buy & Register Domain</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search any TLD (.com, .io, .dev, .app, .ai). Immediate registration with free WHOIS privacy and automated nameserver routing.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-semibold text-white text-base">DNS Records & 1-Min Propagation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage A, CNAME, TXT, MX records. Connect root domain to hosting IP 76.76.21.21 with real-time 1-minute countdown verification.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-semibold text-white text-base">Host React Vite Port 5902</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create files, edit code, prompt-to-generate templates, manage database tables, and preview your live site with HTTPS encryption.
          </p>
        </div>
      </div>

      {/* Purchase / Checkout Modal */}
      {purchasingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-sky-400" />
                  <h3 className="text-xl font-bold">Confirm & Launch Domain</h3>
                </div>
                <p className="text-xs text-slate-400">ApexHost Cloud Registrar & Instant React Hosting</p>
              </div>
              {!isPurchasing && (
                <button
                  onClick={() => setPurchasingDomain(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selected Domain summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Domain to register</span>
                <div className="text-xl font-mono font-bold text-sky-400">{purchasingDomain.name}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Annual fee</span>
                <div className="text-2xl font-mono font-bold text-emerald-400">${purchasingDomain.price.toFixed(2)}</div>
              </div>
            </div>

            {/* Automated Launch Package Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="text-sky-300 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Automated Launch Sequence</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                    launchStep === 'registering' || launchStep === 'dns' || launchStep === 'files' || launchStep === 'redirecting'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-emerald-500'
                  }`} />
                  <span>The domain is immediately registered to your account</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                    launchStep === 'dns' || launchStep === 'files' || launchStep === 'redirecting'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-emerald-500'
                  }`} />
                  <span>Authoritative DNS records (A, CNAME, TXT) are generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                    launchStep === 'files' || launchStep === 'redirecting'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-emerald-500'
                  }`} />
                  <span>Starter Vite React files (index.html, src/App.tsx, vite.config.ts) are deployed to live HTTP server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                    launchStep === 'redirecting'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-emerald-500'
                  }`} />
                  <span>Redirected straight to new domain management dashboard (edit DNS, files, DB, preview)</span>
                </div>
              </div>
            </div>

            {/* Hosting & Server Port config */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hosting Framework & Port
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFrameworkChoice('React + Vite');
                      setPortChoice(5902);
                    }}
                    className={`p-3 rounded-lg border text-left transition ${
                      frameworkChoice === 'React + Vite'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-sm">React 19 + Vite</div>
                    <div className="text-xs font-mono text-emerald-400 mt-1">Port 5902 (Recommended)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFrameworkChoice('Static HTML');
                      setPortChoice(3000);
                    }}
                    className={`p-3 rounded-lg border text-left transition ${
                      frameworkChoice === 'Static HTML'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-sm">Static HTML5</div>
                    <div className="text-xs font-mono text-slate-400 mt-1">Port 3000 / Web Edge</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hosting Server IP (Authoritative A-Record)
                </label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-mono text-sky-300">76.76.21.21</span>
                  <span className="text-emerald-400 font-semibold">● Apex Edge Anycast</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registrant Email Contact
                </label>
                <input
                  type="email"
                  value={registrantEmail}
                  onChange={e => setRegistrantEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={e => setAutoRenew(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span>Enable Auto-Renew at expiration</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">Free WHOIS Privacy</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="border-t border-slate-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setPurchasingDomain(null)}
                disabled={isPurchasing}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePurchase}
                disabled={isPurchasing}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {launchStep === 'registering' && 'Registering domain...'}
                      {launchStep === 'dns' && 'Generating DNS zone...'}
                      {launchStep === 'files' && 'Deploying Vite React files...'}
                      {launchStep === 'redirecting' && 'Redirecting to dashboard...'}
                      {launchStep === 'idle' && 'Launching...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Confirm & Launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
