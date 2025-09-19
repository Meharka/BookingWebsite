"use client";

import React, { useEffect,  useState } from "react";
//import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useParams, useRouter } from "next/navigation";

const Dashboard = () => {
  const searchParams = useSearchParams();
    const userid = searchParams?.get("userid") || "";
    const bookingid = searchParams?.get("bookingid") || "";
    //const [bookingid, setBookingid] = useState("");
    //const [userid, setuserid] = useState("");
    const {loading , user, setUser} = useAuth();

    //console.log(user)
    //const [user, setUser] = useState("");
    const router = useRouter();
    
    //console.log("user", user)



    useEffect(() => {
        if (!user && !loading) {
          router.push("/auth/login"); // Redirect to login if not logged in
        }
      }, [loading, user]);
    if (loading) return <p>Loading...</p>;
    if (!user) return null;


    const handleViewBooking = (e) => {
      e.preventDefault();
  
      if (!bookingid || !userid) {
        alert("Please enter both Reservation Number and User ID.");
        return;
      }
      
      // console.log("reached")
      // console.log("user", user)
      // console.log("userid: ", userid)
      // console.log("logedinId:", user.id)
      if(Number(userid)!== Number(user.id)){
        
        alert("Logged in Id doesn't match the entered id");
        return;
      }
  
      // Redirect to the booking details page
      //router.push("/dashboard")
      router.push(`/manage-bookings/${bookingid}?userid=${userid}`);
    };

    const handleMakeBooking = (e) => {
      e.preventDefault();
  
      if (!bookingid || !userid) {
        alert("Please enter both Reservation Number and User ID.");
        return;
      }
      
      // console.log("reached")
      // console.log("user", user)
      // console.log("userid: ", userid)
      // console.log("logedinId:", user.id)
      if(Number(userid)!== Number(user.id)){
        
        alert("Logged in Id doesn't match the entered id");
        return;
      }
  
      // Redirect to the booking details page
      //router.push("/dashboard")
      router.push(`/cart`);
    };

    const handleCancelBooking = (e) => {
      e.preventDefault();
  
      if (!bookingid || !userid) {
        alert("There is no bookingid or userid");
        return;
      }
      
      // console.log("reached")
      // console.log("user", user)
      // console.log("userid: ", userid)
      // console.log("logedinId:", user.id)
      if(Number(userid)!== Number(user.id)){
        
        alert("Logged in Id doesn't match the entered id");
        return;
      }
  
      // Redirect to the booking details page
      //router.push("/dashboard")
      console.log("reached dashboard redirect to id")
      router.push(`/manage-bookings/${bookingid}/cancel?userid=${userid}`);
    };


    return (
        <div className="pt-20">
        
        <h1> Welcome {user.first_name}. Please click following links to navigate in your account</h1>
        <table>
          <thead>
          </thead>
          <tbody>
          <tr>
            <td>
        <button 
        className="bg-blue-950 border border-blue-950 text-white"
        onClick={(e) => handleViewBooking(e)}>
          View Bookings
        </button>
        </td>
        <td>
        <button 
        className="bg-blue-950 border border-blue-950 text-white"
        onClick={(e) => handleMakeBooking(e)}>
          Make a booking
        </button>
        </td>
        <td>
        <button 
        className="bg-blue-950 border border-blue-950 text-white"
        onClick={(e)=>handleCancelBooking(e)}>
          Cancel
        </button>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
    )
}

export default Dashboard;



    
    

