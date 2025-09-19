
"use client";
import React, { useEffect, useState} from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { couldStartTrivia, setConstantValue } from "typescript";
import { useFormState } from "react-dom";
import { Root } from "postcss/lib/postcss";


const AddtoCart = () => {
    //const [hotelbooking, setHotelbooking] = useState("");
    const [hotelData, sethotelData] = useState({});
    const [worked, setWorked] = useState(false);

    const [checkIn, setCheckin] = useState("");
    const [room, setRoom] = useState({});
    const [ranOnce, setRan] = useState(false)
    const [checkOut, setCheckout] = useState("");
    const [selectedHotel, setSelectedHotel] = useState({});
   
    
    const {loading , user, setUser} = useAuth();
    const router = useRouter();
    //console.log("user:", user)
    


    useEffect(() => {
            console.log("user:", user)
              if (!user) {
                router.push("/auth/login?redirectTo=/manage-bookings/create/hotelbooking"); // Redirect to login if not logged in
              }
              
            //   if (loading) return (<p>Loading...</p>);
              // if (!user) return  <p>Redirecting to login...</p>;;
            }, [ user, loading]);
            
    useEffect(() => {

        // console.log("local storage checkin: ",localStorage.getItem("selected-hotel"))
        // console.log("local storage checkin: ",localStorage.getItem("check-in"))
        // console.log("local storage checkOut: ",localStorage.getItem("check-out"))
        if (!user || loading) {
          console.log("inside first")
          return};
        if(user && !loading && !ranOnce){
          // console.log("got here1")
          const userid = user?.id
    
          const hotel = JSON.parse(localStorage.getItem("selected-hotel") || "{}");
         
          console.log("parsed hotel: ", hotel)
          const retreived_room= JSON.parse(localStorage.getItem("Room") || "{}");
          
          const check_in = JSON.parse(localStorage.getItem("check-in") || "{}");
          
          const check_out = JSON.parse(localStorage.getItem("check-out") || "{}");
         
          const cart = JSON.parse(localStorage.getItem("cart") || "{}");
          setSelectedHotel(hotel);
          setCheckin(check_in)
          setCheckout(check_out)
          setRoom(retreived_room[0])
          
          localStorage.setItem(
            "cart",
            JSON.stringify({
              ...cart,
              userId: userid,
              hotel: {"check_in": check_in, "check_out": check_out, "hotelId": hotel.id, "roomId": retreived_room[0].id, "hotelBook": "true", "details": [hotel, retreived_room[0]]},
              
            })
          );
          setWorked(true)
          console.log(" cart:", JSON.parse(localStorage.getItem("cart")));
          setRan(true)
        }
        

    }, [user, loading]);
    //console.log("flightIds: ", flightIds)

    useEffect(() => {
        if (checkIn && checkOut && (Object.keys(selectedHotel).length >0) && (Object.keys(room).length >0)) {
          console.log("got here to remove")
          localStorage.removeItem("selected-hotel") 
          localStorage.removeItem("Room") 
          localStorage.removeItem("check-in")
          localStorage.removeItem("check-out")
          console.log(" checkin updated:", checkIn);
          console.log(" checkout updated:", checkOut);
          console.log(" HotelId updated:", selectedHotel)
          console.log(" Room updated:", room);
        }

      
    }, [selectedHotel, checkIn, checkOut, room, user, loading]);

    

      if(!worked){
        return <div className="text-red-500 mt-16">
          <p>
            Couldn't add hotel to cart. 
            </p>
          </div>;
      }
      return (
        <h1 className="mt-16">
            Hotel was successfully added to cart. View cart.
        </h1>
    )

    
  }
  export default AddtoCart;


