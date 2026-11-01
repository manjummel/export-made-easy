import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import ProductAnalysis from '../pages/ProductAnalysis';
import HSCodeFinder from '../pages/HSCodeFinder';

import DocumentProcedure from '../pages/DocumentProcedure';
import AgentsCommandCenter from '../pages/AgentsCommandCenter';
import ComplianceCenter from '../pages/ComplianceCenter';
import Documents from '../pages/Documents';
import Certifications from '../pages/Certifications';
import RiskCenter from '../pages/RiskCenter';
import ExportRoadmap from '../pages/ExportRoadmap';
import VerifiedSources from '../pages/VerifiedSources';
import AIConsultant from '../pages/AIConsultant';
import SmartRecommendations from '../pages/SmartRecommendations';
import MarketIntelligence from '../pages/MarketIntelligence';
import DemandForecast from '../pages/DemandForecast';
import TradePolicies from '../pages/TradePolicies';
import BuyerDiscovery from '../pages/BuyerDiscovery';
import CurrencyRisk from '../pages/CurrencyRisk';
import Analytics from '../pages/Analytics';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import DesignSystem from '../pages/DesignSystem';
import Onboarding from '../pages/Onboarding';
import GlobalExportDashboard from '../pages/GlobalExportDashboard';
import DocumentAuditStudio from '../pages/DocumentAuditStudio';
import CBAMCalculator from '../pages/CBAMCalculator';
import RegulatoryRadar from '../pages/RegulatoryRadar';
import TradeFinanceHub from '../pages/TradeFinanceHub';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Onboarding Standalone Page */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Main App Layout Routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product-analysis" element={<ProductAnalysis />} />
        <Route path="/hs-finder" element={<HSCodeFinder />} />

        <Route path="/document-procedure" element={<DocumentProcedure />} />
        <Route path="/document-audit" element={<DocumentAuditStudio />} />
        <Route path="/cbam-calculator" element={<CBAMCalculator />} />
        <Route path="/regulatory-radar" element={<RegulatoryRadar />} />
        <Route path="/trade-finance" element={<TradeFinanceHub />} />
        <Route path="/agents" element={<AgentsCommandCenter />} />
        <Route path="/compliance" element={<ComplianceCenter />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/risk" element={<RiskCenter />} />
        <Route path="/roadmap" element={<ExportRoadmap />} />
        <Route path="/sources" element={<VerifiedSources />} />

        <Route path="/ai-consultant" element={<AIConsultant />} />
        <Route path="/smart-recommendations" element={<SmartRecommendations />} />
        <Route path="/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/demand-forecast" element={<DemandForecast />} />
        <Route path="/trade-policies" element={<TradePolicies />} />
        <Route path="/buyer-discovery" element={<BuyerDiscovery />} />
        <Route path="/currency-risk" element={<CurrencyRisk />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/global-metrics" element={<GlobalExportDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/design-system" element={<DesignSystem />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
