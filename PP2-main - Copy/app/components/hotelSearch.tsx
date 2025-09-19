"use client";

import React, { useEffect, useState } from "react";
import { useDarkMode } from "../DarkModeContext";
import HotelDetails from "../components/hotelDetails";

interface HotelSearchProps {
  HotelParams?: string;
}

interface Room {
  id: string;
  name: string;
  images: string[];
  amenities: string[];
  price_per_night: number;
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  star_rating: number;
  room_types: Room[];
}

const HotelSearch: React.FC<HotelSearchProps> = ({ HotelParams }) => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useDarkMode();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(undefined);

  const params = new URLSearchParams(HotelParams);
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  const city = params.get("city");
  const hotelName = params.get("hotelName");
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const starRating = params.get("starRating");

  console.log("hotel search ", city);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const url = `${apiUrl}/api/users/{userid}/hotels?check_in=${checkIn}&check_out=${checkOut}&city=${city}&name=${hotelName}&min_price=${minPrice}&max_price=${maxPrice}&star_rating=${starRating}`;

  useEffect(() => {
  
    setHotels([]);

    const fetchHotels = async () => {
      try {
        console.log("Fetching hotels from:", url);
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Error fetching hotel data.");
          return;
        }

        const data = await response.json();
        console.log(data);
        setHotels(data);
      } catch (error) {
        setError("Failed to fetch data");
        console.error(error);
      }
    };

    fetchHotels();
  }, [url]);

  const handleViewDetails = (hotel: any) => {
    if (!hotel || !hotel.id) return;
    console.log("Navigating to hotel:", hotel.id); 
  
    setSelectedHotel(hotel);
  
    const newUrl = new URL(window.location.href);
    newUrl.pathname = `/hotels/${hotel.id}`;
    newUrl.searchParams.set("checkIn", checkIn || "");
    newUrl.searchParams.set("checkOut", checkOut || "");
    window.history.pushState(null, "", newUrl.toString());
  };

  const handleCloseOverlay = () => {
    setSelectedHotel(undefined);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("hotelId");
    window.history.pushState(null, "", newUrl.toString());
  };

  return (
    <div className="hotels-container relative">
        <h3 className="text-xl font-semibold mb-4">Hotel Results</h3>

        <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
          <tbody>
            {hotels.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">
                  No hotels available.
                </td>
              </tr>
            ) : (
              hotels.map((hotel, index) => {
                const minPrice = Math.min(...hotel.room_types.map((room) => room.price_per_night));

                return (
                  <tr key={index} className="odd:bg-white even:bg-sky-100 text-center">
                    <td className="p-3">{hotel.name} {hotel.logo}</td>
                    <td className="p-3">{hotel.address}</td>
                    <td className="p-3">{'⭐'.repeat(hotel.star_rating)}</td>
                    <td className="p-3">From ${minPrice}/Night</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewDetails(hotel)}
                        className="border border-yellow-300 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2"
                      >
                        View Rooms
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

      {/* Overlay for Hotel Details */}
      {selectedHotel && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-stone-100 p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
            <button onClick={handleCloseOverlay} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
              ✖
            </button>
            <HotelDetails 
              hotel={selectedHotel} 
              checkIn={checkIn || ""} 
              checkOut={checkOut || ""} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSearch;

