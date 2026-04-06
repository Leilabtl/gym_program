"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { UserSettings } from "@/types";
import { getUserSettings, updateUserSettings } from "@/lib/firestore";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: UserSettings = {
  unit: 'kg',
  theme: 'system',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        setLoading(true);
        try {
          const userSettings = await getUserSettings(user.uid);
          // Only update if they differ to avoid loops, or just set it
          setSettings(userSettings || defaultSettings);
        } catch (error) {
          console.error("Failed to load user settings:", error);
        }
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (user) {
      try {
        await updateUserSettings(user.uid, newSettings);
      } catch (error) {
        console.error("Failed to save user settings:", error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
