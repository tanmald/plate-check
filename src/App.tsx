import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Home from "./pages/Home";
import Log from "./pages/Log";
import MealResult from "./pages/MealResult";
import Plan from "./pages/Plan";
import EditMealTemplate from "./pages/EditMealTemplate";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout><Home /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/log"
              element={
                <ProtectedRoute>
                  <AppLayout><Log /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-result"
              element={
                <ProtectedRoute>
                  <AppLayout><MealResult /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan"
              element={
                <ProtectedRoute>
                  <AppLayout><Plan /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/template/:templateId"
              element={
                <ProtectedRoute>
                  <AppLayout><EditMealTemplate /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <AppLayout><Progress /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout><Settings /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <AppLayout><EditProfile /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
