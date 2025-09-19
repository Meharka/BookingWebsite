"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams} from "next/navigation";
import { useDarkMode } from "../../../DarkModeContext";
import { useAuth } from "@/contexts/AuthContext";

interface HotelBooking {
  id: string;  // Assuming each booking has an ID
  status: string;
  room_name: string;
  createdAt: Date; // Convert date to readable string
  check_in: Date;
  check_out: Date;
}

export default function ViewBookings() {
  const { hotelid, bookingDate, room_type } = useParams();
  


  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { loading, user } = useAuth();
  const [roomBookings, setBookings] = useState<HotelBooking[]>([]);

  useEffect(() => {
    if (!hotelid || !user) return;

    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      const userid = user?.id;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      try {
        //const queryParams = new URLSearchParams();
        //queryParams.append("hotelId", hotelid);
        //if (bookingDate) queryParams.append("&date", bookingDate);
        //if (room_type) queryParams.append("&room_type", room_type);

    // Construct the URL with query parameters
    let url = `${apiUrl}/api/users/${userid}/hotels/${hotelid}/bookings?hotelId=${hotelid}&date=${bookingDate}&room_type=${room_type}`;
    console.log(url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
        if (!response.ok) throw new Error("Failed to fetch hotel bookings");

        const bookings = await response.json();
        setBookings(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    if(user){
      if(user.role!=="HOTEL_OWNER"){
          alert("Login as a hotel owner to cancel booking from Management side")
          router.push("/auth/login")
      }else{
        fetchBookings();
      }
    }

    fetchBookings();
  }, [hotelid, user, bookingDate, room_type, loading]);

  // Function to delete a booking
  const deleteBooking = async (id: number) => {
    const token = localStorage.getItem("token");
    const userid = user?.id;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const bookingId = id.toString();
    const role1 = user?.role || "HOTEL_OWNER";

    router.push(`/manage-hotels/${hotelid}/cancelBooking?hotelId=${hotelid}&bookingId=${bookingId}&userId=${userid}&role=${role1}`);

    // try {
    //   const response = await fetch(`${apiUrl}/api/users/${userid}/bookings/${bookingId}/cancel`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });

    //   if (!response.ok) throw new Error("Failed to delete booking");

    //   // Remove deleted booking from state
    //   setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    // } catch (error) {
    //   console.error("Error deleting booking:", error);
    // }
  };

  return (
    <div className={`${isDarkMode ? "bg-sky-700" : "bg-sky-100"} min-h-screen w-full`}>
    <div className={`p-6 ${isDarkMode ? " text-sky-200" : "text-sky-700"}`}>

    <button onClick={() => router.back()} className={`p-6 ${isDarkMode ? " text-sky-200" : "text-sky-700"} mt-6 hover:underline`}>
        ← Back to My Hotel
      </button>

      <h1 className="text-2xl font-bold mb-4">Hotel Bookings</h1>



      {roomBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {roomBookings.map((booking) => (
            <li key={booking.id} className={`p-6 ${isDarkMode ? "bg-sky-900 text-sky-200" : "bg-white text-sky-700"}p-4 border rounded-lg shadow-md flex justify-between items-center`}>
              <div>
                <p className="font-bold text-xl">{booking.room_name}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Check-in:</strong> {new Date(booking.check_in).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(booking.check_out).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => deleteBooking(booking.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
}
