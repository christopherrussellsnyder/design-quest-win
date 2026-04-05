import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorFallback } from "@/components/ErrorFallback";
import { usePageTracking } from "@/lib/analytics";
import { lazy, Suspense, Component, ReactNode } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Lazy load components
const AIStrategist = lazy(() => import("./pages/AIStrategist"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const ContentStrategies = lazy(() => import("./pages/ContentStrategies"));
const Insights = lazy(() => import("./pages/Insights"));
const MediaLibrary = lazy(() => import("./pages/MediaLibrary"));
const Settings = lazy(() => import("./pages/Settings"));

const HealthCheck = lazy(() => import("./pages/HealthCheck"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));


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
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="text-center">
      <div className="arasaka-spinner mx-auto mb-4 w-12 h-12"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Analytics tracker component
const AnalyticsTracker = ({ children }: { children: ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
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
                  
                  {/* Admin-only health check */}
                  <Route
                    path="/health"
                    element={
                      <ProtectedRoute>
                        <HealthCheck />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Backward-compatible redirects */}
                  <Route path="/dashboard" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/scheduler" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/campaigns" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/analytics" element={<Navigate to="/insights" replace />} />
                  <Route path="/ab-testing" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/audience" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/content-ai" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/ai-analytics" element={<Navigate to="/insights" replace />} />
                  <Route path="/audience-intelligence" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/ai-assistant" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/intelligence" element={<Navigate to="/ai-strategist" replace />} />
                  <Route path="/media-library" element={<Navigate to="/media" replace />} />
                  <Route path="/business-settings" element={<Navigate to="/settings" replace />} />
                  <Route path="/accept-invite/:token" element={<Navigate to="/ai-strategist" replace />} />
                  
                  {/* Main Routes (5 core pages) */}
                  <Route
                    path="/ai-strategist"
                    element={
                      <ProtectedRoute>
                        <AIStrategist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/content-library"
                    element={
                      <ProtectedRoute>
                        <ContentLibrary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/strategies"
                    element={
                      <ProtectedRoute>
                        <ContentStrategies />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/strategies/:id"
                    element={
                      <ProtectedRoute>
                        <ContentStrategies />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/insights"
                    element={
                      <ProtectedRoute>
                        <Insights />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/media"
                    element={
                      <ProtectedRoute>
                        <MediaLibrary />
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
                  
                  {/* Static Pages */}
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookies" element={<Cookies />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnalyticsTracker>
          </AuthProvider>
        </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
