
import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appSettings, setAppSettings] = useState({
    softwareTitle: 'JC&TC ERP',
    logoUrl: '',
    timezone: 'Asia/Dhaka',
    displayType: 'logo',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/app-config');
        if (res.ok) {
          const data = await res.json();
          setAppSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch app settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <AppContext.Provider value={{ appSettings, setAppSettings }}>
      {children}
    </AppContext.Provider>
  );
};
