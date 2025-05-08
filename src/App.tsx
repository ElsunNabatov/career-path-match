
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import OnboardingScreen from "./components/Onboarding/OnboardingScreen";
import PeopleScreen from "./components/People/PeopleScreen";
import ChatScreen from "./components/Chat/ChatScreen";
import CalendarScreen from "./components/Calendar/CalendarScreen";
import SchedulePage from "./components/Calendar/SchedulePage";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/Layout/AppLayout";
import SignInScreen from "./components/Authentication/SignInScreen";
import SignUpScreen from "./components/Authentication/SignUpScreen";
import VerificationScreen from "./components/Authentication/VerificationScreen";
import ResetPasswordScreen from "./components/Authentication/ResetPasswordScreen";
import PersonalInfoForm from "./components/Onboarding/PersonalInfoForm";
import PreferencesForm from "./components/Onboarding/PreferencesForm";
import ProfileScreen from "./components/Profile/ProfileScreen";
import PremiumScreen from "./components/Premium/PremiumScreen";
import PaymentScreen from "./components/Payment/PaymentScreen";
import LoyaltyScreen from "./components/Loyalty/LoyaltyScreen";
import LinkedinVerificationScreen from "./components/Verification/LinkedinVerificationScreen";
import ReviewScreen from "./components/Review/ReviewScreen";
import LikedByScreen from "./components/People/LikedByScreen";
import DatingAdvisorScreen from "./components/Advisor/DatingAdvisorScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Route guard component to handle redirects based on auth state
const RequireAuth = ({ requireVerification = true }) => {
  const { user, isLoading, needsLinkedInVerification } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    // Show loading state while checking auth
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  if (requireVerification && needsLinkedInVerification) {
    // Redirect to verification if needed
    return <Navigate to="/verification" replace />;
  }
  
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OnboardingProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/signin" replace />} />
              
              {/* Public routes */}
              <Route path="/signin" element={<SignInScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="/verification" element={<VerificationScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              
              {/* Routes that require authentication but not verification */}
              <Route element={<RequireAuth requireVerification={false} />}>
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/onboarding/personal-info" element={<PersonalInfoForm />} />
                <Route path="/onboarding/preferences" element={<PreferencesForm />} />
                <Route path="/linkedin-verification" element={<LinkedinVerificationScreen />} />
              </Route>
              
              {/* Routes that require full verification */}
              <Route element={<RequireAuth requireVerification={true} />}>
                <Route element={<AppLayout />}>
                  <Route path="/people" element={<PeopleScreen />} />
                  <Route path="/people/liked-by" element={<LikedByScreen />} />
                  <Route path="/chats" element={<ChatScreen />} />
                  <Route path="/calendar" element={<CalendarScreen />} />
                  <Route path="/calendar/schedule" element={<SchedulePage />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="/premium" element={<PremiumScreen />} />
                  <Route path="/payment" element={<PaymentScreen />} />
                  <Route path="/loyalty" element={<LoyaltyScreen />} />
                  <Route path="/advisor" element={<DatingAdvisorScreen />} />
                  <Route path="/reviews/:matchId" element={<ReviewScreen />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
