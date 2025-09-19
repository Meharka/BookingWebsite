import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";



export async function GET(request) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);

     
    
     if (!bookingId || !userId || isNaN(Number(bookingId)) || isNaN(Number(userId))) {
        return NextResponse.json({ error: "Invalid bookingId or userId" }, { status: 400 });
    }
    //return NextResponse.json({m: `book: ${bookingId} user: ${userId}`})
    const user = await authenticate(request);
    const booking1 = await prisma.flightBooking.findFirst({
        where: {
            id: Number(bookingId),
            userId: Number(userId),
          
        },
      });

      if (!booking1) {
        return NextResponse.json({ error: "Booking not found locally" }, { status: 404 });
    }
    const params = new URLSearchParams();
    if(booking1) params.append("bookingReference", booking1.reference);
    params.append("lastName", user.last_name);

            
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
            {error: "Booking not Found afs"},
            {status: 404},
        )
    };

    
    
    return NextResponse.json({m: booking})
    return NextResponse.json(booking);


}