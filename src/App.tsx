import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorFallback } from "@/components/ErrorFallback";
import { usePageTracking } from "@/lib/analytics";
import { lazy, Suspense, Component, ReactNode } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";

// Lazy load heavy components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const ContentAI = lazy(() => import("./pages/ContentAI"));
const Scheduler = lazy(() => import("./pages/Scheduler"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const CampaignDashboard = lazy(() => import("./pages/CampaignDashboard"));
const CampaignBuilder = lazy(() => import("./pages/CampaignBuilder"));
const Settings = lazy(() => import("./pages/Settings"));
const Audience = lazy(() => import("./pages/Audience"));
const AudienceDetail = lazy(() => import("./pages/AudienceDetail"));
const MediaLibrary = lazy(() => import("./pages/MediaLibrary"));
const AIAnalytics = lazy(() => import("./pages/AIAnalytics"));
const HealthCheck = lazy(() => import("./pages/HealthCheck"));
const TestingDashboard = lazy(() => import("./pages/TestingDashboard"));
const ABTesting = lazy(() => import("./pages/ABTesting"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Templates = lazy(() => import("./pages/Templates"));

const queryClient = new QueryClient();

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(222 47% 5%)', color: 'hsl(210 40% 98%)' }}>
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'hsl(263 70% 65%)', borderTopColor: 'transparent' }}></div>
      <p style={{ color: 'hsl(215 16% 59%)' }}>Loading...</p>
    </div>
  </div>
);

// Analytics tracker component
const AnalyticsTracker = ({ children }: { children: ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <AnalyticsTracker>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                  <Route path="/health" element={<HealthCheck />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route
                    path="/content-library"
                    element={
                      <ProtectedRoute>
                        <ContentLibrary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/content-ai"
                    element={
                      <ProtectedRoute>
                        <ContentAI />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/scheduler"
                    element={
                      <ProtectedRoute>
                        <Scheduler />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns"
                    element={
                      <ProtectedRoute>
                        <Campaigns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaigns/:id"
                    element={
                      <ProtectedRoute>
                        <CampaignDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campaign-builder"
                    element={
                      <ProtectedRoute>
                        <CampaignBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audience"
                    element={
                      <ProtectedRoute>
                        <Audience />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audience/:id"
                    element={
                      <ProtectedRoute>
                        <AudienceDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/media-library"
                    element={
                      <ProtectedRoute>
                        <MediaLibrary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-analytics"
                    element={
                      <ProtectedRoute>
                        <AIAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/testing"
                    element={
                      <ProtectedRoute>
                        <TestingDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ab-testing"
                    element={
                      <ProtectedRoute>
                        <ABTesting />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route
                    path="/templates"
                    element={
                      <ProtectedRoute>
                        <Templates />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnalyticsTracker>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;