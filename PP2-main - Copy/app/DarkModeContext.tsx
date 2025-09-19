"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const DarkModeContext = createContext<{ isDarkMode: boolean; toggleDarkMode: () => void } | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error("useDarkMode must be used within a DarkModeProvider");
  return context;
}
