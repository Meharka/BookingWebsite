"use client";
import React, { useEffect, useState } from "react";
// import Input from "@/components/Input";
// import Title from "@/components/Title";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";



const CheckoutBook = () => {
  const router = useRouter();

  //const searchParams = new URLSearchParams(router.query);
  const { id } = useParams();
  console.log("bookingid:", id)

  // const bookingId = searchParams?.get("bookingid") || "";
//   const userid = searchParams?.get("userid") || "";
  const {loading , user, setUser} = useAuth();
  const [submitted, setSubmitted] = useState(false)
  

  const [bookings, setBooking ] = useState({});
  const [cardNum, setCard] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [passportNum, setPassport] = useState("")
  const [error, setError] = useState(null);
//   const [hotelBooking, setHotelBooking] = useState([]);
    var isSub = false
  

  useEffect(() => {
          if (!loading && !user) {
            router.push(`/auth/login?redirectTo=manage-bookings/${id}/checkout`); // Redirect to login if not logged in
          }
        //   if (loading) return <p>Loading...</p>;
        //   if (!user) return  <p>Redirecting to login...</p>;
        }, [ user, loading]);
    
    useEffect(() => {
    if (!loading && id && user) {
      console.log("userid", user.id);
    //   return;
    }}, [ user, loading]);
    


  const checkbooking = async () => {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:3000/api/users/${user.id}/bookings/${id}/checkout`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token}`
          },
            body: JSON.stringify(
                {
                    "cardNum": cardNum,
                    "cardExpiry": cardExpiry,
                    "passportNumber": passportNum,
                }
            ),
          });  
    
    const data = await response.json();
    // console.log("I was logged and now below is data returned from api response ;;;;;;;;;-------------")
    // console.log("API response:", data);
    
    console.log("API response:", data);
  
      setBooking(data);
    
    
  };
  

  useEffect(() => {
    if (!loading && id && user && cardExpiry && cardNum  && passportNum) {
        
      console.log("All arguments", [id, user, cardExpiry, cardNum, passportNum]);
    //   return;
    }}, [bookings, user, loading, cardExpiry, cardNum, passportNum]);

    useEffect(() => {
        if (!id ) {
          setError("Invalid booking request.");
          return;
        }
        if(id && user && cardExpiry && cardNum  && passportNum){
            checkbooking();
        }
      }, [id, user, cardExpiry, cardNum, passportNum]);

      useEffect(() => {
        if (!loading && id && user && cardExpiry && cardNum && Object.keys(bookings).length>0 && passportNum) {
            
          console.log("Bookings", bookings);
        //   return;
        }}, [bookings, user, loading, cardExpiry, cardNum, passportNum]);

    const handleSubmit = (e) => {
     e.preventDefault();
    //  isSub=true;


    if (!id ) { //id represents booking id
      alert("There is no bookingid ");
      return;
    }
    if(Object.keys(bookings).length>0){
    localStorage.setItem("finalizedBooking", JSON.stringify(bookings))

    router.push(`/manage-bookings/${bookings.booking.id}/checkout/final`)
    }else{
        alert("Couldn't make your booking sorry. Please restart")
    }
  };
  



return (
    <div className="min-h-screen w-full py-6 px-4 sm:px-6 lg:px-8 mt-16 ">
      <h1>Checkout </h1>
      <table className=" min-w-full   ">
        <thead>
          <tr key={bookings.id}>
            <th>Card Information</th>
          </tr>
        </thead>
        <tbody>
            <tr>
                <td>
            <input className="border p-5" placeholder="Credit card number" value={cardNum} onChange={(e) => setCard(e.target.value)}/>
            </td>
            <td>
              <input className="border p-5" placeholder="Credit card Expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}/>
              </td>
              <td>
              <input className="border p-5" placeholder="Passport Number" value={passportNum} onChange={(e) => setPassport(e.target.value)}/>
              </td>
              </tr>
              <tr></tr>
              <tr>
                <td>
              <button  className="border p-5 flex-center" onClick={(e) => handleSubmit(e)}>Submit
                
              </button>
              </td>
              </tr>
              
        </tbody>
      </table>
      
    </div>
  );
};

export default CheckoutBook;