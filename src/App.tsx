
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import AuthProvider from "./contexts/AuthContext";

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
          <Routes>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignInScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/verification" element={<VerificationScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/onboarding/personal-info" element={<PersonalInfoForm />} />
            <Route path="/onboarding/preferences" element={<PreferencesForm />} />
            <Route path="/linkedin-verification" element={<LinkedinVerificationScreen />} />
            
            <Route path="/" element={<AppLayout />}>
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
