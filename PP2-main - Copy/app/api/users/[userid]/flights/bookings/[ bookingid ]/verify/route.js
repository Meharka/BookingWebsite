import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function GET(request) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "id",
        "userId",
     ]);
     
    const user = await authenticate(request);
    
    if(!bookingId || !userId){
        return NextResponse.json(
            {error: "Booking not found!"},
            {status: 404},
        )
    };
    
    const booking1 = await prisma.flightBooking.findFirst({
        where: {
            id: {equals: Number(bookingId)},
            userId: {equals: Number(userId),
            },
          
        },
      });
      

    const params = new URLSearchParams();
    if(bookingId) params.append("bookingReference", bookingId);
    params.append("lastName", user.lastName);

            
    const response1 = await fetch(`https://advanced-flights-system.replit.app/api/bookings/retrieve?${params.toString()}`,{
      method: 'GET', 
      headers: {
          'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
          "Content-Type": "application/json",
      },
    });
  const booking = await response1.json();
  if(!booking){
    return NextResponse.json(
        {error: "Booking not Found"},
        {status: 404},
    )
  };
  const flight_id = booking1.flightId;

      const flight = fetch(`https://advanced-flights-system.replit.app/api/flights?${flight_id}`,{
        method: 'GET', 
        headers: {
            'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
            "Content-Type": "application/json",
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
    if(booking.status === BookingStatus.CANCELLED){
        return NextResponse.json({ error: "Booking was cancelled" }, { status: 400 });
    }
    if(booking1.status === BookingStatus.PENDING){
        return NextResponse.json({ error: "Booking was not completed at checkout" }, { status: 400 });
    }

    if(flight.status === "CANCELLED"){
        return NextResponse.json({ error: "Sorry, Your your flight is cancelled" }, { status: 400 });
    }

    return NextResponse.json({ message: "Booking is Confirmed!" },booking, flight);


}