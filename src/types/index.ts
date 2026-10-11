export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SRV' | 'CAA';

export interface DnsRecord {
  id: string;
  type: DnsRecordType;
  name: string; // e.g. "@", "www", "app"
  value: string; // e.g. "76.76.21.21" or "cname.apexhost.net"
  ttl: number; // in seconds: 60, 300, 3600, 86400
  priority?: number; // for MX, SRV
  status: 'propagated' | 'pending' | 'syncing';
  updatedAt: string;
  propagationTimeRemaining?: number; // seconds left if waiting
}

export interface HostedFile {
  id: string;
  path: string; // e.g. "index.html", "src/App.tsx"
  content: string;
  size: number;
  updatedAt: string;
  type: 'html' | 'tsx' | 'ts' | 'js' | 'css' | 'json' | 'md' | 'txt';
}

export interface DatabaseRow {
  id: string;
  [key: string]: any;
}

export interface DatabaseTable {
  id: string;
  name: string;
  description: string;
  columns: string[];
  rows: DatabaseRow[];
  createdAt: string;
  updatedAt: string;
}

export interface SslCertificate {
  id: string;
  domain: string;
  issuer: string;
  status: 'active' | 'provisioning' | 'expired';
  issuedAt: string;
  expiresAt: string;
  fingerprint: string;
  forceHttps: boolean;
  autoRenew: boolean;
  cipher: string;
}

export interface DeploymentInfo {
  status: 'idle' | 'building' | 'live' | 'failed';
  lastDeployedAt?: string;
  previewUrl: string;
  port: number; // Default 5902 for React Vite
  framework: 'React + Vite' | 'Static HTML' | 'Next.js' | 'Node Express';
  buildLogs: { time: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[];
  uptime: string;
}

export interface DomainItem {
  id: string;
  name: string; // e.g. "reactvite-demo.dev"
  tld: string;
  price: number;
  status: 'active' | 'pending_dns' | 'expired' | 'suspended';
  registeredAt: string;
  expiresAt: string;
  autoRenew: boolean;
  privacyProtection: boolean;
  nameservers: string[];
  serverIp: string; // e.g. "76.76.21.21"
  port: number; // e.g. 5902
  dnsRecords: DnsRecord[];
  files: HostedFile[];
  database: DatabaseTable[];
  ssl: SslCertificate;
  deployment: DeploymentInfo;
}

export interface AvailableDomainResult {
  name: string;
  tld: string;
  price: number;
  available: boolean;
  popularity?: 'Hot' | 'Premium' | 'Recommended' | 'Standard';
  reason?: string;
}
