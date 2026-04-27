import React, { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbNames, setBreadcrumbNames] = useState({});

  const setBreadcrumbName = useCallback((id, name) => {
    setBreadcrumbNames((prev) => {
      if (prev[id] === name) return prev;
      return { ...prev, [id]: name };
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbNames, setBreadcrumbName }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};
