'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AgentData {
  name: string;
  email: string;
  phone: string;
  password?: string; // Transient field for registration
  confirmPassword?: string; // Transient field for registration
  otp: string;
  termsAccepted: boolean;
  selectedProperty?: any; // Add selectedProperty for wizard navigation
}

interface AgentContextType {
  data: AgentData; // Rename from agentData to data for consistency
  currentPhase: number; // Add currentPhase
  errors: Record<string, string>; // Add errors
  updateData: (data: Partial<AgentData>) => void; // Rename from updateAgentData
  setCurrentPhase: (phase: number) => void; // Add setCurrentPhase
  setErrors: (errors: Record<string, string>) => void; // Add setErrors
  clearAgentData: () => void;
  clearPasswordData: () => void;
  nextPhase: () => void; // Add navigation methods
  prevPhase: () => void;
  setPhase: (phase: number) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
};

interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const [data, setData] = useState<AgentData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    termsAccepted: false,
    selectedProperty: null,
  });

  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (newData: Partial<AgentData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const clearAgentData = () => {
    setData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: '',
      termsAccepted: false,
      selectedProperty: null,
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
    setCurrentPhase(prev => Math.min(prev + 1, 4));
  };

  const prevPhase = () => {
    setCurrentPhase(prev => Math.max(prev - 1, 1));
  };

  const setPhase = (phase: number) => {
    if (phase >= 1 && phase <= 4) {
      setCurrentPhase(phase);
    }
  };

  return (
    <AgentContext.Provider value={{
      data,
      currentPhase,
      errors,
      updateData,
      setCurrentPhase,
      setErrors,
      clearAgentData,
      clearPasswordData,
      nextPhase,
      prevPhase,
      setPhase
    }}>
      {children}
    </AgentContext.Provider>
  );
};