'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface SellerData {
  // Personal info
  name: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  otp: string;
  termsAccepted: boolean;
  
  // Seller agreements
  legalAuthorization: boolean;
  successFeeAgreement: boolean;
  noBypassing: boolean;
  upgradesAcknowledgment: boolean;
  agentPartnerHelp: boolean;
  
  // Property info
  address: Address;
  price: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  description: string;
  features: string[];
  
  // Media
  images: File[];
  documents: File[];
  photos: File[];
  floorplans: File[];
  videos: File[];
}

interface SellerContextType {
  data: SellerData;
  currentPhase: number;
  errors: Record<string, string>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  updateData: (data: Partial<SellerData>) => void;
  setCurrentPhase: (phase: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearSellerData: () => void;
  clearPasswordData: () => void;
  nextPhase: () => void;
  prevPhase: () => void;
  setPhase: (phase: number) => void;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const useSellerContext = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSellerContext must be used within a SellerProvider');
  }
  return context;
};

interface SellerProviderProps {
  children: ReactNode;
}

export const SellerProvider: React.FC<SellerProviderProps> = ({ children }) => {
  const [data, setData] = useState<SellerData>({
    // Personal info
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    termsAccepted: false,
    
    // Seller agreements
    legalAuthorization: false,
    successFeeAgreement: false,
    noBypassing: false,
    upgradesAcknowledgment: false,
    agentPartnerHelp: false,
    
    // Property info
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    price: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    description: '',
    features: [],
    
    // Media
    images: [],
    documents: [],
    photos: [],
    floorplans: [],
    videos: []
  });

  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateData = (newData: Partial<SellerData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const clearSellerData = () => {
    setData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: '',
      termsAccepted: false,
      legalAuthorization: false,
      successFeeAgreement: false,
      noBypassing: false,
      upgradesAcknowledgment: false,
      agentPartnerHelp: false,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      price: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      squareFootage: '',
      description: '',
      features: [],
      images: [],
      documents: [],
      photos: [],
      floorplans: [],
      videos: []
    });
    setCurrentPhase(1);
    setErrors({});
  };

  const clearPasswordData = () => {
    setData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  const nextPhase = () => {
    setCurrentPhase(prev => Math.min(prev + 1, 2));
  };

  const prevPhase = () => {
    setCurrentPhase(prev => Math.max(prev - 1, 1));
  };

  const setPhase = (phase: number) => {
    setCurrentPhase(Math.max(1, Math.min(phase, 2)));
  };

  return (
    <SellerContext.Provider value={{
      data,
      currentPhase,
      errors,
      isLoading,
      setIsLoading,
      updateData,
      setCurrentPhase,
      setErrors,
      clearSellerData,
      clearPasswordData,
      nextPhase,
      prevPhase,
      setPhase
    }}>
      {children}
    </SellerContext.Provider>
  );
};