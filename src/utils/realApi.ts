export interface RealDnsResult {
  success: boolean;
  domain: string;
  type: string;
  status?: number;
  statusText?: string;
  answers?: Array<{ name: string; type: number; TTL: number; data: string }>;
  authority?: any[];
  records?: any[];
  source?: string;
  error?: string;
  hasLocalHosting?: boolean;
  localZoneInfo?: {
    serverIp: string;
    port: number;
    nameservers: string[];
  };
}

export interface RealPropagationNode {
  name: string;
  location: string;
  status: 'propagated' | 'unresolved' | 'error';
  ip: string | null;
  latencyMs: number;
  error?: string;
}

export interface RealRdapResult {
  domain: string;
  available: boolean;
  isRegistered: boolean;
  status: string | string[];
  registrar?: string;
  registeredAt?: string | null;
  expiresAt?: string | null;
  nameservers?: string[];
}

export interface RealSslProbeResult {
  success: boolean;
  domain: string;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  fingerprint?: string;
  serialNumber?: string;
  protocol?: string;
  cipher?: string;
  authorized?: boolean;
  error?: string;
}

export interface RealDnsDiagnosisResult {
  domain: string;
  typoCheck: {
    hasTypo: boolean;
    verdict: string;
    details: string;
    label: string;
    tld: string;
    characterCount: number;
  };
  nxDomainDiagnosis: {
    errorCode: string;
    status: number;
    statusName: string;
    explanation: string;
    authoritativeIp: string;
    serverPort: number;
    isHostedLocally: boolean;
    gatewayPath: string;
  };
  fixes: Array<{
    id: string;
    title: string;
    description: string;
    actionType: string;
    url?: string;
    hostsEntry?: string;
    macLinuxPath?: string;
    windowsPath?: string;
    nameservers?: string[];
    recommended?: boolean;
  }>;
}

export async function fetchDnsDiagnosis(domain: string): Promise<RealDnsDiagnosisResult> {
  const res = await fetch(`/api/dns/diagnose?domain=${encodeURIComponent(domain)}`);
  return await res.json();
}

// 1. Query Real DNS records via DoH / Node
export async function queryRealDns(domain: string, type: string = 'A'): Promise<RealDnsResult> {
  try {
    const res = await fetch(`/api/dns/query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      domain,
      type,
      error: err.message || 'Network error querying DNS',
    };
  }
}

// 2. Query Real RDAP domain registration info
export async function checkRealRdap(domain: string): Promise<RealRdapResult> {
  try {
    const res = await fetch(`/api/dns/rdap?domain=${encodeURIComponent(domain)}`);
    return await res.json();
  } catch (err: any) {
    return {
      domain,
      available: false,
      isRegistered: false,
      status: `Error: ${err.message}`,
    };
  }
}

// 3. Query Real Global DNS Propagation across Google, Cloudflare, Quad9, AliDNS
export async function checkRealPropagation(domain: string): Promise<RealPropagationNode[]> {
  try {
    const res = await fetch(`/api/dns/propagation?domain=${encodeURIComponent(domain)}`);
    const data = await res.json();
    return data.results || [];
  } catch (err: any) {
    return [];
  }
}

// 4. Probe Real SSL Certificate on remote domain
export async function probeRealSsl(domain: string): Promise<RealSslProbeResult> {
  try {
    const res = await fetch(`/api/ssl/probe?domain=${encodeURIComponent(domain)}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      domain,
      error: err.message,
    };
  }
}

// 5. Deploy Real Files to Real HTTP Web Server
export async function deployRealDomainFiles(domain: string, port: number, files: Array<{ path: string; content: string }>) {
  try {
    const res = await fetch('/api/hosted/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, port, files }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. Real Cloudflare API Integration
export async function verifyCloudflareToken(apiToken: string) {
  const res = await fetch('/api/cloudflare/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken }),
  });
  return await res.json();
}

export async function fetchCloudflareZones(apiToken: string) {
  const res = await fetch('/api/cloudflare/zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken }),
  });
  return await res.json();
}

export async function fetchCloudflareDnsRecords(apiToken: string, zoneId: string) {
  const res = await fetch('/api/cloudflare/dns-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiToken, zoneId }),
  });
  return await res.json();
}
