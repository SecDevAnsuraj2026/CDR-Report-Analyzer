/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [caseDetails, setCaseDetails] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [highlightKeys, setHighlightKeys] = useState(new Set());

  return (
    <DataContext.Provider value={{
      caseDetails,
      setCaseDetails,
      excelData,
      setExcelData,
      highlightKeys,
      setHighlightKeys
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

export default DataContext;
