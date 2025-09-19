
"use client";
import { ReactNode, useEffect } from "react";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { DarkModeProvider } from "./DarkModeContext";
import Navbar from "./components/Navbar";
import "./globals.css";
import { useAuth } from "@/contexts/AuthContext";

type LayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (!cart) {
      localStorage.setItem("cart", JSON.stringify({})); // empty cart
    }
  }, []);

  return (
    <AuthProvider>
    <html lang="en">
      
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={isDarkMode ? "dark" : ""}>
        <DarkModeProvider>
          <Navbar />


              {/* Child content */}
              <main>{children}</main>

        </DarkModeProvider>
      </body>
    </html>
    </AuthProvider>
  );
}

