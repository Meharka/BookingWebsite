
"use client";
import React, { useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia } from "typescript";
import { useFormState } from "react-dom";


const CancelledBooking = () => {
    const [booking, setbooking] = useState([]);
    const searchParams = useSearchParams();

    const { hotelid } = useParams(); //hotel id 
    const userid = searchParams?.get("userId") || "";
    const bookingId = searchParams?.get("bookingId") || "";
    const role = searchParams?.get("role") || "";
    // const [role, setRole]
    
    const {loading , user, setUser} = useAuth();
    const router = useRouter();
    //console.log("user:", user)

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
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3000/api/users/{userid}/hotels/{hotelid}/bookings/{bookingId}/cancel?hotelId=${hotelid}&bookingId=${bookingId}&userId=${userid}&role=${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" ,
        Authorization: `Bearer ${token}`
      },
      });
      const data = await response.json();
      // console.log("I was logged and now below is data returned from api response ;;;;;;;;;-------------")
      console.log("API response:", data);
  
      setbooking(data);
      
    };

    useEffect(() => {
        if (!user && !loading) {
          console.log("Sorry you can't make this request");
          
        }else
        if (user && bookingId && !loading) {
          console.log("user role:", user.role)
          cancelbooking();
        }
        // createbooking();
      }, [ user, loading, bookingId]);

      useEffect(() => {

        console.log("Booking: ", booking)
      }, [booking]);

      if(!Object.keys(booking).length > 0 ||!("booking" in booking)){
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
        <p>Booking ID: {booking?.booking.id}</p>
        {/* <p>{JSON.stringify(booking.booking)}</p> */}
        
        <h2 className="text-lg font-semibold mb-3 text-green-700">Hotel Booking</h2>
          {booking?.booking  ? (
            
            <ul className="text-sm space-y-1" key={booking?.booking.hotelId}>
              <li><strong>Booking ID:</strong> {booking?.booking.id}</li>
              <li><strong>Status:</strong> {booking?.booking.status}</li>
              <li><strong>Check-in:</strong> {new Date(booking?.booking.check_in).toLocaleDateString()}</li>
              <li><strong>Check-out:</strong> {new Date(booking?.booking.check_out).toLocaleDateString()}</li>
              <li><strong>Hotel ID:</strong> {booking?.booking.hotel.hotelId}</li>
              <li><strong>Room ID:</strong> {booking?.booking.hotel.roomId}</li>
            </ul>
            
          ) : (
            <p className="text-gray-500">No hotels.</p>
          )}


  </div>
      </div>

    )

    
  }
  export default CancelledBooking;