'use client';

import { useState, ReactNode } from 'react';
import { AppStateContext, OnboardingData } from '@/lib/store';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const value = {
    onboardingData,
    setOnboardingData: (data: Partial<OnboardingData>) => setOnboardingData(prev => ({...prev, ...data})),
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
