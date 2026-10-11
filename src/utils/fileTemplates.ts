export interface FileTemplate {
  name: string;
  filename: string;
  description: string;
  type: 'tsx' | 'html' | 'css' | 'json' | 'ts';
  content: string;
}

export const FILE_TEMPLATES: FileTemplate[] = [
  {
    name: 'React 19 + Vite Component',
    filename: 'src/components/MetricCard.tsx',
    description: 'Interactive counter & status card component with Vite styling',
    type: 'tsx',
    content: `import React, { useState } from 'react';

export function MetricCard({ title = "Active Connections", initialValue = 5902 }: { title?: string; initialValue?: number }) {
  const [metric, setMetric] = useState(initialValue);
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <span className={\`px-2 py-0.5 text-xs rounded-full \${isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}\`}>
          {isLive ? '● Live' : '○ Paused'}
        </span>
      </div>
      <div className="text-3xl font-bold text-sky-400 mb-4">{metric.toLocaleString()}</div>
      <div className="flex gap-2">
        <button
          onClick={() => setMetric(m => m + 1)}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded text-sm font-semibold transition"
        >
          Increment
        </button>
        <button
          onClick={() => setIsLive(!isLive)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-300 transition"
        >
          Toggle
        </button>
      </div>
    </div>
  );
}`,
  },
  {
    name: 'Vite Config (Port 5902)',
    filename: 'vite.config.ts',
    description: 'Vite server configuration bound to port 5902 and all hosts',
    type: 'ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite custom server configuration
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5902,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5902,
    host: '0.0.0.0',
  }
});`,
  },
  {
    name: 'Modern Landing Page (HTML5)',
    filename: 'public/index.html',
    description: 'Full HTML5 hero page with modern CSS gradient and buttons',
    type: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Cloud App</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #030712 80%);
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      padding: 24px;
    }
    .badge {
      display: inline-flex;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 13px;
      margin-bottom: 20px;
    }
    h1 { font-size: 44px; margin: 0 0 16px 0; font-weight: 800; letter-spacing: -1px; }
    p { max-width: 540px; color: #94a3b8; font-size: 17px; line-height: 1.6; margin: 0 auto 30px auto; }
    .btn {
      padding: 12px 28px;
      background: #6366f1;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn:hover { background: #4f46e5; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="badge">🚀 Deployed on Virtual Server Port 5902</div>
  <h1>Production Ready Hosting</h1>
  <p>Connected via DNS A-record to custom domain with SSL certification and low latency edge CDN.</p>
  <a href="#explore" class="btn">Explore API Endpoints</a>
</body>
</html>`,
  },
  {
    name: 'Database API Fixture (JSON)',
    filename: 'data/records.json',
    description: 'JSON structured dataset for mock REST API or data store',
    type: 'json',
    content: `{
  "status": "success",
  "endpoint": "/api/v1/records",
  "server": "vite-port-5902",
  "data": [
    { "id": 101, "name": "Production Node Alpha", "ip": "76.76.21.21", "port": 5902, "healthy": true },
    { "id": 102, "name": "Edge CDN Gateway", "ip": "104.16.12.33", "port": 443, "healthy": true },
    { "id": 103, "name": "Telemetry Worker", "ip": "172.64.80.1", "port": 8080, "healthy": true }
  ]
}`,
  },
  {
    name: 'Tailwind CSS Stylesheet',
    filename: 'src/custom.css',
    description: 'Utility styles, glow animations, and glassmorphic card styles',
    type: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glow-blue {
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);
}`,
  },
];

export function generateFileFromPrompt(prompt: string, fileName?: string): { content: string; detectedName: string; type: any } {
  const p = prompt.toLowerCase();
  
  if (p.includes('react') || p.includes('counter') || p.includes('button') || p.includes('card') || p.includes('vite')) {
    const componentName = p.includes('analytics') ? 'AnalyticsDashboard' : p.includes('user') ? 'UserProfile' : 'CustomComponent';
    return {
      detectedName: fileName || `src/components/${componentName}.tsx`,
      type: 'tsx',
      content: `import React, { useState } from 'react';

// Generated from prompt: "${prompt}"
export default function ${componentName}() {
  const [active, setActive] = useState(true);
  const [dataCount, setDataCount] = useState(128);

  return (
    <div style={{
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      border: '1px solid #334155',
      maxWidth: '480px',
      margin: '20px auto',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#38bdf8' }}>
        ⚡ ${componentName}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
        Built for React + Vite hosting on Port 5902.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setDataCount(c => c + 10)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Sync Records ({dataCount})
        </button>
        <button
          onClick={() => setActive(!active)}
          style={{
            padding: '8px 16px',
            backgroundColor: active ? '#15803d' : '#b91c1c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {active ? 'Status: Active' : 'Status: Paused'}
        </button>
      </div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>
        Prompt: "${prompt}"
      </div>
    </div>
  );
}`,
    };
  }

  if (p.includes('database') || p.includes('json') || p.includes('api') || p.includes('data')) {
    return {
      detectedName: fileName || 'src/data/db_export.json',
      type: 'json',
      content: JSON.stringify(
        {
          generated_for: prompt,
          timestamp: new Date().toISOString(),
          tables: [
            {
              name: 'customers',
              count: 3,
              records: [
                { id: 1, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Enterprise', port: 5902 },
                { id: 2, name: 'Samantha Lee', email: 'sam@developer.org', plan: 'Pro Developer', port: 5902 },
                { id: 3, name: 'David Smith', email: 'dsmith@cloud.net', plan: 'Starter', port: 3000 }
              ]
            }
          ]
        },
        null,
        2
      ),
    };
  }

  if (p.includes('html') || p.includes('landing') || p.includes('page') || p.includes('website')) {
    return {
      detectedName: fileName || 'index.html',
      type: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hosted App - Port 5902</title>
  <style>
    body {
      background: #020617;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 32px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    h1 { color: #60a5fa; margin-top: 0; }
    .tag { background: #1e3a8a; color: #93c5fd; padding: 4px 12px; border-radius: 99px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="tag">⚡ React Vite 5902 Host</span>
    <h1>${prompt.slice(0, 35)}</h1>
    <p>Custom generated page powered by Virtual Cloud Hosting file manager.</p>
    <p style="color: #64748b; font-size: 13px;">DNS propagated to edge servers.</p>
  </div>
</body>
</html>`,
    };
  }

  // Default code fallback
  return {
    detectedName: fileName || 'script.js',
    type: 'js',
    content: `// Code generated for prompt: "${prompt}"
console.log("Server initialized on port 5902");

export function runTask() {
  const status = {
    online: true,
    port: 5902,
    service: "${prompt}",
    timestamp: new Date().toISOString()
  };
  return status;
}
`,
  };
}
