"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useDarkMode } from "../DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";

interface Hotel {
  id: number;
  name: string;
  logo: string;
  city: string;
  star_rating: number;
}

export default function ManageHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { isDarkMode } = useDarkMode();
  const {loading, user, setUser} = useAuth();
  const router = useRouter();


  useEffect(() => {

    if (!user){
      router.push("/auth/login")
    }

    if (user){
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const url = `${apiUrl}/api/users/${user.id}/hotels/manage-hotels`;

    async function fetchHotels() {
      try {
        const response = await fetch(url,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`}
            }
        );


        if (!response.ok) throw new Error("Failed to fetch hotels");
        const data = await response.json();
        setHotels(data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    }

    fetchHotels();}
  }, [user]);

  return (
    <div className={`${isDarkMode ? "bg-sky-700" : "bg-sky-100"} min-h-screen w-full`}>
    <div className={`${isDarkMode ? "bg-sky-900" : "bg-white"} max-w-4xl mx-auto mt-14 p-6 shadow-lg rounded-lg`}>
      <h1 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-3xl font-bold mb-6 text-center`}>My Hotels</h1>

      {hotels.length === 0 ? (
        <p className="text-center text-gray-500">No hotels found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="border p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
              onClick={() => router.push(`/manage-hotels/${hotel.id}`)}
            >
              <img
                src={`http://localhost:3000/tmp/${hotel.logo}`}
                alt={hotel.name}
                className="w-full h-32 object-cover mb-4 rounded-md"
              />
              <h2 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-xl font-semibold`}>{hotel.name}</h2>
              <p className={`${isDarkMode ? "text-sky-200" : "text-sky-700"}`}>{hotel.city}</p>
              <p>{'⭐'.repeat(hotel.star_rating)}</p>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => router.push("/manage-hotels/add-hotel")} 
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-6"
      >
        Add Hotel
      </button>
    </div>
    </div>
  );
}
