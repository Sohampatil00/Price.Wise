'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { AnalyzeSalesDataOutput } from '@/ai/flows/analyze-sales-data';

export type OnboardingData = {
    name?: string;
    type?: string;
    region?: string;
    targetCustomer?: string;
    productCount?: number;
    monthlySales?: number;
    avgProfitMargin?: number;
    avgCostPerProduct?: number;
    inventoryCapacity?: number;
    supplierLeadTime?: number;
    salesHistory?: string;
    analysis?: AnalyzeSalesDataOutput | null;
};

type AppStateContextType = {
  onboardingData: OnboardingData;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
