/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DomainItem } from './types';
import { INITIAL_DOMAINS } from './utils/initialData';
import { Navbar } from './components/Navbar';
import { DomainList } from './components/DomainList';
import { DomainSearchBuy } from './components/DomainSearchBuy';
import { DomainDetail } from './components/DomainDetail';
import { LivePreviewModal } from './components/hosting/LivePreviewModal';
import { DeployModal } from './components/hosting/DeployModal';
import { HostsFileModal } from './components/dns/HostsFileModal';

import { deployRealDomainFiles } from './utils/realApi';

const STORAGE_KEY = 'apexhost_domains_v3';

export default function App() {
  const [domains, setDomains] = useState<DomainItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('apexhost_domains_v2') || localStorage.getItem('apexhost_domains_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: DomainItem) => {
            if (d.name === 'neural-stack.ai') {
              const updatedFiles = (d.files || []).map((f) => ({
                ...f,
                content: (f.content || '').replace(/5902/g, '3000'),
              }));
              return {
                ...d,
                port: 3000,
                files: updatedFiles.length > 0 ? updatedFiles : (INITIAL_DOMAINS.find(x => x.name === 'neural-stack.ai')?.files || d.files),
                deployment: {
                  ...d.deployment,
                  port: 3000,
                  previewUrl: 'http://neural-stack.ai:3000',
                  status: 'live',
                  lastDeployedAt: 'Just now (Published to http://neural-stack.ai:3000)',
                },
              };
            }
            return d;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse cached domains', e);
    }
    return INITIAL_DOMAINS;
  });

  const [activeTab, setActiveTab] = useState<'domains' | 'search' | 'detail' | 'preview-hub'>('domains');
  const [selectedDomainId, setSelectedDomainId] = useState<string>(() => {
    return 'dom-neural';
  });
  
  // Modals
  const [previewDomain, setPreviewDomain] = useState<DomainItem | null>(() => {
    return domains.find(d => d.name === 'neural-stack.ai') || domains[0] || null;
  });
  const [deployDomain, setDeployDomain] = useState<DomainItem | null>(null);
  const [isGlobalHostsModalOpen, setIsGlobalHostsModalOpen] = useState(false);

  // Sync to real server on mount
  useEffect(() => {
    const neural = domains.find(d => d.name === 'neural-stack.ai');
    if (neural) {
      deployRealDomainFiles('neural-stack.ai', 3000, neural.files);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
    } catch (e) {
      console.error('Failed to save domains', e);
    }
  }, [domains]);

  const selectedDomain = domains.find(d => d.id === selectedDomainId) || domains[0] || null;

  const handleUpdateDomain = (updated: DomainItem) => {
    setDomains(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  const handleDeleteDomain = (domainId: string) => {
    setDomains(prev => {
      const remaining = prev.filter(d => d.id !== domainId);
      if (selectedDomainId === domainId && remaining.length > 0) {
        setSelectedDomainId(remaining[0].id);
      }
      return remaining;
    });
    if (activeTab === 'detail') {
      setActiveTab('domains');
    }
  };

  const handlePurchaseDomain = (newDomain: DomainItem) => {
    setDomains(prev => [newDomain, ...prev]);
    setSelectedDomainId(newDomain.id);
    setActiveTab('detail');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all domains and configurations to initial starter dataset?')) {
      localStorage.removeItem(STORAGE_KEY);
      setDomains(INITIAL_DOMAINS);
      setSelectedDomainId(INITIAL_DOMAINS[0].id);
      setActiveTab('domains');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        domains={domains}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDomain={selectedDomain}
        onSelectDomain={domain => {
          setSelectedDomainId(domain.id);
          setActiveTab('detail');
        }}
        onResetData={handleResetData}
        onOpenHostsModal={() => setIsGlobalHostsModalOpen(true)}
        onPublishNeuralStack={() => {
          const target = domains.find(d => d.name === 'neural-stack.ai') || selectedDomain || domains[0];
          setDeployDomain(target);
        }}
        onOpenBrowser={() => {
          const target = domains.find(d => d.name === 'neural-stack.ai') || selectedDomain || domains[0];
          setPreviewDomain(target);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'domains' && (
          <DomainList
            domains={domains}
            onSelectDomain={domain => {
              setSelectedDomainId(domain.id);
              setActiveTab('detail');
            }}
            onDeleteDomain={handleDeleteDomain}
            onOpenSearch={() => setActiveTab('search')}
            onOpenPreview={domain => setPreviewDomain(domain)}
          />
        )}

        {activeTab === 'search' && (
          <DomainSearchBuy
            onPurchaseDomain={handlePurchaseDomain}
            existingDomainNames={domains.map(d => d.name)}
          />
        )}

        {activeTab === 'detail' && selectedDomain && (
          <DomainDetail
            domain={selectedDomain}
            onBack={() => setActiveTab('domains')}
            onUpdateDomain={handleUpdateDomain}
            onDeleteDomain={handleDeleteDomain}
            onOpenPreview={domain => setPreviewDomain(domain)}
            onTriggerDeploy={domain => setDeployDomain(domain)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ApexHost Cloud Engine • Vite React Port 3000 • Anycast Server 76.76.21.21
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>DNS In Sync (Port 3000)</span>
            </span>
            <span>•</span>
            <span>Automated SSL Enabled</span>
          </div>
        </div>
      </footer>

      {/* Live Preview Modal */}
      {previewDomain && (
        <LivePreviewModal
          domain={previewDomain}
          isOpen={!!previewDomain}
          onClose={() => setPreviewDomain(null)}
        />
      )}

      {/* 1-Minute Publish / Deploy Modal */}
      {deployDomain && (
        <DeployModal
          domain={deployDomain}
          isOpen={!!deployDomain}
          onClose={() => setDeployDomain(null)}
          onDeploymentComplete={handleUpdateDomain}
          onOpenLivePreview={() => {
            setPreviewDomain(deployDomain);
          }}
        />
      )}

      {/* Global /etc/hosts Virtual DNS Resolver Modal */}
      <HostsFileModal
        domain={selectedDomain?.name || 'neural-stack.ai'}
        isOpen={isGlobalHostsModalOpen}
        onClose={() => setIsGlobalHostsModalOpen(false)}
        serverPort={selectedDomain?.port || 5902}
      />
    </div>
  );
}
