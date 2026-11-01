import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Bell, Globe, Shield, Plug, Sparkles,
  Building2, CheckCircle2, RefreshCw, Compass, Key,
  Lock, Download, ExternalLink, HelpCircle
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { Card, CardHeader, CardFooter, Badge, Button, Input, Tabs, useToast } from '../components/ui';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { COMPANY } from '../data/dashboardData';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Business Profile', icon: User },
  { id: 'demo', label: 'Demo Exporter Profiles', icon: Sparkles },
  { id: 'integrations', label: 'API Integrations', icon: Plug },
  { id: 'security', label: 'Security & Keys', icon: Shield },
];

function ProfileTab({ toast }) {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Admin User',
    legalName: user?.legalName || 'Your Company Legal Name',
    iec: user?.iec || COMPANY.iec,
    gstin: user?.gstin || COMPANY.gstin,
    origin: user?.origin || COMPANY.origin,
    product: user?.product || COMPANY.product,
    hsCode: user?.hsCode || COMPANY.hsCode,
    email: user?.email || 'admin@yourcompany.com',
  });

  const handleSave = () => {
    updateProfile({
      companyName: profile.name,
      legalName: profile.legalName,
      iec: profile.iec,
      gstin: profile.gstin,
      origin: profile.origin,
      product: profile.product,
      hsCode: profile.hsCode,
    });
    toast.success('Profile Saved', 'MSME export credentials updated successfully.');
  };


  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-primary">Registered MSME Exporter Profile</h3>
            <p className="text-xs text-muted">Official credentials utilized across AI document generation and customs declarations</p>
          </div>
          <Badge variant="success" size="xs" dot>DGFT IEC Active</Badge>
        </div>

        <div className="space-y-4 text-xs">
          <Input
            label="Enterprise Legal Name"
            value={profile.legalName}
            onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="DGFT IEC Number"
              value={profile.iec}
              onChange={(e) => setProfile({ ...profile, iec: e.target.value })}
            />
            <Input
              label="GSTIN Identification"
              value={profile.gstin}
              onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Primary Export Product"
              value={profile.product}
              onChange={(e) => setProfile({ ...profile, product: e.target.value })}
            />
            <Input
              label="HS Tariff Code"
              value={profile.hsCode}
              onChange={(e) => setProfile({ ...profile, hsCode: e.target.value })}
            />
          </div>
          <Input
            label="Manufacturing Origin Hub"
            value={profile.origin}
            onChange={(e) => setProfile({ ...profile, origin: e.target.value })}
          />

          <div className="pt-2">
            <Button size="sm" onClick={handleSave}>
              Save Profile Changes
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-primary mb-4">TradeAI Autonomous Capabilities</h3>
        <div className="space-y-3 text-xs">
          {[
            { label: 'Automated OCR entity extraction on upload', desc: 'Auto-detect line items from PDF commercial invoices' },
            { label: 'Real-time CEPA tariff concession monitoring', desc: 'Scan bilateral FTA tariff rate changes every 24 hours' },
            { label: 'Automated USD/INR forward hedging alerts', desc: 'Send high-volatility notifications when 48h swing > 0.7%' },
            { label: 'Verified buyer credit rating verification', desc: 'Cross-check importer Dun & Bradstreet rating' },
          ].map((pref) => (
            <label key={pref.label} className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-base cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-secondary block">{pref.label}</span>
                <span className="text-[10px] text-muted">{pref.desc}</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-[#1746D2] border-medium" />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DemoTab({ navigate, toast }) {
  const { user, switchProfile } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6 bg-gradient-to-r from-blue-50/50 to-white border-indigo-900/50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#1746D2]" />
            <h3 className="text-sm font-bold text-primary">Pre-Configured MSME Demonstration Profiles</h3>
          </div>
          <Badge variant="primary" size="xs">Preset Catalog</Badge>
        </div>

        <p className="text-xs text-muted leading-relaxed mb-4">
          ExportEase AI includes pre-populated enterprise profiles with verified HS codes, real-world buyer matches, and realistic customs documents for seamless evaluation.
        </p>

        <div className="space-y-3">
          {Object.values(DEMO_PROFILES).map((p) => {
            const isActive = user?.companyName === p.name || (p.id === 'usha' && !user?.companyName);
            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-surface-card backdrop-blur-md border border-base hover:border-[#1746D2] transition-all flex items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{p.name}</span>
                    <Badge variant="navy" size="xs">{p.origin}</Badge>
                  </div>
                  <p className="text-[11px] text-muted">{p.product} (HS {p.hsCode})</p>
                  <p className="text-[10px] text-emerald-700 font-mono">Target: {p.targetMarkets.join(', ')}</p>
                </div>

                <Button
                  variant={isActive ? 'primary' : 'outline'}
                  size="xs"
                  onClick={() => {
                    switchProfile(p.id);
                    toast.success('Loaded Profile', `Switched active demo context to ${p.name}.`);
                    navigate('/dashboard');
                  }}
                >
                  {isActive ? 'Active Profile ✓' : 'Load Profile'}
                </Button>
              </div>
            );
          })}
        </div>


        <div className="mt-5 pt-4 border-t border-base flex items-center justify-between">
          <span className="text-xs text-muted">Want to test the full setup flow?</span>
          <Button
            variant="ai"
            size="sm"
            icon={Compass}
            onClick={() => navigate('/onboarding')}
          >
            Launch Onboarding Tour
          </Button>
        </div>
      </Card>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-4 max-w-2xl">
      {[
        { name: 'ICEGATE Customs EDI', desc: 'Direct shipping bill filing & RoDTEP cash rebate claims', status: 'connected', color: 'success' },
        { name: 'DGFT Trade Licensing Portal', desc: 'Electronic IEC validation and advance authorization', status: 'connected', color: 'success' },
        { name: 'FastAPI AI Engine Backend', desc: 'DeepSeek-R1 / Llama 3.3 agentic reasoning service endpoint', status: 'connected', color: 'success' },
        { name: 'CBIC Tariff API', desc: 'Indian Customs ITC-HS tariff schedule verification', status: 'connected', color: 'success' },
        { name: 'RBI Reference Rates Feed', desc: 'Forex interbank benchmark rate telemetry', status: 'connected', color: 'success' },
      ].map((integration) => (
        <Card key={integration.name} className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-bold text-primary">{integration.name}</p>
              <Badge variant={integration.color} size="xs" dot>
                {integration.status === 'connected' ? 'Active Gateway' : 'Not Connected'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted">{integration.desc}</p>
          </div>
          <Button
            variant="outline"
            size="xs"
          >
            Configure
          </Button>
        </Card>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('demo');
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Settings"
        subtitle="Manage your MSME registration, demo profile, and trade API integrations."
        icon={Settings}
        breadcrumb={['ExportEase', 'Settings']}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6 w-fit"
        variant="pill"
      />

      {activeTab === 'profile' && <ProfileTab toast={toast} />}
      {activeTab === 'demo' && <DemoTab navigate={navigate} toast={toast} />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'security' && (
        <Card className="max-w-2xl p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-primary">Cryptographic API Tokens & Secrets</h3>
            <p className="text-xs text-muted">Manage enterprise authentication keys for customs microservices</p>
          </div>
          <div className="space-y-3">
            <Input
              label="FastAPI Backend Endpoint"
              defaultValue="http://127.0.0.1:8000/api/v1"
              readOnly
            />
            <Input
              label="DGFT EDI Public Key Fingerprint"
              defaultValue="SHA256:4a8f9c2d1b7e6f3a0c5d8e9f2a1b4c7d"
              readOnly
            />
          </div>
        </Card>
      )}
    </div>
  );
}
