import React, { createContext, useContext, useState, useCallback } from 'react';

const EvidenceContext = createContext({
  activeEvidence: null,
  isDrawerOpen: false,
  openEvidence: () => {},
  closeEvidence: () => {},
});

export function EvidenceProvider({ children }) {
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openEvidence = useCallback((evidenceData) => {
    setActiveEvidence(evidenceData);
    setIsDrawerOpen(true);
  }, []);

  const closeEvidence = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <EvidenceContext.Provider
      value={{
        activeEvidence,
        isDrawerOpen,
        openEvidence,
        closeEvidence,
      }}
    >
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidence() {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error('useEvidence must be used within an EvidenceProvider');
  }
  return context;
}
