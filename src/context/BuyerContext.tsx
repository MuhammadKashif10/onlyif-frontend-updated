'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buyerApi, SavedProperty, ViewedProperty, ScheduledViewing, ActiveOffer } from '@/api/buyer';
import { Property } from '@/types/api';

interface BuyerData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otpVerified: boolean;
  termsAccepted: boolean;
  selectedProperty?: any;
  interestExpressed: boolean;
  unlockFeeAcknowledgment: boolean;
  noBypassing: boolean;
  responsibilityAcknowledgment: boolean;
}

interface RecentActivity {
  id: string;
  type: 'property_view' | 'property_save' | 'viewing_scheduled' | 'offer_submitted';
  message: string;
  time: string;
  propertyId?: string;
}

// File: BuyerContext.tsx (updates within interfaces and BuyerProvider)

interface BuyerContextType {
  // Registration flow data
  buyerData: BuyerData;
  currentPhase: number;
  updateBuyerData: (data: Partial<BuyerData>) => void;
  setPhase: (phase: number) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  canProceedToPhase: (phase: number) => boolean;
  resetBuyerData: () => void;
  
  // Dashboard data
  savedProperties: SavedProperty[];
  viewedProperties: ViewedProperty[];
  scheduledViewings: ScheduledViewing[];
  activeOffers: ActiveOffer[];
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  fetchBuyerData: () => Promise<void>;
  unlockedProperties: Property[];
  refreshUnlockedProperties: () => Promise<void>;
}

const initialBuyerData: BuyerData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  otpVerified: false,
  termsAccepted: false,
  interestExpressed: false,
  unlockFeeAcknowledgment: false,
  noBypassing: false,
  responsibilityAcknowledgment: false,
};

const BuyerContext = createContext<BuyerContextType | undefined>(undefined);

export const BuyerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Registration flow state
  const [buyerData, setBuyerData] = useState<BuyerData>(initialBuyerData);
  const [currentPhase, setCurrentPhase] = useState(1);
  
  // Dashboard state
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>([]);
  const [scheduledViewings, setScheduledViewings] = useState<ScheduledViewing[]>([]);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedProperties, setUnlockedProperties] = useState<Property[]>([]);

  // Registration flow methods
  const updateBuyerData = (data: Partial<BuyerData>) => {
    setBuyerData(prev => ({ ...prev, ...data }));
  };

  const setPhase = (phase: number) => {
    // Single-phase registration; keep phase clamped at 1
    if (phase === 1) {
      setCurrentPhase(1);
    }
  };

  const nextPhase = () => {
    // No-op now that registration is single-phase
    setCurrentPhase(1);
  };

  const prevPhase = () => {
    // No-op for single-phase flow
    setCurrentPhase(1);
  };

  const canProceedToPhase = (_phase: number): boolean => {
    // Always true for single registration step
    return true;
  };

  const resetBuyerData = () => {
    setBuyerData(initialBuyerData);
    setCurrentPhase(1);
  };

  // Dashboard methods
  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all buyer data in parallel
      const [
        unlockedRes,
        savedPropsRes,
        viewedPropsRes,
        viewingsRes,
        offersRes,
        activityRes
      ] = await Promise.all([
        buyerApi.getUnlockedProperties({ limit: 10 }),
        buyerApi.getSavedProperties({ limit: 10 }),
        buyerApi.getViewedProperties({ limit: 10 }),
        buyerApi.getScheduledViewings({ limit: 10 }),
        buyerApi.getActiveOffers({ limit: 10 }),
        buyerApi.getRecentActivity(10)
      ]);

      setUnlockedProperties(unlockedRes.properties || []);
      setSavedProperties(savedPropsRes.properties || []);
      setViewedProperties(viewedPropsRes.properties || []);
      setScheduledViewings(viewingsRes.viewings || []);
      setActiveOffers(offersRes.offers || []);
      setRecentActivity(activityRes || []);
    } catch (err) {
      console.error('Error fetching buyer data:', err);
      setError('Failed to load buyer data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUnlockedProperties = async () => {
    try {
      const unlockedRes = await buyerApi.getUnlockedProperties({ limit: 10 });
      setUnlockedProperties(unlockedRes.properties || []);
    } catch (err) {
      console.error('Error refreshing unlocked properties:', err);
    }
  };

  const value: BuyerContextType = {
    // Registration flow
    buyerData,
    currentPhase,
    updateBuyerData,
    setPhase,
    nextPhase,
    prevPhase,
    canProceedToPhase,
    resetBuyerData,
    
    // Dashboard data
    savedProperties,
    viewedProperties,
    scheduledViewings,
    activeOffers,
    recentActivity,
    loading,
    error,
    fetchBuyerData,
    unlockedProperties,
    refreshUnlockedProperties,
  };

  return (
    <BuyerContext.Provider value={value}>
      {children}
    </BuyerContext.Provider>
  );
};

// Export both hook names for compatibility
export const useBuyerContext = () => {
  const context = useContext(BuyerContext);
  if (context === undefined) {
    throw new Error('useBuyerContext must be used within a BuyerProvider');
  }
  return context;
};

// Export the hook with the name expected by the dashboard
export const useBuyer = () => {
  const context = useContext(BuyerContext);
  if (context === undefined) {
    throw new Error('useBuyer must be used within a BuyerProvider');
  }
  return context;
};