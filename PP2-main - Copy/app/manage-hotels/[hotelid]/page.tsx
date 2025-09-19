"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDarkMode } from "../../DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";

interface Room {
  id: number;
  name: string;
  price_per_night: number;
  available: number;
  amenities: string;
  images: string[];
}

interface Hotel {
  id: number;
  name: string;
  logo: string;
  city: string;
  star_rating: number;
  rooms: Room[];
}

export default function HotelDetails() {
  const { hotelid } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availability, setAvailability] = useState<number | "">(0);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const {loading, user, setUser} = useAuth();

  useEffect(() => {
    if (!hotelid) return;

    if (!user && !loading){
      router.push("/auth/login")
    }


    const fetchHotelDetails = async () => {
      const token = localStorage.getItem("token");
      const userid = user?.id;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      try {
        const hotelRes = await fetch(`${apiUrl}/api/users/${userid}/hotels/${hotelid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`}
            }
        );
        if (!hotelRes.ok) throw new Error("Failed to fetch hotel details");
        const hotelData = await hotelRes.json();
        setHotel(hotelData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchHotelDetails();
  }, [hotelid, user]);

  const openModal = (room: Room) => {
    setSelectedRoom(room);
    setAvailability(room.available);
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  const handleSaveAvailability = async () => {
    if (selectedRoom && availability !== "") {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        const userid = user?.id;
        const response = await fetch(`${apiUrl}/api/users/${userid}/hotels/${hotelid}/rooms/${selectedRoom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          ,
          body: JSON.stringify({ available: availability }),
        });

        if (!response.ok) throw new Error("Failed to update availability");

        setHotel((prev) =>
          prev
            ? {
                ...prev,
                rooms: prev.rooms.map((room) =>
                  room.id === selectedRoom.id ? { ...room, available: Number(availability) } : room
                ),
              }
            : null
        );
        closeModal();
      } catch (error) {
        console.error("Error updating availability:", error);
      }
    }
  };


  if (!hotel) return <p className="text-center text-gray-500">Loading hotel details...</p>;

  return (
    <div className={`${isDarkMode ? "bg-sky-700" : "bg-sky-100"} min-h-screen w-full`}>
    <div className={`${isDarkMode ? "bg-sky-900" : "bg-white"} max-w-4xl mx-auto mt-14 p-6 shadow-lg rounded-lg`}>
      <button onClick={() => router.push(`/manage-hotels`)} className="text-blue-500 hover:underline mb-4">
        ← Back to Manage Hotels
      </button>

      <img src={hotel.logo} alt={hotel.name} className="w-full h-48 object-cover rounded-md mb-4" />
      <h1 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-3xl font-bold`}>{hotel.name}</h1>
      <p className={`${isDarkMode ? "text-sky-200" : "text-sky-700"}`}>{hotel.city}</p>
      <p>{'⭐'.repeat(hotel.star_rating)}</p>

      <button
                onClick={() => router.push(`/manage-hotels/${hotelid}/view-bookings`)}
                className="mt-4 bg-gray-500 hover:bg-gray-800 text-white py-2 px-4 rounded-md p-2"
              >
                View Bookings
              </button>

      <h2 className={`${isDarkMode ? "text-sky-200" : "text-sky-700"} text-2xl font-semibold mt-6`}>Rooms</h2>
      {hotel.rooms?.length === 0 ? (
        <p className="text-gray-500">No rooms available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {hotel.rooms?.map((room) => (
            <div key={room.id} className={`${isDarkMode ? "bg-sky-700 text-sky-200" : "bg-sky-100 text-sky-700"} border p-4 rounded-lg shadow-md`}>
              <h3 className=" text-xl font-semibold">{room.name}</h3>
              <p>Price per night: ${room.price_per_night}</p>
              <p>Amenities: {room.amenities}</p>
              <p>Available: {room.available}</p>
              {room.images.length > 0 && <img src={`tmp/${room.images[0]}`} alt={room.name}></img>}

             <button
                onClick={() => openModal(room)}
                className="mt-4 bg-gray-500 hover:bg-gray-800 text-white py-2 px-4 rounded-md p-2"
              >
                Edit Availability
              </button>
            </div>
          ))}
        </div>
      )}

    <button onClick={() => router.push(`/manage-hotels/${hotelid}/add-room`)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mt-6">
        Add Room
    </button>

      {selectedRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold">Edit Availability</h2>
            <p className="text-gray-600">{selectedRoom.name}</p>

            <label className="block mt-4">
              <span className="text-gray-700">Available Rooms</span>
              <input
                type="number"
                value={availability}
                onChange={(e) => setAvailability(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
              />
            </label>

            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-400 text-white rounded-md">
                Cancel
              </button>
              <button onClick={handleSaveAvailability} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
