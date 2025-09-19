"use client";
import React, { use, useEffect, useState } from "react";
// import Input from "@/components/Input";
// import Title from "@/components/Title";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";



const FinalBook = () => {
  const router = useRouter();

  //const searchParams = new URLSearchParams(router.query);
  const { id } = useParams();
  console.log("bookingid:", id)

  // const bookingId = searchParams?.get("bookingid") || "";
//   const userid = searchParams?.get("userid") || "";
  const {loading , user, setUser} = useAuth();
  

  const [bookings, setBooking ] = useState({});
  const [invoice, setInvoice] = useState({})

  const [bookingId, setBookingid] = useState(0)
  
  
  const [error, setError] = useState(null);
  const [ranOnce, setRanOnce] = useState(false)
//   const [hotelBooking, setHotelBooking] = useState([]);

  // const createInvoice = async () => {
  //   const token = localStorage.getItem("token")
  //   const response = await fetch(`http://localhost:3000/api/users/${user.id}/bookings/${bookingId}/invoice?bookingId=${bookingId}&userId=${user.id}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" ,
  //       Authorization: `Bearer ${token}`
  //     },
  //     }); 
  //     const data = await response.json();
  //     setInvoice(data)
  //     console.log("APi res invoice: ", data)
  // }
  

  useEffect(() => {
          if (!loading && !user) {
            router.push(`/auth/login?redirectTo=manage-bookings/${id}/checkout`); // Redirect to login if not logged in
          }
        //   if (loading) return <p>Loading...</p>;
        //   if (!user) return  <p>Redirecting to login...</p>;
        }, [ user, loading]);
    
    useEffect(() => {
        if (!loading && id && user && !ranOnce) {
            
        console.log("userid", user.id);
        const data = JSON.parse(localStorage.getItem("finalizedBooking") || "{}")
        setRanOnce(true)
        setBooking(data)
        setBookingid(data.booking.id)
        //   return;
        }
    }, [ user, loading]);

  //   useEffect(() => {
  //     if (!loading  && user && bookingId) {
          
  //     console.log("userid", user.id);
  //     console.log("Bookingid", bookingId);
  //     createInvoice();
      
  //     //   return;
  //     }
  // }, [ user, bookingId, loading]);

  // useEffect(() => {
  //   if (!loading  && user && bookingId && Object.keys(invoice).length>0) {
        
  //   console.log("userid", user.id);
  //   console.log("Bookingid", bookingId);
  //   console.log("Invoince", invoice);
    
  //   //   return;
  //   }
  // }, [ user, bookingId, invoice, loading]);

    useEffect(() => {
        if (!loading && id && user  && Object.keys(bookings).length>0) {
          console.log("Bookings", bookings);
        //   return;
        }}, [bookings, user, loading]);
    

    // useEffect(() => {
    //     if (!loading && id && user && Object.keys(bookings).length>0) {
    //         // if(("message" in bookings) || "error" in bookings){
    //         //     console.log("couldn't get booking")
    //         // }
    //         //localStorage.removeItem("finalizedBooking")
    //     //   return;
    //     }
    // }, [bookings,  user, loading]);

  
  

  const handleSubmit = (e) => {
     e.preventDefault();

    if (!id ) { //id represents booking id
      alert("There is no bookingid ");
      return;
    }
    
    router.push(`/dashboard`)
  };
  //have used ChatGpt as help to create pdf because I was having a lot of errors
  const handleDownload = async () => {
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3000/api/users/{userId}/bookings/{bookingid}/invoice?bookingId=${bookingId}&userId=${user.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token}`
          }
    });
  
    if (!res.ok) {
      alert("Something went wrong!");
      return;
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  


  if(Object.keys(bookings).length >0){
  if(bookings.booking.hotelBookings.length > 0 && bookings.booking.flightBookings.length>0 && bookingId && user){
    return (
      <div className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 mt-16">
        <h1 className="text-3xl font-semibold mb-6">Booking Confirmation</h1>
  
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          {/* Booking Information */}
          <div className="text-lg font-medium text-gray-800">
            <h2 className="text-xl font-semibold text-blue-600">Booking ID: {bookings.booking.id}</h2>
            <p className="text-gray-600">Created at: {new Date(bookings.booking.createdAt).toLocaleString()}</p>
            <p className="text-gray-600">Updated at: {new Date(bookings.booking.updatedAt).toLocaleString()}</p>
          </div>
  
          {/* Flight Booking */}
          {bookings.booking.flightBookings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-blue-600">Flight Booking</h3>
              <div className="space-y-4 mt-4">
                {bookings.booking.flightBookings.map((flight, index) => (
                  <div key={flight.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <p><strong>Reference:</strong> {flight.reference}</p>
                    <p><strong>Status:</strong> {flight.status}</p>
                    <p><strong>Round Trip:</strong> {flight.roundTrip ? "Yes" : "No"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Hotel Booking */}
          {bookings.booking.hotelBookings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-blue-600">Hotel Booking</h3>
              <div className="space-y-4 mt-4">
                {bookings.booking.hotelBookings.map((hotel, index) => (
                  <div key={hotel.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <p><strong>Room ID:</strong> {hotel.roomId}</p>
                    <p><strong>Status:</strong> {hotel.status}</p>
                    <p><strong>Check-in Date:</strong> {new Date(hotel.check_in).toLocaleDateString()}</p>
                    <p><strong>Check-out Date:</strong> {new Date(hotel.check_out).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Confirmation Message */}
          <div className="mt-6 bg-green-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-green-700">Your booking was successful!</h3>
            <p className="text-gray-600">Thank you for booking with us.</p>
            {/* <p>{JSON.stringify(invoice)}</p> */}
            <button onClick={() => handleDownload()} className="bg-blue-600 text-white p-3 rounded">
            Download PDF Invoice
          </button>
          </div>
        </div>
      </div>
    );}
    if(!(bookings.booking.hotelBookings.length > 0 )&& bookings.booking.flightBookings.length>0 && bookingId && user){
      return (
        <div className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 mt-16">
          <h1 className="text-3xl font-semibold mb-6">Booking Confirmation</h1>
    
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            {/* Booking Information */}
            <div className="text-lg font-medium text-gray-800">
              <h2 className="text-xl font-semibold text-blue-600">Booking ID: {bookings.booking.id}</h2>
              <p className="text-gray-600">Created at: {new Date(bookings.booking.createdAt).toLocaleString()}</p>
              <p className="text-gray-600">Updated at: {new Date(bookings.booking.updatedAt).toLocaleString()}</p>
            </div>
    
            {/* Flight Booking */}
            {bookings.booking.flightBookings.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-blue-600">Flight Booking</h3>
                <div className="space-y-4 mt-4">
                  {bookings.booking.flightBookings.map((flight, index) => (
                    <div key={flight.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                      <p><strong>Reference:</strong> {flight.reference}</p>
                      <p><strong>Status:</strong> {flight.status}</p>
                      <p><strong>Round Trip:</strong> {flight.roundTrip ? "Yes" : "No"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
    
    
            {/* Confirmation Message */}
            <div className="mt-6 bg-green-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-green-700">Your booking was successful!</h3>
              <p className="text-gray-600">Thank you for booking with us.</p>
              <button onClick={() => handleDownload()} className="bg-blue-600 text-white p-3 rounded">
                Download PDF Invoice
              </button>
            </div>
          </div>
        </div>
      );}
  
      
          return (
            <div className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 mt-16">
              <h1 className="text-3xl font-semibold mb-6">Booking Confirmation</h1>
        
              <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                {/* Booking Information */}
                <div className="text-lg font-medium text-gray-800">
                  <h2 className="text-xl font-semibold text-blue-600">Booking ID: {bookings.booking.id}</h2>
                  <p className="text-gray-600">Created at: {new Date(bookings.booking.createdAt).toLocaleString()}</p>
                  <p className="text-gray-600">Updated at: {new Date(bookings.booking.updatedAt).toLocaleString()}</p>
                </div>
        
        
                {/* Hotel Booking */}
                {bookings.booking.hotelBookings.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600">Hotel Booking</h3>
                    <div className="space-y-4 mt-4">
                      {bookings.booking.hotelBookings.map((hotel, index) => (
                        <div key={hotel.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                          <p><strong>Room ID:</strong> {hotel.roomId}</p>
                          <p><strong>Status:</strong> {hotel.status}</p>
                          <p><strong>Check-in Date:</strong> {new Date(hotel.check_in).toLocaleDateString()}</p>
                          <p><strong>Check-out Date:</strong> {new Date(hotel.check_out).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
        
                {/* Confirmation Message */}
                <div className="mt-6 bg-green-100 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-green-700">Your booking was successful!</h3>
                  <p className="text-gray-600">Thank you for booking with us.</p>
                  <button onClick={() => handleDownload()} className="bg-blue-600 text-white p-3 rounded">
                    Download PDF Invoice
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
            <p>Loading...</p>
        )
};

export default FinalBook;