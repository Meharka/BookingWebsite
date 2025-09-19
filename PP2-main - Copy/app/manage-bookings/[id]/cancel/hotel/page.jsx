
"use client";
import React, { useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia } from "typescript";
import { useFormState } from "react-dom";


const CancelledBooking = () => {
    const [booking, setbooking] = useState([]);
    const searchParams = useSearchParams();
    const { id } = useParams(); //booking id 
    const parsedId = parseInt(id);
    
    const userid = searchParams?.get("userid") || "";
    // const [role, setRole]
    
    const {loading , user, setUser} = useAuth();
    const router = useRouter();
    console.log("user:", user)
    
    


  //   {
  //     "bookingId": 31, 
  //     "userId": 1, 
  //     "role": "USER", 
  //     "hotel": false, 
  //     "flight": true
  // }


    useEffect(() => {
              if (!user && !loading) {
                router.push("/auth/login"); // Redirect to login if not logged in
              }
            }, [ user]);
            
    
    
    const cancelbooking = async () => {
      console.log("params", [user.id, parsedId]);
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/bookings/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" ,
        Authorization: `Bearer ${token}`
      },
        body: JSON.stringify({
          "bookingId": parsedId, 
          "userId": userid, 
          "role": user.role, 
          "hotel": true, 
          "flight": false
      }),
      });
      const data = await response.json();
      // console.log("I was logged and now below is data returned from api response ;;;;;;;;;-------------")
      console.log("API response:", data);
  
      setbooking(data);
      
    };

    useEffect(() => {
        if (!user) {
          console.log("Sorry you can't make this request");
          
        }else
        if (user && parsedId && !loading) {
          console.log("user role:", user.role)
          cancelbooking();
        }
        // createbooking();
      }, [ user, loading, id]);

      useEffect(() => {

        console.log("Booking: ", booking)
      }, [booking]);

      if(!Object.keys(booking).length > 0  || !("booking" in booking)){
        return <div className="text-red-500">
          <p>
            Message: Couldn't cancel booking
            </p>
          </div>;
      }
      if(!loading && !user){
        router.push("/auth/login");
      }
    
    return (
      <div>
      <div className="space-y-4 mt-16">
        <h2 className="text-xl font-bold">Booking Info</h2>
        <p>Status: {booking?.booking.status}</p>
        <p>Booking ID: {booking?.id}</p>
        {/* <p>{JSON.stringify(booking.booking)}</p> */}
        
        <h2 className="text-lg font-semibold mb-3 text-green-700">Hotel Booking</h2>
          {booking?.booking.hotelBookings && booking?.booking.hotelBookings.length > 0 ? (
            booking?.booking.hotelBookings.map((hotel, index) => (
            <ul className="text-sm space-y-1" key={index}>
              <li><strong>ID:</strong> {hotel.id}</li>
              <li><strong>Status:</strong> {hotel.status}</li>
              <li><strong>Check-in:</strong> {new Date(hotel.check_in).toLocaleDateString()}</li>
              <li><strong>Check-out:</strong> {new Date(hotel.check_out).toLocaleDateString()}</li>
              <li><strong>Hotel ID:</strong> {hotel.hotelId}</li>
              <li><strong>Room ID:</strong> {hotel.roomId}</li>
            </ul>
            ))
          ) : (
            <p className="text-gray-500">No hotels.</p>
          )}

        <h2 className="text-lg font-semibold mb-3 text-blue-700">Flight Booking</h2>
        
        {booking?.booking.flightBookings && booking?.booking.flightBookings.length > 0 ? (
            booking?.booking.flightBookings.map((flight, index) => (
              <ul key={flight.id || index} className="text-sm space-y-1 mb-4 border-b pb-2">
                <li><strong>ID:</strong> {flight.id}</li>
                <li><strong>Status:</strong> {flight.status}</li>
                <li><strong>Reference:</strong> {flight.reference}</li>
                <li><strong>Round Trip:</strong> {flight.roundTrip ? "Yes" : "No"}</li>
                <li><strong>Booked At:</strong> {new Date(flight.createdAt).toLocaleString()}</li>
              </ul>
            ))
          ) : (
            <p className="text-gray-500">No flights.</p>
          )}


  </div>
      </div>

    )

    
  }
  export default CancelledBooking;