"use client";
import React, { useEffect,  useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import Title from "@/components/Title";


const FindBooking = () => {
    const [bookingid, setBookingid] = useState("");
    const [userid, setuserid] = useState("");
    const {loading , user, setUser} = useAuth();
    //const [fahrenheit, setFahrenheit] = useState(32);

    // const fetchBooking = async () => {
    //     const response = await fetch("https://");
    //     const data = await response.json();
    
    //     setHolidays(data.holidays);
    //   };
  
    // useEffect(() => {
    //   ;
    // }, []);
    const router = useRouter();

    useEffect(() => {
              if (!user) {
                router.push("/auth/login"); // Redirect to login if not logged in
              }
            }, [loading, user]);
          if (loading) return <p>Loading...</p>;
          if (!user) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
  
      if (!bookingid || !userid) {
        alert("Please enter both Reservation Number and User ID.");
        return;
      }
      
      console.log("reached")
      console.log("user", user)
      console.log("userid: ", userid)
      console.log("logedinId:", user.id)
      if(Number(userid)!== Number(user.id)){
        
        alert("Logged in Id doesn't match the entered id");
        return;
      }
  
      // Redirect to the booking details page
      console.log("reached redirect to dashboard")
      // router.push(`/dashboard?bookingid=${bookingid}&userid=${userid}`)
      router.push(`/manage-bookings/${bookingid}?userid=${userid}`);
    };

    
  
    //console.log("I am called");
  
    return (
      <div className="mt-16">
        <Title text="View my Bookings" />
        <form onSubmit={handleSubmit}>
        <div>
          <label>Reservation Number:</label>
            <input 
            type= "text" 
            label="booking id" 
            className="w-full p-3 border border-gray-400 rounded-md"
            value={bookingid} 
            onChange={(e) => setBookingid(e.target.value)}  
            required/>
          </div>
          <div>
            <label>User ID:</label>
            <input
              type="text"
              label="user id"
              value={userid}
              onChange={(e) => setuserid(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded-md"
              required
            />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">View Booking</button>
        </form>
        
      </div>
    );
  };

  export default FindBooking;
