
"use client";
import React, { use, useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia } from "typescript";
import { useFormState } from "react-dom";


const CreateBooking = () => {
    //const [hotelbooking, setHotelbooking] = useState("");
    // {
    //     "check_in": "2025-03-11",
    //     "check_out": "2025-03-15",
    //     "hotelId": 1,
    //     "roomId": 1,
    //     "userId": 2, 
    //     "departureIDS": ["cb2dc646-1f67-4e11-9b26-58f483542646", "65a9a89a-1e43-4992-b499-a548b3d8f659"],
    //     "returnIDS" : ["7e3271c4-a7ee-4526-8df7-68698dfe2cdc", "c6d725f8-2ef5-468e-8e13-6c70c98efcff"],
    //     "roundTrip":"true",
    //     "flightBook": "true", 
    //     "hotelBook": "true"
      
    //   }
    const [cart1, setCart1] = useState({});
    const [bookingData, setBookingData] = useState({});
    var sanity_check;


    
    const [userId, setUserId] = useState(0);
    const [departureIds, setDepartureId] = useState("");
    const [returnIds, setReturnId] = useState("");
    const [roundtrip, setRoundTrip] = useState("false");
    const [flightDetails, setFlightDetails] = useState([])
    const [flightBook, setflightBook] = useState("false");

    const [check_in, setCheckin] = useState("");
    const [check_out, setCheckout] = useState("");
    const [hotelId, setHotelId] = useState(0);
    const [roomId, setRoomId] = useState(0);
    const [hotelBook, sethotelBook] = useState("false");
    const [hotelDetails, setHotelDetails] = useState({})
    const [roomDetails, setRoomDetails] = useState({})

    const [worked, setWorked] = useState(false);
    const {loading , user, setUser} = useAuth();
    const router = useRouter();
    console.log("user:", user)


    useEffect(() => {
              if (!user) {
                router.push("/auth/login?redirectTo=/manage-bookings/create/flightBooking"); // Redirect to login if not logged in
              }
              // if (loading) return (<p>Loading...</p>);
              // if (!user) return  <p>Redirecting to login...</p>;;
            }, [ user]);

    
    useEffect(() => {

        // console.log("local storage checkin: ",localStorage.getItem("selected-hotel"))
        // console.log("local storage checkin: ",localStorage.getItem("check-in"))
        // console.log("local storage checkOut: ",localStorage.getItem("check-out"))
        if(user && !loading){
            
    
            const info = JSON.parse(localStorage.getItem("cart") || "{}");
            // if (Object.keys(info).length <= 1) {
            //     console.log(" cart has nothing except userid:", info);
            //     setNothingInCart(true)
            
            // }
            if ("flight" in info){
                console.log("got inside flight")
                setDepartureId(info.flight.departureIDS)
                setReturnId(info.flight.returnIDS)
                setflightBook(info.flight.flightBook) 
                setFlightDetails(info.flight.details)
                setRoundTrip(info.flight.roundTrip)
                setUserId(info.userId)
                
             
            }
            if ("hotel" in info){
                console.log("got inside hotel")
                setHotelId(info.hotel.hotelId)
                setRoomId(info.hotel.roomId)
                setCheckin(info.hotel.check_in)
                setCheckout(info.hotel.check_out)
                setUserId(info.userId)
                setHotelDetails(info.hotel.details[0])
                setRoomDetails(info.hotel.details[1])
                
            }
            
            setCart1(info)
            //setWorked(true)
            console.log(" cart local:", info);
            }
        

    }, [user, loading]);

    useEffect(() => {
        console.log("reached 1")
        console.log(" cart1 at 1: ", cart1)
        if(Object.keys(cart1).length > 1){
            console.log("cart upd: ", cart1)
        }else{
            console.log("cart not yet: ", cart1)
        }
      }, [cart1, user, userId, loading]);

            

    
    var checkindate = ""
    var checkoutdate = ""
    var hotelid = ""
    var roomid = ""
    var hotelbook= "false"

    var deptId = []
    var retId = []
    var round = ""
    var flightbook="false" 
    var user_id = 0;
    
    
    const createbooking = async () => {
      if("hotel" in cart1){
      checkindate = cart1.hotel.check_in
      checkoutdate = cart1.hotel.check_out
      hotelid = cart1.hotel.hotelId
      roomid = cart1.hotel.roomId 
      hotelbook = cart1.hotel.hotelBook
      user_id = cart1.userId
    }
        if("flight" in cart1){
      deptId = cart1.flight.departureIDS
      retId = cart1.flight.returnIDS
      round = (cart1.flight.roundTrip)
      flightbook = (cart1.flight.flightBook).toString()
      user_id = cart1.userId
    }
      if(!("flight" in cart1) && !("hotel" in cart1)){
        return (<p>Cart empty</p>)
      }
      console.log("All info: ", [checkindate, checkoutdate, hotelid, roomid, hotelbook, deptId, retId, round, flightbook])

      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
        Authorization: `Bearer ${token}`
      },
        body: JSON.stringify(
            {
                "check_in": checkindate,
                "check_out": checkoutdate,
                "hotelId": hotelid,
                "roomId": roomid,
                "userId": user_id, 
                "departureIDS": deptId,
                "returnIDS" : retId,
                "roundTrip": round,
                "flightBook": flightbook, 
                "hotelBook": hotelbook,
              
              }
        ),
      });
      const data = await response.json();
      // console.log("I was logged and now below is data returned from api response ;;;;;;;;;-------------")
      console.log("API response:", data);
      if(response.ok && ("Itinerary" in data)){
        setWorked(true)
      }else{
        setWorked(false)
      }
  
      setBookingData(data);
      
      //setOutbound(data.Itinerary.outboundFlight)
      // setFlightBooking(data.iternary.flightBookings);
      // setHotelBooking(data.iternary.hotelBookings);
  
      // console.log("hotelBookings", hotelBooking);
      // console.log("flightBookings", flightBooking);
      
    };

    useEffect(() => {
        if (!user.id) {
          alert("Sorry you can't make this request");
          
        }
        console.log("userID: ", userId)
        console.log("user.id: ", user.id)
        console.log("reached 2")
        
        if (user && userId && (Object.keys(cart1).length >1)  && !loading) {
            if(user.id !== userId){
                console.log("not same id yet")
            }
            else{
          console.log("reached create booking")
          createbooking();}
        }
        // createbooking();
      }, [cart1, userId, user, loading]);

      useEffect(() => {
        console.log("booking data before len: ", bookingData)
        if(Object.keys(bookingData).length > 0){
            console.log("Bookingdata: ", bookingData)
        }else{
            console.log("Bookingdata not set yet: ", bookingData)
        }
      }, [bookingData,cart1, user, userId, loading]);

      if(!worked){
        return <div className="text-red-500">
          <p>
            Couldn't Finalize booking
            </p>
          </div>;
      }

      const handleSubmit = (e) => {
        e.preventDefault();
    
        // Redirect to the booking details page
        console.log("reached redirect to checkout")
        router.push(`/manage-bookings/${bookingData.Itinerary.id}/checkout`)
        //router.push(`/manage-bookings/${bookingid}?userid=${userid}`);
      };
  
      console.log("worked:", worked)

      // The formatting below has been done with the help of AI. 
      if(worked){
        if(worked && !(bookingData.Itinerary.flightBookings.length >0) && !(bookingData.Itinerary.hotelBookings.length > 0) ){
            return <p>No flights or hotels founds</p>
        }
    
        if(worked && !(bookingData.Itinerary.flightBookings.length >0) && bookingData.Itinerary.hotelBookings.length > 0 ){
            return(
            <div className="max-w-2xl mx-auto mt-16 p-6 bg-white shadow-lg rounded-2xl">
            {/* Hotel Booking Section */}
            {bookingData.Itinerary.hotelBookings?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700">Hotel </h3>
                  {bookingData.Itinerary.hotelBookings.map((hotel, idx) => (
                    <div key={idx} className="mt-2 border p-4 rounded-lg bg-green-50">
                      <p><strong>Booking ID:</strong> {hotel.id}</p>
                      <p><strong>Status:</strong> {hotel.status}</p>
                      <p><strong>Hotel ID:</strong> {hotel.hotelId}</p>
                      <p><strong>Room ID:</strong> {hotel.roomId}</p>
                      <p><strong>Check-in:</strong> {new Date(hotel.check_in).toLocaleDateString()}</p>
                      <p><strong>Check-out:</strong> {new Date(hotel.check_out).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
              <button 
                className="border rounded-full text-2xl "
                onClick={(e) => handleSubmit(e)}>
                    Checkout
                </button>
              </div>

            )
        }

      if(worked && bookingData.Itinerary.flightBookings.length >0 && bookingData.Itinerary.hotelBookings.length > 0 ){
      return (
        <div className="max-w-2xl mx-auto mt-16 p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Booking Summary</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Itinerary ID: {bookingData.Itinerary?.id}</h3>
          <p className="text-sm text-gray-500">Created At: {new Date(bookingData.Itinerary?.createdAt).toLocaleString()}</p>
        </div>
    
        {/* Hotel Booking Section */}
        {bookingData.Itinerary.hotelBookings?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-700">Hotel </h3>
            {bookingData.Itinerary.hotelBookings.map((hotel, idx) => (
              <div key={idx} className="mt-2 border p-4 rounded-lg bg-green-50">
                <p><strong>Booking ID:</strong> {hotel.id}</p>
                <p><strong>Status:</strong> {hotel.status}</p>
                <p><strong>Hotel ID:</strong> {hotel.hotelId}</p>
                <p><strong>Room ID:</strong> {hotel.roomId}</p>
                <p><strong>Check-in:</strong> {new Date(hotel.check_in).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(hotel.check_out).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
    
        {/* Flight Booking Section */}
        {bookingData.Itinerary.flightBookings?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-700">Flight </h3>
            {bookingData.Itinerary.flightBookings.map((flight, idx) => (
              <div key={idx} className="mt-2 border p-4 rounded-lg bg-blue-50">
                <p><strong>Booking ID:</strong> {flight.id}</p>
                <p><strong>Status:</strong> {flight.status}</p>
                <p><strong>Round Trip:</strong> {flight.roundTrip ? "Yes" : "No"}</p>
                <p><strong>Reference:</strong> {flight.reference || "N/A"}</p>
              </div>
            ))}
          </div>
        )}
        <button 
            className="border rounded-full text-2xl"
            onClick={(e) => handleSubmit(e)}>
            Checkout
        </button>
      </div>
    )
    }
    
    
    return (
        <div className="max-w-2xl mx-auto mt-16 p-6 bg-white shadow-lg rounded-2xl">
        {/* Flight Booking Section */}
        {bookingData.Itinerary.flightBookings?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700">Flight </h3>
              {bookingData.Itinerary.flightBookings.map((flight, idx) => (
                <div key={idx} className="mt-2 border p-4 rounded-lg bg-blue-50">
                  <p><strong>Booking ID:</strong> {flight.id}</p>
                  <p><strong>Status:</strong> {flight.status}</p>
                  <p><strong>Round Trip:</strong> {flight.roundTrip ? "Yes" : "No"}</p>
                  <p><strong>Reference:</strong> {flight.reference || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        <button 
            className="border rounded-full text-2xl"
            onClick={(e) => handleSubmit(e)}>
            Checkout
        </button>
          </div>
    )
  }
}
  export default CreateBooking;


