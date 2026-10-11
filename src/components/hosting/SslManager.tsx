import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Lock, RefreshCw, CheckCircle, 
  Key, Shield, AlertTriangle, Check, Globe, Radio
} from 'lucide-react';
import { DomainItem, SslCertificate } from '../../types';
import { probeRealSsl, RealSslProbeResult } from '../../utils/realApi';

interface SslManagerProps {
  domain: DomainItem;
  onUpdateDomain: (updated: DomainItem) => void;
}

export const SslManager: React.FC<SslManagerProps> = ({
  domain,
  onUpdateDomain,
}) => {
  const [isReissuing, setIsReissuing] = useState(false);
  const [reissuedSuccess, setReissuedSuccess] = useState(false);
  
  // Real TLS probe state
  const [isProbingTls, setIsProbingTls] = useState(false);
  const [realTlsResult, setRealTlsResult] = useState<RealSslProbeResult | null>(null);

  const ssl = domain.ssl || {
    id: `ssl-${Date.now()}`,
    domain: domain.name,
    issuer: "Let's Encrypt Authority X3",
    status: 'active',
    issuedAt: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fingerprint: '3B:9A:88:2E:11:F4:7D:C9:00:81:AA:FF:42:DE:01:99',
    forceHttps: true,
    autoRenew: true,
    cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
  };

  const handleProbeRealTls = async () => {
    setIsProbingTls(true);
    try {
      const res = await probeRealSsl(domain.name);
      setRealTlsResult(res);
      if (res.success && res.issuer) {
        onUpdateDomain({
          ...domain,
          ssl: {
            ...ssl,
            issuer: res.issuer,
            fingerprint: res.fingerprint || ssl.fingerprint,
            cipher: res.cipher || ssl.cipher,
            status: 'active',
            issuedAt: res.validFrom ? new Date(res.validFrom).toISOString().split('T')[0] : ssl.issuedAt,
            expiresAt: res.validTo ? new Date(res.validTo).toISOString().split('T')[0] : ssl.expiresAt,
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProbingTls(false);
    }
  };

  const handleToggleForceHttps = () => {
    onUpdateDomain({
      ...domain,
      ssl: {
        ...ssl,
        forceHttps: !ssl.forceHttps,
      },
    });
  };

  const handleToggleAutoRenew = () => {
    onUpdateDomain({
      ...domain,
      ssl: {
        ...ssl,
        autoRenew: !ssl.autoRenew,
      },
    });
  };

  const handleReissueCert = () => {
    setIsReissuing(true);
    setTimeout(() => {
      onUpdateDomain({
        ...domain,
        ssl: {
          ...ssl,
          status: 'active',
          issuedAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fingerprint: `A${Math.floor(Math.random() * 9)}:F${Math.floor(Math.random() * 9)}:22:90:BB:11:EE:55:01:77:FF:33:AA:88:55:12`,
        },
      });
      setIsReissuing(false);
      setReissuedSuccess(true);
      setTimeout(() => setReissuedSuccess(false), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-violet-400" />
            <span>SSL / TLS Security Certificates</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated encryption certificates for {domain.name} and all subdomains over Port {domain.port}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleProbeRealTls}
            disabled={isProbingTls}
            className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-violet-500/20 cursor-pointer disabled:opacity-50"
          >
            <Radio className={`w-3.5 h-3.5 ${isProbingTls ? 'animate-pulse text-violet-200' : ''}`} />
            <span>{isProbingTls ? 'Probing Port 443...' : 'Probe Live TLS 443'}</span>
          </button>

          <button
            onClick={handleReissueCert}
            disabled={isReissuing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReissuing ? 'animate-spin' : ''}`} />
            <span>{isReissuing ? 'Reissuing via ACME...' : 'Reissue Certificate'}</span>
          </button>
        </div>
      </div>

      {realTlsResult && (
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          realTlsResult.success 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="font-bold flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Real TLS Handshake Probe Result for {domain.name} (Port 443):</span>
          </div>
          {realTlsResult.success ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
              <div><span className="text-slate-400">Issuer:</span> {realTlsResult.issuer}</div>
              <div><span className="text-slate-400">Cipher:</span> {realTlsResult.cipher}</div>
              <div><span className="text-slate-400">Protocol:</span> {realTlsResult.protocol}</div>
              <div><span className="text-slate-400">Valid To:</span> {realTlsResult.validTo?.slice(0, 16)}</div>
            </div>
          ) : (
            <p className="font-mono text-rose-300">{realTlsResult.error}</p>
          )}
        </div>
      )}

      {reissuedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>New TLS 1.3 certificate successfully issued by Let's Encrypt Authority.</span>
        </div>
      )}

      {/* SSL Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Certificate Authority
            </span>
            <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold flex items-center space-x-1 ${
              ssl.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {ssl.status === 'active' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Valid & Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Provisioning</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Issuer</div>
              <div className="text-white font-semibold text-sm">{ssl.issuer}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Issued Date</div>
                <div className="text-slate-200">{ssl.issuedAt}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[11px]">Expires In</div>
                <div className="text-slate-200">{ssl.expiresAt}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">Cipher Suite</div>
              <div className="text-sky-400 text-[11px] truncate">{ssl.cipher}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-500 text-[11px]">SHA-256 Fingerprint</div>
              <div className="text-slate-400 text-[10px] break-all">{ssl.fingerprint}</div>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            HTTPS Redirection & Automation
          </h4>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">Force HTTPS Redirect</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically redirects all insecure http:// requests to encrypted https:// on Port {domain.port}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleForceHttps}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  ssl.forceHttps ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                  ssl.forceHttps ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">Automatic Certificate Renewal</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically re-verifies DNS challenge and renews 30 days before expiration.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoRenew}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  ssl.autoRenew ? 'bg-sky-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                  ssl.autoRenew ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5 text-violet-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero-Configuration SSL Provisioning</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Every domain purchased or connected to ApexHost automatically receives an SNI Wildcard TLS certificate valid for both root and any subdomains (e.g., <code className="text-violet-300 font-mono">*.{domain.name}</code>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
