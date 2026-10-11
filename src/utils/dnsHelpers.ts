import { DnsRecordType } from '../types';

export const DNS_RECORD_DESCRIPTIONS: Record<DnsRecordType, { title: string; example: string; description: string }> = {
  A: {
    title: 'IPv4 Address Record',
    example: '76.76.21.21',
    description: 'Maps a domain/hostname directly to an IPv4 server address.',
  },
  AAAA: {
    title: 'IPv6 Address Record',
    example: '2606:4700:4700::1111',
    description: 'Maps a domain/hostname to a 128-bit IPv6 server address.',
  },
  CNAME: {
    title: 'Canonical Name (Alias)',
    example: 'reactvite-5902.dev',
    description: 'Aliases one domain name to another domain name.',
  },
  TXT: {
    title: 'Text Record',
    example: 'v=spf1 include:_spf.apexhost.net ~all',
    description: 'Holds human or machine-readable text for SPF, DKIM, Google verification.',
  },
  MX: {
    title: 'Mail Exchange',
    example: 'mail.apexhost-mail.com',
    description: 'Directs email to a mail server with priority level.',
  },
  NS: {
    title: 'Nameserver Record',
    example: 'ns1.apexhost-dns.com',
    description: 'Delegates a DNS zone to use specific authoritative name servers.',
  },
  SRV: {
    title: 'Service Record',
    example: '0 5 5060 sipserver.example.com',
    description: 'Defines the location, port and priority of specific servers.',
  },
  CAA: {
    title: 'Certification Authority Authorization',
    example: '0 issue "letsencrypt.org"',
    description: 'Restricts which Certificate Authorities can issue SSL certs for this domain.',
  },
};

export const COMMON_HOSTING_IPS = [
  { name: 'ApexCloud Vite Edge (Port 5902)', ip: '76.76.21.21', defaultPort: 5902 },
  { name: 'Apex Global Anycast CDN', ip: '104.21.55.90', defaultPort: 443 },
  { name: 'Dedicated Node Server', ip: '192.0.2.88', defaultPort: 3000 },
  { name: 'Localhost Virtual Gateway', ip: '127.0.0.1', defaultPort: 5902 },
];

export function isValidIPv4(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

export function validateRecordValue(type: DnsRecordType, value: string): { valid: boolean; message?: string } {
  const val = value.trim();
  if (!val) return { valid: false, message: 'Record value cannot be empty.' };

  if (type === 'A') {
    if (!isValidIPv4(val)) {
      return { valid: false, message: 'Invalid IPv4 address format (e.g. 76.76.21.21)' };
    }
  }

  if (type === 'CNAME') {
    if (val.includes(' ') || !val.includes('.')) {
      return { valid: false, message: 'CNAME must be a valid target domain (e.g. example.com)' };
    }
  }

  return { valid: true };
}

export interface RegionPropagation {
  region: string;
  location: string;
  status: 'propagated' | 'resolving' | 'pending';
  ip: string;
  latencyMs: number;
}

export function getSimulatedPropagation(serverIp: string, isDone: boolean): RegionPropagation[] {
  return [
    {
      region: 'North America (US-East)',
      location: 'Ashburn, VA',
      status: 'propagated',
      ip: serverIp,
      latencyMs: 12,
    },
    {
      region: 'North America (US-West)',
      location: 'San Jose, CA',
      status: 'propagated',
      ip: serverIp,
      latencyMs: 24,
    },
    {
      region: 'Europe (EU-Central)',
      location: 'Frankfurt, DE',
      status: isDone ? 'propagated' : 'resolving',
      ip: serverIp,
      latencyMs: 38,
    },
    {
      region: 'Asia Pacific (AP-East)',
      location: 'Tokyo, JP',
      status: isDone ? 'propagated' : 'resolving',
      ip: serverIp,
      latencyMs: 64,
    },
    {
      region: 'South America (SA-East)',
      location: 'São Paulo, BR',
      status: isDone ? 'propagated' : 'pending',
      ip: serverIp,
      latencyMs: 95,
    },
    {
      region: 'Australia (OC-South)',
      location: 'Sydney, AU',
      status: isDone ? 'propagated' : 'pending',
      ip: serverIp,
      latencyMs: 110,
    },
  ];
}
