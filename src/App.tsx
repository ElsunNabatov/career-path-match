
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import AuthGuard from "./components/Authentication/AuthGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              
              {/* Routes that require authentication but not verification */}
              <Route path="/verification" element={
                <AuthGuard requireVerification={false}>
                  <VerificationScreen />
                </AuthGuard>
              } />
              <Route path="/onboarding" element={
                <AuthGuard requireVerification={false}>
                  <OnboardingScreen />
                </AuthGuard>
              } />
              <Route path="/onboarding/personal-info" element={
                <AuthGuard requireVerification={false}>
                  <PersonalInfoForm />
                </AuthGuard>
              } />
              <Route path="/onboarding/preferences" element={
                <AuthGuard requireVerification={false}>
                  <PreferencesForm />
                </AuthGuard>
              } />
              <Route path="/linkedin-verification" element={
                <AuthGuard requireVerification={false}>
                  <LinkedinVerificationScreen />
                </AuthGuard>
              } />
              
              {/* Routes that require full verification */}
              <Route path="/people" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <PeopleScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/people/liked-by" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <LikedByScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/chats" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <ChatScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/calendar" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <CalendarScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/calendar/schedule" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <SchedulePage />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <ProfileScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/premium" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <PremiumScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/payment" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <PaymentScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/loyalty" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <LoyaltyScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/advisor" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <DatingAdvisorScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/reviews/:matchId" element={
                <AuthGuard requireVerification={true}>
                  <AppLayout>
                    <ReviewScreen />
                  </AppLayout>
                </AuthGuard>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
