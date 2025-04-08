
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OnboardingScreen from "./components/Onboarding/OnboardingScreen";
import DiscoveryScreen from "./components/Discovery/DiscoveryScreen";
import ChatScreen from "./components/Chat/ChatScreen";
import CalendarScreen from "./components/Calendar/CalendarScreen";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/Layout/AppLayout";
import SignInScreen from "./components/Authentication/SignInScreen";
import SignUpScreen from "./components/Authentication/SignUpScreen";
import VerificationScreen from "./components/Authentication/VerificationScreen";
import PersonalInfoForm from "./components/Onboarding/PersonalInfoForm";
import PreferencesForm from "./components/Onboarding/PreferencesForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/verification" element={<VerificationScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/onboarding/personal-info" element={<PersonalInfoForm />} />
          <Route path="/onboarding/preferences" element={<PreferencesForm />} />
          
          <Route path="/" element={<AppLayout />}>
            <Route path="/home" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<DiscoveryScreen />} />
            <Route path="/chats" element={<ChatScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/profile" element={<DiscoveryScreen />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
