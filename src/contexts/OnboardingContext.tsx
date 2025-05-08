
import React, { createContext, useState, useContext } from 'react';

interface OnboardingData {
  fullName: string;
  birthDate: string;
  birthTime?: string;
  location: string;
  gender?: 'Male' | 'Female' | 'Trans' | 'Other';
  interestedIn: string[];
  hobbies: string[];
  goals: string[];
  isAnonymous: boolean;
  photos: string[];
  linkedInUrl?: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  setData: (data: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
  fullName: '',
  birthDate: '',
  location: '',
  interestedIn: [],
  hobbies: [],
  goals: [],
  isAnonymous: false,
  photos: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setDataState] = useState<OnboardingData>(defaultOnboardingData);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const setData = (newData: Partial<OnboardingData>) => {
    setDataState(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetOnboarding = () => {
    setDataState(defaultOnboardingData);
    setCurrentStep(1);
  };

  return (
    <OnboardingContext.Provider value={{ data, setData, currentStep, setCurrentStep, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
