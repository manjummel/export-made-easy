import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, Globe, ShieldCheck, Mail, Edit3, Award } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { COMPANY } from '../data/dashboardData';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fullName = user?.fullName || 'Admin User';
  const email = user?.email || 'admin@yourcompany.com';
  const role = user?.role || 'Export Manager';
  const companyName = user?.companyName || COMPANY.name;
  const iecCode = user?.iec || COMPANY.iec;
  const gstin = user?.gstin || COMPANY.gstin;
  const origin = user?.origin || COMPANY.origin;
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Exporter Profile"
        subtitle="Your enterprise account, export credentials, and organizational settings."
        icon={User}
        breadcrumb={['ExportEase', 'Profile']}
        actions={<Button variant="outline" size="sm" icon={Edit3} onClick={() => navigate('/settings')}>Edit Profile</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* User Card */}
        <Card className="lg:col-span-4 p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B1736] via-[#1746D2] to-[#2563EB] text-primary font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md border-2 border-white">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-primary">{fullName}</h2>
            <p className="text-xs text-muted">Export Manager</p>
            <p className="text-xs font-semibold text-[#1746D2] mt-0.5">{companyName}</p>
          </div>


          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-muted block font-semibold">Member Since</span>
              <span className="font-bold text-secondary">June 2024</span>
            </div>
            <div>
              <span className="text-[10px] text-muted block font-semibold">Exports Completed</span>
              <span className="font-bold text-emerald-700 font-mono">24</span>
            </div>
            <div>
              <span className="text-[10px] text-muted block font-semibold">Buyers Connected</span>
              <span className="font-bold text-[#1746D2] font-mono">36</span>
            </div>
          </div>
        </Card>

        {/* Business Credentials Card */}
        <Card className="lg:col-span-8 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-primary">Business Registration Credentials</h3>
            <p className="text-xs text-muted">Verified MSME information utilized in customs declarations & Certificate of Origin</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface-subtle rounded-xl border border-base">
              <span className="text-muted block">Company Name</span>
              <span className="font-bold text-primary">{companyName}</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-base">
              <span className="text-muted block">DGFT IEC Code</span>
              <span className="font-mono font-bold text-primary">{iecCode}</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-base">
              <span className="text-muted block">GSTIN Identification</span>
              <span className="font-mono font-bold text-primary">{gstin}</span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl border border-base">
              <span className="text-muted block">Manufacturing Origin</span>
              <span className="font-bold text-primary">{origin}</span>
            </div>
          </div>

        </Card>
      </div>
    </div>
  );
}
