import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";

// Lazy load heavy components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const ContentAI = lazy(() => import("./pages/ContentAI"));
const Scheduler = lazy(() => import("./pages/Scheduler"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(222 47% 5%)', color: 'hsl(210 40% 98%)' }}>
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'hsl(263 70% 65%)', borderTopColor: 'transparent' }}></div>
      <p style={{ color: 'hsl(215 16% 59%)' }}>Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;