import { useState, useEffect } from "react";
import { useDarkMode } from "../DarkModeContext";

export default function AirportAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder: string }) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<{ city: string; name: string; country: string; code: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchAirports = async () => {
      if (!inputValue) {
        setSuggestions([]);
        return;
      }

      console.log("Fetching airports for:", inputValue);

      try {

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const response = await fetch(`${apiUrl}/api/users/{userId}/flights/suggest_airports?input=${inputValue}`);

        if (!response.ok) {
          console.error("API Error:", response.status, response.statusText);
          return;
        }

        const airports = await response.json();
        console.log("API Response:", airports);

        setSuggestions(airports);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAirports();
    }, 500); 


    return () => clearTimeout(timeoutId);
  }, [inputValue]); 

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowDropdown(true);
          onChange(e.target.value);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => setShowDropdown(true)} 
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className={`${isDarkMode ? "bg-sky-700" : "bg-white"} absolute w-full border border-gray-300 rounded-md shadow-md mt-1 max-h-60 overflow-y-auto`}>
          {suggestions.map((airport, index) => (
            <li
              key={airport.code + index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setInputValue(`${airport.code}`);
                onChange(`${airport.code}`);
                setShowDropdown(false);
              }}
            >
              {airport.city}, {airport.name} ({airport.code}), {airport.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
