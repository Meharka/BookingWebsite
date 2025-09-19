import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";




//get a specific booking
export async function GET(request) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);

     
    
     if (!bookingId || !userId || isNaN(Number(bookingId)) || isNaN(Number(userId))) {
        return NextResponse.json({ error: "Invalid bookingId or userId" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
        where: {id: Number(userId)}
    })
    //const user = await authenticate(request);
    const combined_booking1 = await prisma.booking.findFirst({
        where :{
            id: Number(bookingId),
        },
        include: {
            flightBookings: true, 
            hotelBookings: true
        }

    })
    if(!combined_booking1){
        return NextResponse.json({error: "Booking not found"}, {status: 404})
    }
    //return NextResponse.json({m: `book: ${bookingId} user: ${userId}`})
    if(combined_booking1.flightBookings.length >0){
    const booking1 = await prisma.flightBooking.findFirst({
        where: {
            id: combined_booking1.flightBookings[0].id,
            userId: Number(userId),      
        },
      });
      if (!booking1) {
        return NextResponse.json({ error: "Booking not found locally in flight Booking" }, { status: 404 });
    }
    
    // if(booking1.status === BookingStatus.PENDING){
    //     return NextResponse.json({message: "Your booking was found to be pending. "})
    // }

    const params = new URLSearchParams();
    if(booking1) params.append("bookingReference", booking1.reference);
    params.append("lastName", user.last_name);

    //console.log("reached1")
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


    }
    if(combined_booking1.hotelBookings.length>0 ){
        const booking3 = await prisma.hotelBooking.findFirst({
            where: {
                id: combined_booking1.hotelBookings[0].id,
                userId: Number(userId),
              
            },
          });
          //return NextResponse.json({m: booking3})
          if (!booking3) {
            return NextResponse.json({ error: "Booking not found for hotel" }, { status: 404 });
          }
    }

    const combined_booking2 = await prisma.booking.findFirst({
        where :{
            id: Number(bookingId),
        },
        include: {
            flightBookings: true, 
            hotelBookings: true
        }

    })
    return NextResponse.json({iternary: combined_booking2})

}