import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Building2, Package, Globe, ShieldCheck,
  TrendingUp, Check, ChevronRight, ChevronLeft, ArrowRight,
  Compass, FileCheck, Users, CheckCircle2, DollarSign
} from 'lucide-react';

import {
  Button, Card, Badge, Input,
  CircularProgress, useToast
} from '../components/ui';
import { CinematicBackground } from '../components/layout';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { useAuth } from '../context/AuthContext';
import msmeService from '../services/msmeService';
import projectService from '../services/projectService';
import workflowService from '../services/workflowService';

export default function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const { updateProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form State initialized with Generic Preset
  const [formData, setFormData] = useState({
    businessName: 'Your Company Legal Name',
    category: 'Selected Category',
    productDetail: 'Your Core Product',
    iecCode: 'AAICU9823D',
    gstin: '33AAICU9823D1Z4',
    productName: 'Premium Organic Cotton Shirts',
    productCategory: 'Textiles & Apparel',
    hsCode: '6205.20.00',
    originState: 'Tamil Nadu, India',
    city: 'Tirupur',
    capacity: '25,000 units/month',
    experienceLevel: 'occasional', // 'first_time' | 'occasional' | 'established'
    targetRegions: ['me', 'eu', 'apac'],
    primaryGoal: 'find_buyers', // 'find_buyers' | 'compliance' | 'tariffs' | 'hedging'
  });

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleRegion = (regId) => {
    setFormData((prev) => ({
      ...prev,
      targetRegions: prev.targetRegions.includes(regId)
        ? prev.targetRegions.filter((r) => r !== regId)
        : [...prev.targetRegions, regId],
    }));
  };

  // 1-Click Load Preset
  const handleLoadPreset = (profileKey) => {
    const p = DEMO_PROFILES[profileKey] || DEMO_PROFILES.usha;
    setFormData({
      businessName: p.legalName,
      originState: p.origin,
      city: p.city,
      iecCode: p.iec,
      gstin: p.gstin,
      productName: p.product,
      productCategory: p.category,
      hsCode: p.hsCode,
      capacity: p.capacity,
      experienceLevel: p.experience,
      targetRegions: p.targetRegions || ['me', 'eu'],
      primaryGoal: p.goal || 'find_buyers',
    });
    toast.success('Preset Loaded', `Applied "${p.name}" profile parameters.`);
  };

  const handleComplete = async () => {
    setIsCompleted(true);
    toast.ai('Synthesizing Profile', 'Registering MSME export credentials and configuring workflow engine...');

    try {
      // 1. Create / Update MSME Profile in backend
      const profile = await msmeService.createProfile({
        company_name: formData.businessName,
        iec_code: formData.iecCode,
        gstin: formData.gstin,
        city: formData.city,
        state: formData.originState,
        industry_sector: formData.productCategory,
      });

      const profileId = profile?.id || 'msme-001';

      // 2. Create Business & Product in backend
      const business = await msmeService.createBusiness({
        msme_id: profileId,
        business_name: formData.businessName,
      });

      const businessId = business?.id || 'biz-001';

      const product = await msmeService.createProduct({
        business_id: businessId,
        product_name: formData.productName,
        category: formData.productCategory,
        hs_code: formData.hsCode,
      });

      // 3. Create Export Project
      const project = await projectService.createProject({
        msme_id: profileId,
        product_id: product?.id,
        project_name: `${formData.productName} Export Corridor`,
        destination_country: formData.targetRegions.includes('me') ? 'United Arab Emirates' : 'Germany',
        user_query: `Export ${formData.productName} from ${formData.city}, ${formData.originState}`,
      });

      if (project?.id) {
        // 4. Initialize 10-step autonomous workflow
        await workflowService.initializeWorkflow(project.id);
      }

      // Update local auth context
      updateProfile({
        companyName: formData.businessName,
        iec: formData.iecCode,
        gstin: formData.gstin,
        origin: `${formData.city}, ${formData.originState}`,
        product: formData.productName,
        hsCode: formData.hsCode,
      });
    } catch (err) {
      console.warn('[Onboarding] Integration fallback:', err.message);
    }

    setTimeout(() => {
      navigate('/dashboard');
      toast.success('Setup Complete', 'Welcome to your ExportEase AI Command Center.');
    }, 1800);
  };


  return (
    <div className="relative min-h-screen bg-transparent text-primary flex flex-col font-sans px-4 overflow-hidden">
      {/* ── Cinematic Adaptive Background Layer ── */}
      <CinematicBackground />

      {/* Top Bar */}
      <div className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-[var(--color-border-base)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B1736] via-[#1746D2] to-[#2563EB] flex items-center justify-center text-primary shadow-md">
            <Compass size={18} />
          </div>
          <div>
            <span className="text-sm font-extrabold text-[var(--color-primary)] tracking-tight">EXPORTease AI</span>
            <span className="text-[10px] text-muted block">MSME Exporter Onboarding</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Compass} onClick={() => handleLoadPreset('usha')}>
            Load Demo Company Preset
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-3xl w-full mx-auto my-8">
        {!isCompleted ? (
          <div className="space-y-6">
            {/* Stepper Indicator */}
            <div className="rounded-2xl border border-base bg-surface-card backdrop-blur-md p-4 shadow-md">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-surface-base -z-0" />
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#1746D2] transition-all duration-300 -z-0"
                  style={{ width: `${((currentStep - 1) / 4) * 88}%` }}
                />

                {[
                  { num: 1, label: 'Profile' },
                  { num: 2, label: 'Product' },
                  { num: 3, label: 'Experience' },
                  { num: 4, label: 'Markets' },
                  { num: 5, label: 'Goals' },
                ].map((s) => {
                  const isCurrent = currentStep === s.num;
                  const isDone = currentStep > s.num;

                  return (
                    <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-surface-card backdrop-blur-md px-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-[#1746D2] text-primary ring-4 ring-blue-500/15 shadow-md'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-surface-base text-muted border border-base'
                        }`}
                      >
                        {isDone ? <Check size={14} /> : s.num}
                      </div>
                      <span
                        className={`text-[10px] font-semibold hidden sm:block ${
                          isCurrent ? 'text-[#1746D2]' : isDone ? 'text-secondary' : 'text-muted'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Card Form Body */}
            <Card className="p-6 sm:p-8 shadow-lg border-base bg-surface-card backdrop-blur-md">
              <AnimatePresence mode="wait">
                {/* STEP 1: Business Profile */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <Badge variant="primary" size="xs">Step 1 of 5</Badge>
                      <h2 className="text-base font-bold text-primary mt-1">Business & Legal Profile</h2>
                      <p className="text-xs text-muted">Enter your Indian manufacturing company and tax registration details</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          label="Enterprise Legal Name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          placeholder="e.g. Your Company Legal Name"
                          required
                        />
                      </div>
                      <Input
                        label="Manufacturing Origin State"
                        value={formData.originState}
                        onChange={(e) => handleInputChange('originState', e.target.value)}
                        placeholder="e.g. Tamil Nadu, India"
                        required
                      />
                      <Input
                        label="Industrial Cluster City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g. Tirupur / Surat / Moradabad"
                        required
                      />
                      <Input
                        label="DGFT Import Export Code (IEC)"
                        value={formData.iecCode}
                        onChange={(e) => handleInputChange('iecCode', e.target.value)}
                        placeholder="10-digit alphanumeric IEC"
                        required
                      />
                      <Input
                        label="GSTIN Number"
                        value={formData.gstin}
                        onChange={(e) => handleInputChange('gstin', e.target.value)}
                        placeholder="15-digit GSTIN"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Product & Capacity */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <Badge variant="primary" size="xs">Step 2 of 5</Badge>
                      <h2 className="text-base font-bold text-primary mt-1">Export Product Details</h2>
                      <p className="text-xs text-muted">Specify your manufacturing portfolio and tariff classification</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          label="Product Catalog Title"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          placeholder="e.g. Premium Organic Cotton Shirts"
                          required
                        />
                      </div>
                      <Input
                        label="Product Sector / Category"
                        value={formData.productCategory}
                        onChange={(e) => handleInputChange('productCategory', e.target.value)}
                        placeholder="e.g. Textiles & Apparel"
                        required
                      />
                      <Input
                        label="Harmonized System Code (HS Code)"
                        value={formData.hsCode}
                        onChange={(e) => handleInputChange('hsCode', e.target.value)}
                        placeholder="e.g. 6205.20.00"
                        required
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="Monthly Manufacturing Export Capacity"
                          value={formData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          placeholder="e.g. 25,000 units/month"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Experience Level */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <Badge variant="primary" size="xs">Step 3 of 5</Badge>
                      <h2 className="text-base font-bold text-primary mt-1">Export Experience Baseline</h2>
                      <p className="text-xs text-muted">Helps AI customize regulatory guidance and documentation assistance</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'first_time', title: 'First-Time Exporter', desc: 'Seeking end-to-end guidance from HS classification to buyer inquiries.' },
                        { id: 'occasional', title: 'Occasional Exporter', desc: 'Currently executing 1–5 consignments annually; looking to scale volume.' },
                        { id: 'established', title: 'Established Export House', desc: 'Regular international shipments; seeking automation and tariff optimization.' },
                      ].map((exp) => (
                        <div
                          key={exp.id}
                          onClick={() => handleInputChange('experienceLevel', exp.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            formData.experienceLevel === exp.id
                              ? 'bg-indigo-950/50/70 border-[#1746D2] shadow-md'
                              : 'bg-surface-subtle border-base hover:border-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-primary">{exp.title}</h4>
                            {formData.experienceLevel === exp.id && <CheckCircle2 size={16} className="text-[#1746D2]" />}
                          </div>
                          <p className="text-xs text-muted mt-1">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Target Regions */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <Badge variant="primary" size="xs">Step 4 of 5</Badge>
                      <h2 className="text-base font-bold text-primary mt-1">Target International Corridors</h2>
                      <p className="text-xs text-muted">Select regions where you want to benchmark demand and buyers</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'me', name: 'Middle East & GCC', flag: '🇦🇪', desc: 'India-UAE CEPA 0% duty corridor' },
                        { id: 'eu', name: 'European Union (EU)', flag: '🇪🇺', desc: 'EU GSP preferential tariff' },
                        { id: 'us', name: 'North America (USA)', flag: '🇺🇸', desc: 'High-volume consumer market' },
                        { id: 'apac', name: 'Asia Pacific & ASEAN', flag: '🇸🇬', desc: 'Tech-enabled trade clearance' },
                      ].map((reg) => {
                        const isSelected = formData.targetRegions.includes(reg.id);
                        return (
                          <div
                            key={reg.id}
                            onClick={() => handleToggleRegion(reg.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/50/70 border-[#1746D2] shadow-md'
                                : 'bg-surface-subtle border-base hover:border-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">{reg.flag}</span>
                              {isSelected && <CheckCircle2 size={16} className="text-[#1746D2]" />}
                            </div>
                            <h4 className="text-xs font-bold text-primary mt-2">{reg.name}</h4>
                            <p className="text-[11px] text-muted mt-0.5">{reg.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Strategic Goals */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <Badge variant="primary" size="xs">Step 5 of 5</Badge>
                      <h2 className="text-base font-bold text-primary mt-1">Primary Expansion Priority</h2>
                      <p className="text-xs text-muted">Select what you would like ExportEase AI to prioritize first</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'find_buyers', title: 'Find Verified Buyers', desc: 'Match with Dun & Bradstreet accredited importers' },
                        { id: 'compliance', title: 'Compliance & Origin Checks', desc: 'Audit REX, Form AI, and chemical safety rules' },
                        { id: 'tariffs', title: 'Optimize FTA Tariffs', desc: 'Maximize 0% duty concessions under CEPA & GSP' },
                        { id: 'hedging', title: 'Forex Risk & Hedging', desc: 'Protect USD/INR operating margins' },
                      ].map((g) => (
                        <div
                          key={g.id}
                          onClick={() => handleInputChange('primaryGoal', g.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            formData.primaryGoal === g.id
                              ? 'bg-indigo-950/50/70 border-[#1746D2] shadow-md'
                              : 'bg-surface-subtle border-base hover:border-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-primary">{g.title}</h4>
                            {formData.primaryGoal === g.id && <CheckCircle2 size={16} className="text-[#1746D2]" />}
                          </div>
                          <p className="text-[11px] text-muted mt-1">{g.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Navigation Controls */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                {currentStep > 1 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    onClick={() => setCurrentStep((c) => c - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    iconRight={ChevronRight}
                    onClick={() => setCurrentStep((c) => c + 1)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    iconRight={Sparkles}
                    onClick={handleComplete}
                  >
                    Launch Workspace
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-card backdrop-blur-md rounded-2xl border border-base shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 text-[#1746D2] flex items-center justify-center mx-auto border border-blue-100">
              <Sparkles size={24} className="animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-primary">Configuring Export Intelligence Engine...</h2>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Synchronizing 7 trade agents with DGFT schedules, CBIC tariff line 6205.20, and CEPA concessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
