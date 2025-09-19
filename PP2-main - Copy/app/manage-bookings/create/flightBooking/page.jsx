
"use client";
import React, { useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia } from "typescript";
import { useFormState } from "react-dom";


const CreateBooking = () => {
    //const [hotelbooking, setHotelbooking] = useState("");
    const [flightdata, setFlightdata] = useState([]);

    const [flightIds, setFlightIds] = useState([]);

    const [outbound, setOutbound] = useState();
    const [returnFlight, setReturnFLight] = useState();
    const [departureIds, setDeparture] = useState("");
    const [returnIds, setReturn] = useState("");
    const [worked, setWorked] = useState(false);
    const [roundtrip, setRoundTrip] = useState("false");
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
          var round = false;
          const depIds = JSON.parse(localStorage.getItem("departureIDS") || "[]");
          const retIds = JSON.parse(localStorage.getItem("returnIDS") || "[]");
          const data = JSON.parse(localStorage.getItem("flightData") || "[]");
          const cart = JSON.parse(localStorage.getItem("cart") || "{}");
          console.log("return Ids inside flightBooking", retIds)
          console.log("return Ids LENGTH inside flightBooking", retIds.length)
          if(retIds.length <=0){
            round = "false"
          }else{
            round = "true"
          }
          setFlightdata(data)

          localStorage.setItem(
            "cart",
            JSON.stringify({
              ...cart,
              userId: user.id,
              flight: {"departureIDS": depIds, "returnIDS": retIds, "roundTrip": round, "flightBook": true, "details": data},
              
            })
          );
          setWorked(true)

          console.log(" cart:", JSON.parse(localStorage.getItem("cart")));
          // setDeparture(depIds);
          // setReturn(retIds)
          // setFlightIds([...depIds, ...retIds])
          
          // console.log("depIds: ", flightInfo)
        // } catch (err) {
        //   console.error("Failed to parse flightData from localStorage:", err);
        // }
        // localStorage.removeItem("departureIDS");
        // localStorage.removeItem("returnIDS");

    }, [user, loading]);

      useEffect(() => {
        if(flightdata.length > 0 ){
          console.log("flightdata: ", flightdata)
          localStorage.removeItem("departureIDS");
          localStorage.removeItem("returnIDS");
          localStorage.removeItem("flightData");}
      }, [flightdata, loading]);

      if(!worked){
        return <div className="text-red-500">
          <p>
            Couldn't add flight to cart.
            </p>
          </div>;
      }
      return (
        <p className="mt-16">Your flight was added to cart successfully. View Cart</p>
      )

  //   if(returnIds.length >0){
  //   return (
  //     <div>
  //     <div className="space-y-4">
  //       <h2 className="text-xl font-bold">Booking Info</h2>
  //       <p>Status: {flightbooking?.Booking_info?.status}</p>
  //       <p>Booking ID: {flightbooking?.Booking_info?.id}</p>
  //       <p>Roundtrip: {flightbooking?.Booking_info?.roundTrip}</p>
        

  //       <h2 className="text-xl font-bold mt-4">Outbound Flight</h2>
  //       {flightbooking?.Itinerary?.outboundFlight?.map((flight, idx) => (
  //         <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
  //           <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
  //           <p><strong>From:</strong> {flight.origin?.city} ({flight.origin?.code})</p>
  //           <p><strong>To:</strong> {flight.destination?.city} ({flight.destination?.code})</p>
  //           <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
  //           <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
  //           <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
  //       </div>
  //     ))}

  //       <h2 className="text-xl font-bold mt-4">Return Flight</h2>
  //       {flightbooking?.Itinerary?.returnFlight?.map((flight, idx) => (
  //         <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
  //           <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
  //           <p><strong>From:</strong> {flight.origin?.city} ({flight.origin?.code})</p>
  //           <p><strong>To:</strong> {flight.destination?.city} ({flight.destination?.code})</p>
  //           <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
  //           <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
  //           <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
  //       </div>
  //     ))}
  // </div>
  //     </div>

  //   )}

    // return (
    //   <div>
    //   <div className="space-y-4">
    //     <h2 className="text-xl font-bold">Booking Info</h2>
    //     <p>Status: {flightbooking?.Booking_info?.status}</p>
    //     <p>Booking ID: {flightbooking?.Booking_info?.id}</p>
    //     <p>Roundtrip: {flightbooking?.Booking_info?.roundTrip}</p>
        

    //     <h2 className="text-xl font-bold mt-4">Outbound Flight</h2>
    //     {flightbooking?.Itinerary?.outboundFlight?.map((flight, idx) => (
    //       <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
    //         <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
    //         <p><strong>From:</strong> {flight.origin?.city} ({flight.origin?.code})</p>
    //         <p><strong>To:</strong> {flight.destination?.city} ({flight.destination?.code})</p>
    //         <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
    //         <p><strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}</p>
    //         <p><strong>Price:</strong> {flight.price} {flight.currency}</p>
    //     </div>
    //     ))}
    //   </div>
    //     </div>

    // )
    
  }
  export default CreateBooking;


