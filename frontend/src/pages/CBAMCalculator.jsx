import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, AlertTriangle, ShieldCheck, TrendingDown,
  Globe, Factory, Ship, Euro, Calculator, CheckCircle2, ArrowRight
} from 'lucide-react';
import {
  Card, CardHeader, Button, Badge, Input, Select, Progress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import enterpriseFeaturesService from '../services/enterpriseFeaturesService';

const SECTORS = [
  { value: 'Steel & Iron', label: 'Steel & Iron (HS Ch 72 & 73)' },
  { value: 'Aluminium', label: 'Aluminium & Articles (HS Ch 76)' },
  { value: 'Fertilizers', label: 'Fertilizers & Ammonia (HS Ch 31)' },
  { value: 'Cement', label: 'Cement & Clinker (HS Ch 25)' }
];

const ROUTES = {
  'Steel & Iron': [
    { value: 'Blast Furnace - Basic Oxygen Furnace (BF-BOF)', label: 'Blast Furnace - Basic Oxygen Furnace (BF-BOF) [Standard Indian Coal]' },
    { value: 'Electric Arc Furnace (EAF)', label: 'Electric Arc Furnace (EAF) [Scrap / Electricity]' },
    { value: 'Direct Reduced Iron (DRI) - Gas based', label: 'Direct Reduced Iron (DRI) - Gas based' }
  ],
  'Aluminium': [
    { value: 'Primary Smelting (Coal Powered)', label: 'Primary Smelting (Captive Coal Thermal Power)' },
    { value: 'Primary Smelting (Renewable Powered)', label: 'Primary Smelting (Hydro / Solar PPA)' },
    { value: 'Secondary Recycled Aluminium', label: 'Secondary Recycled Aluminium (Low Carbon)' }
  ],
  'Fertilizers': [
    { value: 'Haber-Bosch Ammonia / Urea', label: 'Haber-Bosch Ammonia / Urea (Natural Gas)' },
    { value: 'Nitric Acid', label: 'Nitric Acid Process' }
  ],
  'Cement': [
    { value: 'Portland Clinker Dry Kiln', label: 'Ordinary Portland Clinker (Dry Kiln)' },
    { value: 'Blended Pozzolana Cement', label: 'Blended Pozzolana Cement (Fly-ash Substituted)' }
  ]
};

export default function CBAMCalculator() {
  const toast = useToast();
  const [sector, setSector] = useState('Steel & Iron');
  const [route, setRoute] = useState(ROUTES['Steel & Iron'][0].value);
  const [tonnage, setTonnage] = useState(150);
  const [destination, setDestination] = useState('Germany (EU)');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);

  const calculateCBAM = async () => {
    setIsCalculating(true);
    try {
      const res = await enterpriseFeaturesService.estimateCBAM({
        product_category: sector,
        production_route: route,
        export_tonnage: parseFloat(tonnage) || 1,
        destination_country: destination
      });
      setResults(res);
      toast.success('CBAM Computed', 'Emissions intensity and financial tax liability updated.');
    } catch {
      toast.error('Calculation Error', 'Failed to calculate CBAM.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateCBAM();
  }, [sector, route]);

  const handleSectorChange = (val) => {
    setSector(val);
    setRoute(ROUTES[val][0].value);
  };

  const emissions = results?.emission_breakdown;
  const liability = results?.financial_liability;
  const pathway = results?.decarbonization_pathway;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="EU CBAM (Carbon Border Adjustment Mechanism) & ESG Intelligence"
        subtitle="Estimate embedded carbon emissions (tCO2e) and border tax liabilities for Indian exporters under Regulation (EU) 2023/956."
        icon={Leaf}
        breadcrumb={['ExportEase', 'Trade & Finance', 'EU CBAM Estimator']}
        badge={<Badge variant="primary" size="sm" dot pulse>EU ETS Synced: €78.50/t</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Calculator}
            onClick={calculateCBAM}
            loading={isCalculating}
          >
            Recalculate CBAM Liability
          </Button>
        }
      />

      {/* Top Warning Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-3">
        <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-text-muted space-y-1">
          <p className="font-semibold text-text-primary text-sm">EU CBAM Mandatory Financial Phase Enforced</p>
          <p>
            Importers into the 27 EU member states must surrender CBAM certificates matching embedded direct and indirect GHG emissions. Indian exporters without verified carbon audit dossiers face up to <strong>€100 per tonne</strong> penalties.
          </p>
        </div>
      </div>

      {/* Input Parameters & High-Level Liability Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="p-5">
            <CardHeader
              title="Consignment Carbon Parameters"
              subtitle="Production metallurgy and shipping tonnage"
            />
            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="text-text-muted block mb-1 font-medium">Export Commodity Sector</label>
                <Select
                  value={sector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  options={SECTORS}
                />
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-medium">Production Route / Metallurgy</label>
                <Select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  options={ROUTES[sector]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Export Volume (Metric Tonnes)</label>
                  <Input
                    type="number"
                    value={tonnage}
                    onChange={(e) => setTonnage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-medium">EU Destination Port</label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={Calculator}
                  onClick={calculateCBAM}
                  loading={isCalculating}
                >
                  Compute Carbon Liability
                </Button>
              </div>
            </div>
          </Card>

          {/* Decarbonization Roadmap */}
          {pathway && (
            <Card padding="p-5" className="border-l-4 border-l-emerald-500 bg-emerald-950/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="text-emerald-400" size={18} />
                <h4 className="text-sm font-bold text-text-primary">Decarbonization Tax Relief</h4>
              </div>
              <p className="text-xs text-text-muted mb-3">
                By transitioning to <strong>{pathway.recommended_process}</strong>, your enterprise can cut <strong>{pathway.emissions_reduction_tCO2e} tCO2e</strong> from this consignment.
              </p>
              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex justify-between items-center text-xs">
                <span className="text-emerald-300 font-medium">Potential Tax Savings:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  €{pathway.annualized_tax_savings_eur?.toLocaleString()} (₹{(pathway.annualized_tax_savings_inr / 100000)?.toFixed(2)} Lakhs)
                </span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Analytics & Financial Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 border-l-4 border-l-rose-500">
              <span className="text-xs text-text-muted font-medium">Total CBAM Tax (EUR)</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                €{liability?.total_cbam_liability_eur?.toLocaleString()}
              </div>
              <span className="text-[11px] text-text-muted block mt-1">
                ₹{((liability?.total_cbam_liability_inr || 0) / 100000)?.toFixed(2)} Lakhs INR
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500">
              <span className="text-xs text-text-muted font-medium">Carbon Penalty / Tonne</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                €{liability?.cost_penalty_per_tonne_eur}
              </div>
              <span className="text-[11px] text-text-muted block mt-1">
                +{liability?.cost_penalty_percentage}% landed cost impact
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-blue-500">
              <span className="text-xs text-text-muted font-medium">Emissions Intensity</span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">
                {emissions?.intensity_per_ton} <span className="text-xs font-normal">tCO2e/t</span>
              </div>
              <span className="text-[11px] text-text-muted block mt-1">
                Total: {emissions?.total_embedded_emissions_tCO2e} tCO2e
              </span>
            </Card>
          </div>

          {/* Breakdown Card */}
          <Card padding="p-5">
            <CardHeader
              title="Embedded Greenhouse Gas (GHG) Breakdown"
              subtitle="Direct scope 1, indirect electricity scope 2, and maritime transport emissions"
            />
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">Scope 1 Direct Process Emissions</span>
                  <span className="font-mono font-bold text-text-primary">{emissions?.direct_emissions_tCO2e} tCO2e</span>
                </div>
                <Progress
                  value={emissions?.total_embedded_emissions_tCO2e ? (emissions.direct_emissions_tCO2e / emissions.total_embedded_emissions_tCO2e) * 100 : 0}
                  className="h-2 bg-white/5"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">Scope 2 Indirect Grid Electricity Emissions</span>
                  <span className="font-mono font-bold text-text-primary">{emissions?.indirect_emissions_tCO2e} tCO2e</span>
                </div>
                <Progress
                  value={emissions?.total_embedded_emissions_tCO2e ? (emissions.indirect_emissions_tCO2e / emissions.total_embedded_emissions_tCO2e) * 100 : 0}
                  className="h-2 bg-white/5"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-muted">International Maritime Transport (6,500 NM)</span>
                  <span className="font-mono font-bold text-text-primary">{emissions?.transport_emissions_tCO2e} tCO2e</span>
                </div>
                <Progress
                  value={emissions?.total_embedded_emissions_tCO2e ? (emissions.transport_emissions_tCO2e / emissions.total_embedded_emissions_tCO2e) * 100 : 0}
                  className="h-2 bg-white/5"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Euro size={15} className="text-blue-400" />
                <span>EU ETS Carbon Benchmark: <strong>€78.50 / tCO2e</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Ship size={15} className="text-emerald-400" />
                <span>Low-Emission Maritime Corridor: <strong>Available via Rotterdam</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
