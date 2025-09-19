"use client";
import React, { useEffect, useState } from "react";
// import Input from "@/components/Input";
// import Title from "@/components/Title";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";



const Booking1 = () => {

  const searchParams = useSearchParams();
  const { id } = useParams();
  console.log("bookingid:", id)

  // const bookingId = searchParams?.get("bookingid") || "";
  const userid = searchParams?.get("userid") || "";
  const {loading , user, setUser} = useAuth();
  

  const [bookings, setBooking ] = useState({});
  const [flightBooking, setFlightBooking] = useState([]);
  const [error, setError] = useState(null);
  const [hotelBooking, setHotelBooking] = useState([]);
  const router = useRouter();

  useEffect(() => {
          if (!loading && !user) {
            router.push("/auth/login"); // Redirect to login if not logged in
          }
          // if (loading) return <p>Loading...</p>;
          // if (!user) return  <p>Redirecting to login...</p>;;
        }, [ user]);
    


  const fetchbooking = async () => {
    const response = await fetch(`http://localhost:3000/api/users/${userid}/bookings/${id}?bookingId=${id}&userId=${userid}`);
    const data = await response.json();
    // console.log("I was logged and now below is data returned from api response ;;;;;;;;;-------------")
    // console.log("API response:", data);

    setBooking(data.iternary);
    setFlightBooking(data.iternary.flightBookings);
    setHotelBooking(data.iternary.hotelBookings);

    console.log("hotelBookings", hotelBooking);
    console.log("flightBookings", flightBooking);
    
  };
  // useEffect(() => {
  //   if (!id || !userid) {
  //     setError("Invalid booking request.");
  //     return;
  //   }}, []);

  useEffect(() => {
    if (!id || !userid) {
      console.log("Invalid booking request.");
      
    }
    if(user && id && userid){
      console.log("role:", user.role)
      console.log("role=USER?:", user.role==="USER")
    fetchbooking();}
  }, [id,user, userid]);

  const handleCancelFlightBooking = (e) => {
    e.preventDefault();

    if (!id || !userid) { //id represents booking id
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
    //console.log("reached dashboard redirect to id")
    router.push(`/manage-bookings/${id}/cancel/flight?userid=${userid}`);
  };
  const handleCancelHotelBooking = (e) => {
    e.preventDefault();

    if (!id || !userid) { //id represents booking id
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
    //console.log("reached dashboard redirect to id")
    router.push(`/manage-bookings/${id}/cancel/hotel?userid=${userid}`);
  };
  const handleCancelEntireBooking = (e) => {
    e.preventDefault();

    if (!id || !userid) { //id represents booking id
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
    //console.log("reached dashboard redirect to id")
    router.push(`/manage-bookings/${id}/cancel?userid=${userid}`);
  };



return (
    <div className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Booking Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Flight Booking */}
        <div className="border rounded-xl p-4 shadow-sm">

        <h2 className="text-lg font-semibold mb-3 text-blue-700">Flight Booking</h2>
        
        {flightBooking && flightBooking.length > 0 ? (
            flightBooking.map((flight, index) => (
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

          {/* Hotel Booking */}
        <div className="border rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-green-700">Hotel Booking</h2>
          {hotelBooking && hotelBooking.length > 0 ? (
            hotelBooking.map((hotel, index) => (
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
        </div>


        </div>

        
      </div>

      <div className="mt-10 space-y-3">
        <button
          onClick={() => router.push("/bookings")}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow"
        >
          Find Another Booking
        </button>

        <button
          onClick={(e) => handleCancelFlightBooking(e)}
          className="block bg-black text-white px-4 py-2 rounded shadow"
        >
          Cancel Flight Booking
        </button>

        <button
          onClick={(e) => handleCancelHotelBooking(e)}
          className="block bg-black text-white px-4 py-2 rounded shadow"
        >
          Cancel Hotel Booking
        </button>

        <button
          onClick={(e) => handleCancelEntireBooking(e)}
          className="block bg-black text-white px-4 py-2 rounded shadow"
        >
          Cancel Entire Booking
        </button>
      </div>
      
    </div>
  );
};

export default Booking1;

