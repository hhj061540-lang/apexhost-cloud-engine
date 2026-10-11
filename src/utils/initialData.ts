import { DomainItem } from '../types';

export const INITIAL_DOMAINS: DomainItem[] = [
  {
    id: 'dom-neural',
    name: 'neural-stack.ai',
    tld: '.ai',
    price: 69.99,
    status: 'active',
    registeredAt: '2026-03-01',
    expiresAt: '2027-03-01',
    autoRenew: true,
    privacyProtection: true,
    nameservers: ['ns1.apexhost-dns.com', 'ns2.apexhost-dns.com'],
    serverIp: '76.76.21.21',
    port: 3000,
    dnsRecords: [
      {
        id: 'dns-n-1',
        type: 'A',
        name: '@',
        value: '76.76.21.21',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-10 14:00 UTC',
      },
      {
        id: 'dns-n-2',
        type: 'A',
        name: '@',
        value: '127.0.0.1',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-10 14:00 UTC',
      },
      {
        id: 'dns-n-3',
        type: 'CNAME',
        name: 'www',
        value: 'neural-stack.ai',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-10 14:00 UTC',
      },
      {
        id: 'dns-n-4',
        type: 'A',
        name: 'api',
        value: '76.76.21.21',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-10 14:05 UTC',
      },
      {
        id: 'dns-n-5',
        type: 'NS',
        name: '@',
        value: 'ns1.apexhost-dns.com',
        ttl: 86400,
        status: 'propagated',
        updatedAt: '2026-03-10 14:00 UTC',
      },
      {
        id: 'dns-n-6',
        type: 'NS',
        name: '@',
        value: 'ns2.apexhost-dns.com',
        ttl: 86400,
        status: 'propagated',
        updatedAt: '2026-03-10 14:00 UTC',
      },
      {
        id: 'dns-n-7',
        type: 'TXT',
        name: '@',
        value: 'v=spf1 include:_spf.apexhost.net ~all',
        ttl: 3600,
        status: 'propagated',
        updatedAt: '2026-03-10 14:10 UTC',
      },
    ],
    files: [
      {
        id: 'file-n-1',
        path: 'index.html',
        type: 'html',
        size: 920,
        updatedAt: '2026-03-10 15:00',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NeuralStack AI • Cloud Engine</title>
    <link rel="stylesheet" href="./src/styles.css" />
  </head>
  <body class="bg-slate-950 text-white min-h-screen font-sans">
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>`,
      },
      {
        id: 'file-n-2',
        path: 'src/App.tsx',
        type: 'tsx',
        size: 1680,
        updatedAt: '2026-03-10 15:05',
        content: `import React, { useState } from 'react';

export default function App() {
  const [inferenceCount, setInferenceCount] = useState(128);
  const [latency, setLatency] = useState(14);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #111a36 0%, #060913 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#0f172a',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        border: '1px solid #1e293b',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '18px'
        }}>
          ⚡ neural-stack.ai • Port 3000 • TLS 1.3 Active
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
          NeuralStack AI Cloud Engine
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
          Authoritative DNS mapped to <strong>76.76.21.21</strong> and local loopback <strong>127.0.0.1:3000</strong> via <code>/etc/hosts</code>.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '28px',
          background: '#030712',
          padding: '18px',
          borderRadius: '12px',
          border: '1px solid #1e293b'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Port</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>3000</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>SSL Security</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>Active</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Latency</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a855f7' }}>{latency}ms</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setInferenceCount(c => c + 1);
              setLatency(Math.floor(Math.random() * 8 + 10));
            }}
            style={{
              padding: '12px 28px',
              backgroundColor: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            Run Inference ({inferenceCount})
          </button>
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        id: 'file-n-3',
        path: 'vite.config.ts',
        type: 'ts',
        size: 290,
        updatedAt: '2026-03-10 15:00',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
});`,
      },
    ],
    database: [
      {
        id: 'tbl-n-1',
        name: 'model_endpoints',
        description: 'Deployed neural models and weights configurations',
        columns: ['id', 'model_name', 'latency_target', 'status', 'created_at'],
        rows: [
          { id: '1', model_name: 'transformer-xl-base', latency_target: '15ms', status: 'healthy', created_at: '2026-03-01 10:00' },
          { id: '2', model_name: 'diffusion-turbo-v2', latency_target: '30ms', status: 'healthy', created_at: '2026-03-05 12:30' },
        ],
        createdAt: '2026-03-01 10:00',
        updatedAt: '2026-03-10 14:00',
      },
    ],
    ssl: {
      id: 'ssl-neural',
      domain: 'neural-stack.ai',
      issuer: "Let's Encrypt Authority X3",
      status: 'active',
      issuedAt: '2026-03-01',
      expiresAt: '2026-06-01',
      fingerprint: '8F:12:33:9A:C4:55:01:29:44:EE:BC:77:AA:99:10:42',
      forceHttps: true,
      autoRenew: true,
      cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
    },
    deployment: {
      status: 'live',
      lastDeployedAt: 'Just now (Published to http://neural-stack.ai:3000)',
      previewUrl: 'http://neural-stack.ai:3000',
      port: 3000,
      framework: 'React + Vite',
      uptime: '100%',
      buildLogs: [
        { time: '15:29:40', message: 'Resolved domain neural-stack.ai to IP 76.76.21.21:3000', type: 'info' },
        { time: '15:29:45', message: 'Local /etc/hosts resolution verified: 127.0.0.1:3000', type: 'success' },
        { time: '15:29:50', message: 'Automated TLS 1.3 Let\'s Encrypt certificate verified', type: 'success' },
        { time: '15:30:00', message: 'Published domain http://neural-stack.ai:3000 to hosting', type: 'success' },
      ],
    },
  },
  {
    id: 'dom-1',
    name: 'reactvite-5902.dev',
    tld: '.dev',
    price: 14.99,
    status: 'active',
    registeredAt: '2026-02-15',
    expiresAt: '2027-02-15',
    autoRenew: true,
    privacyProtection: true,
    nameservers: ['ns1.apexhost-dns.com', 'ns2.apexhost-dns.com'],
    serverIp: '76.76.21.21',
    port: 5902,
    dnsRecords: [
      {
        id: 'dns-1',
        type: 'A',
        name: '@',
        value: '76.76.21.21',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-01 10:15 UTC',
      },
      {
        id: 'dns-2',
        type: 'CNAME',
        name: 'www',
        value: 'reactvite-5902.dev',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-01 10:15 UTC',
      },
      {
        id: 'dns-3',
        type: 'A',
        name: 'api',
        value: '76.76.21.21',
        ttl: 300,
        status: 'propagated',
        updatedAt: '2026-03-01 10:16 UTC',
      },
      {
        id: 'dns-4',
        type: 'TXT',
        name: '@',
        value: 'v=spf1 include:_spf.apexhost.net ~all',
        ttl: 3600,
        status: 'propagated',
        updatedAt: '2026-03-01 10:17 UTC',
      },
    ],
    files: [
      {
        id: 'file-1',
        path: 'index.html',
        type: 'html',
        size: 890,
        updatedAt: '2026-03-10 14:20',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite on Port 5902</title>
    <link rel="stylesheet" href="./src/styles.css" />
  </head>
  <body class="bg-slate-950 text-white min-h-screen font-sans">
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>`,
      },
      {
        id: 'file-2',
        path: 'src/App.tsx',
        type: 'tsx',
        size: 1450,
        updatedAt: '2026-03-10 14:25',
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('Online');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #090d16 0%, #111a2e 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '650px',
        width: '100%',
        backgroundColor: '#1b2438',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid #2a3754',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          ⚡ Port 5902 • React 19 + Vite Live
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          Hosted on reactvite-5902.dev
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
          Welcome to your live cloud deployment. DNS resolved to <strong>76.76.21.21</strong> with automated SSL encryption.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '28px',
          background: '#0d1322',
          padding: '16px',
          borderRadius: '10px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>SERVER PORT</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>5902</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>SSL STATUS</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>Active TLS 1.3</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>STATUS</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>{status}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setCount(c => c + 1)}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Clicked {count} times
          </button>
          <button
            onClick={() => setStatus(s => s === 'Online' ? 'High Load' : 'Online')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Toggle Load
          </button>
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        id: 'file-3',
        path: 'src/styles.css',
        type: 'css',
        size: 320,
        updatedAt: '2026-03-10 14:15',
        content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #0b0f19;
  color: #f8fafc;
}`,
      },
      {
        id: 'file-4',
        path: 'package.json',
        type: 'json',
        size: 420,
        updatedAt: '2026-03-10 14:10',
        content: `{
  "name": "vite-react-app-5902",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --port 5902 --host",
    "build": "vite build",
    "preview": "vite preview --port 5902"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "vite": "^8.0.0"
  }
}`,
      },
      {
        id: 'file-5',
        path: 'vite.config.ts',
        type: 'ts',
        size: 310,
        updatedAt: '2026-03-10 14:12',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for Port 5902
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5902,
    host: '0.0.0.0',
    strictPort: true,
  },
});`,
      },
    ],
    database: [
      {
        id: 'tbl-1',
        name: 'visitors',
        description: 'Real-time telemetry and page visit records for port 5902',
        columns: ['id', 'ip_address', 'country', 'path', 'timestamp'],
        rows: [
          { id: '1', ip_address: '192.168.1.45', country: 'United States', path: '/', timestamp: '2026-03-10 14:22:10' },
          { id: '2', ip_address: '84.112.5.90', country: 'Germany', path: '/about', timestamp: '2026-03-10 14:22:34' },
          { id: '3', ip_address: '103.21.244.0', country: 'Singapore', path: '/api/health', timestamp: '2026-03-10 14:23:01' },
          { id: '4', ip_address: '185.199.108.1', country: 'United Kingdom', path: '/', timestamp: '2026-03-10 14:24:15' },
        ],
        createdAt: '2026-03-01 11:00',
        updatedAt: '2026-03-10 14:24',
      },
      {
        id: 'tbl-2',
        name: 'env_configs',
        description: 'Server environment parameters & runtime settings',
        columns: ['id', 'key', 'value', 'environment'],
        rows: [
          { id: '1', key: 'PORT', value: '5902', environment: 'production' },
          { id: '2', key: 'ENABLE_SSL', value: 'true', environment: 'production' },
          { id: '3', key: 'HOST', value: '0.0.0.0', environment: 'production' },
          { id: '4', key: 'DNS_PROXY', value: 'cloudflare-compatible', environment: 'production' },
        ],
        createdAt: '2026-03-01 11:10',
        updatedAt: '2026-03-05 09:12',
      },
    ],
    ssl: {
      id: 'ssl-1',
      domain: 'reactvite-5902.dev',
      issuer: "Let's Encrypt Authority X3",
      status: 'active',
      issuedAt: '2026-02-15',
      expiresAt: '2026-05-15',
      fingerprint: '3B:9A:88:2E:11:F4:7D:C9:00:81:AA:FF:42:DE:01:99',
      forceHttps: true,
      autoRenew: true,
      cipher: 'TLS_AES_256_GCM_SHA384 (ECDHE with X25519)',
    },
    deployment: {
      status: 'live',
      lastDeployedAt: '2026-03-10 14:25 UTC',
      previewUrl: 'https://preview-reactvite-5902.apexhost.dev',
      port: 5902,
      framework: 'React + Vite',
      uptime: '99.98%',
      buildLogs: [
        { time: '14:24:50', message: 'Triggered automated build from Virtual File System', type: 'info' },
        { time: '14:24:52', message: 'Found vite.config.ts with port 5902 configuration', type: 'info' },
        { time: '14:24:55', message: 'Compiled React 19 bundle: 4 modules in 142ms', type: 'success' },
        { time: '14:24:58', message: 'Assigned public edge server IP 76.76.21.21', type: 'info' },
        { time: '14:25:00', message: 'TLS Certificate verified via Let\'s Encrypt', type: 'success' },
        { time: '14:25:01', message: 'Virtual container online at port 5902. Live preview ready.', type: 'success' },
      ],
    },
  },
  {
    id: 'dom-2',
    name: 'cloudapp-stack.io',
    tld: '.io',
    price: 34.99,
    status: 'pending_dns',
    registeredAt: '2026-03-05',
    expiresAt: '2027-03-05',
    autoRenew: true,
    privacyProtection: true,
    nameservers: ['ns1.apexhost-dns.com', 'ns2.apexhost-dns.com'],
    serverIp: '192.0.2.88',
    port: 3000,
    dnsRecords: [
      {
        id: 'dns-201',
        type: 'A',
        name: '@',
        value: '192.0.2.88',
        ttl: 60,
        status: 'pending',
        updatedAt: '2026-03-10 12:00 UTC',
        propagationTimeRemaining: 45,
      },
      {
        id: 'dns-202',
        type: 'CNAME',
        name: 'www',
        value: 'cloudapp-stack.io',
        ttl: 300,
        status: 'syncing',
        updatedAt: '2026-03-10 12:00 UTC',
      },
    ],
    files: [
      {
        id: 'file-201',
        path: 'index.html',
        type: 'html',
        size: 512,
        updatedAt: '2026-03-05 16:00',
        content: `<!DOCTYPE html>
<html>
  <head>
    <title>CloudApp Stack</title>
    <style>
      body { background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 50px; }
      h1 { color: #38bdf8; }
    </style>
  </head>
  <body>
    <h1>Welcome to cloudapp-stack.io</h1>
    <p>DNS propagation is currently finishing across global root servers.</p>
  </body>
</html>`,
      },
    ],
    database: [],
    ssl: {
      id: 'ssl-2',
      domain: 'cloudapp-stack.io',
      issuer: "Let's Encrypt Authority X3",
      status: 'provisioning',
      issuedAt: '2026-03-05',
      expiresAt: '2026-06-05',
      fingerprint: 'Pending DNS Challenge Verification',
      forceHttps: true,
      autoRenew: true,
      cipher: 'TLS 1.3 Negotiating',
    },
    deployment: {
      status: 'idle',
      previewUrl: 'https://preview-cloudapp-stack.apexhost.dev',
      port: 3000,
      framework: 'Static HTML',
      uptime: '100%',
      buildLogs: [
        { time: '12:00:00', message: 'Domain registered and DNS zone allocated', type: 'info' },
      ],
    },
  },
];
