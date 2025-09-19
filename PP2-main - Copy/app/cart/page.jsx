"use client";
import React, { useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia, setConstantValue } from "typescript";
import { useFormState } from "react-dom";
import { Root } from "postcss/lib/postcss";
import { userInfo } from "os";


const GettingCart = () => {
    //const [hotelbooking, setHotelbooking] = useState("");
    const [flightData, setFlightData] = useState([]);
    const [hotelData, sethotelData] = useState({});
    const [selected_hotel, setSelectedHot] = useState({});
    const [selected_room, setSelectedRoom] = useState({})
    const [isflight, setIsFlight] = useState(false);
    const [ishotel, setIsHotel] = useState(false);

    const [worked, setWorked] = useState(false);
    const [nothingInCart, setNothingInCart] = useState(true)

    const [cart, setCart] = useState({});
    const {loading , user, setUser} = useAuth();
    const router = useRouter();
    console.log("user:", user)
    

            
    useEffect(() => {

        // console.log("local storage checkin: ",localStorage.getItem("selected-hotel"))
        // console.log("local storage checkin: ",localStorage.getItem("check-in"))
        // console.log("local storage checkOut: ",localStorage.getItem("check-out"))
        if(user && !loading){
            const userid = user?.id
    
            const info = JSON.parse(localStorage.getItem("cart") || "{}");
            if (Object.keys(info).length <= 1) {
                console.log(" cart has nothing except userid:", info);
                setNothingInCart(true)
            
            }
            if ("flight" in info){
                console.log("got inside flight")
                setNothingInCart(false)
                setFlightData(info.flight.details) 
                setIsFlight(true)
             
            }
            if ("hotel" in info){
                console.log("got inside hotel")
                sethotelData(info.hotel.details)
                setSelectedHot(info.hotel.details[0])
                setSelectedRoom(info.hotel.details[1])
                setNothingInCart(false)
                setIsHotel(true)
            }
            
            setCart(info)
            setWorked(true)
            console.log(" cart local:", info);
            }
        

    }, [user, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!user) {
          console.log("user not found yet")
          return;
        }
        if(user && Object.keys(cart).length > 1){
        console.log("reached")
        console.log("user", user)
        console.log("logedinId:", user.id)
        if(cart.userId!== Number(user.id)){
          
            alert("Logged in Id doesn't match the cart id");
            return;
          }
        }
        
    
        // Redirect to the booking details page
        //console.log("reached redirect to dashboard")
        router.push(`/manage-bookings/create`)
        //router.push(`/manage-bookings/${bookingid}?userid=${userid}`);
      };

      const handleEmptyCart = (e) => {
        e.preventDefault();
        localStorage.removeItem("cart")

        // Redirect to the booking details page
        //console.log("reached redirect to dashboard")
        router.push(`/`)
        //router.push(`/manage-bookings/${bookingid}?userid=${userid}`);
      };

    useEffect(() => {
            if (selected_room && selected_hotel && cart) {
              console.log("got here to check selected")
              console.log(" cart updated:", cart);
              console.log(" hotel selected updated:", selected_hotel);
              console.log(" selected room updated:", selected_room);
              console.log(" flight Data updated:", flightData);

            }
    
          
    }, [selected_hotel, selected_room,cart, user, flightData,  loading]);
    console.log("before return isFlight: ", isflight)
    console.log("before return isHotel: ", ishotel)

// --------------- need it for cart -----------------------
    if(!loading && user ){
    if (!user) {
            return (<p className="mt-16">Nothing in your cart. Login to see cart</p>) // Redirect to login if not logged in
        }
    if(nothingInCart){
        return (
            <h1 className="mt-16 ">
                Nothing is in your cart!
            </h1>
        )
    }
    if(isflight  && ishotel && (flightData.length>0) && (Object.keys(cart).length > 1) && (Object.keys(selected_hotel).length > 0) && (Object.keys(selected_hotel).length > 0)  ){
      return (
        <div className="mt-16">
        <div className="space-y-4">
        <h1 className="text-xl font-bold mt-4">Your Cart</h1>

          <h2 className="text-xl font-bold mt-4">Hotel</h2>
          <p> Hotel Name: {selected_hotel.name}</p>
          <p> Hotel Address: {selected_hotel.address}</p>
          <p></p>

          
            <div  className="border p-4 rounded-md bg-white shadow-sm"> Room 
              <p><strong>Room:</strong> {selected_room.name}</p>
              <p><strong>Price per night:</strong> {selected_room.price_per_night} </p>
              <p><strong>Amenities:</strong> {selected_room.amenities} </p>
              <div className="flex gap-2 mt-2">
              {selected_room.images && selected_room.images.length > 0 ? (
                    selected_room.images.map((imgLink, index) => (
                    <img
                        key={index}
                        src={imgLink}
                        alt={`Room image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-md"
                    />
                    ))
                ) : (
                    <p className="text-gray-500">No images available</p>
                )}
                </div>
                 
             </div>
                <h2 className="text-xl font-bold mt-4">Flights</h2>
                {flightData.map((flight, idx) => (
                <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
                    <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
                    <p><strong>From:</strong> {flight.origin?.city} ({flight.origin?.code})</p>
                    <p><strong>To:</strong> {flight.destination?.city} ({flight.destination?.code})</p>
                    <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
                    <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
                </div>
                ))}

                <button 
                className="border"
                onClick={(e) => handleSubmit(e)}>
                    Finalize Booking
                </button>
                <div>
                <button 
                className="border"
                onClick={(e) => handleEmptyCart(e)}>
                    Empty Cart
                </button>
                </div>
        </div>
    </div>
  
      )
    }
    if(!(isflight) && ishotel && (Object.keys(selected_hotel).length > 0) && (Object.keys(selected_room).length > 0) && (Object.keys(cart).length > 1) ){
        return (
            <div className="mt-16">
            <div className="space-y-4">
            <h1 className="text-xl font-bold mt-4">Your Cart</h1>
    
              <h2 className="text-xl font-bold mt-4">Hotel</h2>
              <p> Hotel Name: {selected_hotel.name}</p>
              <p> Hotel Address: {selected_hotel.address}</p>
              <p></p>
    
              
                <div  className="border p-4 rounded-md bg-white shadow-sm"> Room 
                  <p><strong>Room:</strong> {selected_room.name}</p>
                  <p><strong>Price per night:</strong> {selected_room.price_per_night} </p>
                  <p><strong>Amenities:</strong> {selected_room.amenities} </p>
                  <div className="flex gap-2 mt-2">
                    {selected_room.images && selected_room.images.length > 0 ? (
                        selected_room.images.map((imgLink, index) => (
                        <img
                            key={index}
                            src={imgLink}
                            alt={`Room image ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-md"
                        />
                        ))
                    ) : (
                        <p className="text-gray-500">No images available</p>
                    )}
                    </div>
                  
                 </div>
                 <button 
                 className="border"
                 onClick={(e) => handleSubmit(e)}>
                    Finalize Booking
                </button>
                <div>
                <button 
                className="border"
                onClick={(e) => handleEmptyCart(e)}>
                    Empty Cart
                </button>
                </div>
                </div>
        </div>
      
          )

    }
    return (
        <div className="mt-16">
        <div className="space-y-4">
        <h1 className="text-xl font-bold mt-4">Your Cart</h1>
                <h2 className="text-xl font-bold mt-4">Flights</h2>
                {flightData.map((flight, idx) => (
                <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
                    <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
                    <p><strong>From:</strong> {flight.origin?.city} ({flight.origin?.code})</p>
                    <p><strong>To:</strong> {flight.destination?.city} ({flight.destination?.code})</p>
                    <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
                    <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
                </div>
                ))}

                <button 
                className="border"
                onClick={(e) => handleSubmit(e)}>
                    Finalize Booking
                </button>
                <div>
                <button 
                className="border"
                onClick={(e) => handleEmptyCart(e)}>
                    Empty Cart
                </button>
                </div>
            </div>
    </div>
  
      )
    }
    return <p className="m-16">Loading...</p>;
    // -------------------need for cart -------------------------
    
  }
  export default GettingCart;


