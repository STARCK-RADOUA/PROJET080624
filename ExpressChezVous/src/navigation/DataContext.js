import React, { createContext, useState } from 'react';

// Create a context
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [sharedData, setSharedData] = useState({});

  return (
    <DataContext.Provider value={{ sharedData, setSharedData }}>
      {children}
    </DataContext.Provider>
  );
};
