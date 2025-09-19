"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, usePathname , useRouter} from "next/navigation";

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

interface HotelDetailsProps {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ hotel, checkIn, checkOut }) => {
  const [details, setDetails] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const userid = "1"; // Placeholder user ID
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const url = `${apiUrl}/api/users/${userid}/hotels/${hotel.id}/rooms?check_in=${checkIn}&check_out=${checkOut}`;

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        console.log("Fetching hotel details from:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch hotel details");
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        setError("Error fetching hotel details.");
        console.error(error);
      }
    };

    fetchHotelDetails();
  }, [hotel.id, checkIn, checkOut]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!details) return <p>Loading...</p>;

  console.log("Hotel Data:", hotel);
  console.log("Details", details);
  console.log("Hotel room_types:", hotel.room_types);

  const handleBookHotel = () => {
    // Store the flight data in localStorage
    
    localStorage.setItem("check-in",  JSON.stringify(checkIn));
    localStorage.setItem("Room",  JSON.stringify(details));
    localStorage.setItem("check-out",  JSON.stringify(checkOut));
    localStorage.setItem("selected-hotel",  JSON.stringify(hotel));

    console.log("checkin inside hotel details:  ", checkIn)
    console.log("checkout in hotel details:  ",checkOut)
    console.log("hotel in hotel details:  ",hotel)
    console.log("Room in hotel details:  ",details)
    console.log("local storage hotel: ",localStorage.getItem("selected-hotel"))
    console.log("local storage checkin: ",localStorage.getItem("check-in"))
    console.log("local storage checkOut: ",localStorage.getItem("check-out"))
    console.log("Room: ",localStorage.getItem("Room"))

    // Navigate to the booking page
    router.push("/manage-bookings/create/hotelBooking");
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{hotel.name}</h1>
      <p className="text-gray-600">{hotel.address}</p>
      <p>{'⭐'.repeat(hotel.star_rating)}</p>
      <p className="text-gray-700">
        Check-in: <strong>{checkIn}</strong> | Check-out: <strong>{checkOut}</strong>
      </p>

      {/* Room Listings */}
      <h2 className="text-xl font-semibold mt-6">Available Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {hotel.room_types.map((room) => (
          <div key={room.id} className="border p-4 rounded-lg shadow">
            <h3 className="font-semibold">{room.name}</h3>

            <div className="flex gap-2 mt-2">
                {room.images && room.images.length > 0 ? (
                    room.images.map((image, index) => (
                    <img 
                        key={index} 
                        src={image} 
                        alt={`Room Image ${index}`} 
                        className="w-32 h-32 object-cover rounded-md" 
                    />
                    ))
                ) : (
                    <p className="text-gray-500">No images available</p>
                )}
                </div>

            {/* Room Details */}
            <p className="text-gray-600 mt-2">Amenities: {room.amenities}</p>
            <p className="font-semibold text-sky-700">${room.price_per_night} / Night</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button 
        onClick={() => handleBookHotel()}
        className="p-4 mt-4 border border-sky-600 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2">
          Book Hotel(s)
        </button>
      </div>
    </div>
    
  );
};

export default HotelDetails;
