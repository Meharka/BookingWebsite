"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "../DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import NotificationBell from './Notification.jsx';
import {HomeIcon} from "lucide-react";
import { ShoppingCart } from 'lucide-react';;


const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDropdownOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full ${isDarkMode ? "bg-sky-900" : "bg-white"} p-4 shadow-md z-50`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          className={`flex items-center gap-1 ${isDarkMode ? "text-sky-100" : "text-sky-700"} hover:text-sky-500`}
          onClick={() => handleNavigate("/")}
        >
          Home <HomeIcon className="hover:text-bg-blue-100 "/>
        </button>

        <div  className="flex absolute right-20 text-sky-500">
        {user ? (
                      <NotificationBell  />

                    ):(<></>)}
        </div>
        <div>
        <button
          className={`flex items-center gap-1 ${isDarkMode ? "text-sky-100" : "text-sky-700"} hover:text-sky-500`}
          onClick={() => handleNavigate("/cart")}
        >
          <ShoppingCart className="hover:text-bg-blue-100 "/>
        </button>
        </div>

        {/* User Profile Dropdown */}
        
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className={`${isDarkMode ? "text-sky-100" : "text-sky-700"} hover:text-sky-500`}
          >
            User
          </button>
          {isDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 
                            ${isDarkMode ? "bg-sky-900 text-sky-100" : "bg-white text-sky-700"}`}>
              <div className="py-1">
                <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                  onClick={() => handleNavigate("/dashboard")}>
                  Profile
                </button>
                <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                  onClick={() => handleNavigate("/manage-bookings")}>
                  Manage Bookings
                </button>
                
                <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                  onClick={() => handleNavigate("/manage-hotels")}>
                  Manage Hotels
                </button>

                {user ? (
                  <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                    onClick={logout}>
                    Logout
                  </button>
                ) : (
                  <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                    onClick={() => handleNavigate("/auth/register")}>
                    Log In / Sign Up
                  </button>
                )}

                <button className="block px-4 py-2 text-sm hover:bg-sky-700 hover:text-white"
                  onClick={toggleDarkMode}>
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
