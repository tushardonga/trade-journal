import { createContext, useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  // Default to current month
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <DateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateContext.Provider>
  );
};