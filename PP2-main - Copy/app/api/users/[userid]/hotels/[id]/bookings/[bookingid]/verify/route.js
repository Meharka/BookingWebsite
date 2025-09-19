import { prisma } from '@/utils/db';
// import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function GET(request, {params}) {
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
    
    const booking = await prisma.hotelBooking.findFirst({
        where: {
            id: {equals: Number(bookingId)},
            userId: {equals: Number(userId),
            },
          
        },
      });
      const hotel = await prisma.hotel.findUnique({
        where: {
            id: {equals: Number(booking.flightId)},
            select: {
                name:true,
                address: true,
                location:true,
            }
          
        },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
    if(booking.status === BookingStatus.CANCELLED){
        return NextResponse.json({ error: "Booking was cancelled" }, { status: 400 });
    }
    if(booking.status === BookingStatus.PENDING){
        return NextResponse.json({ error: "Booking was not completed at checkout" }, { status: 400 });
    }

    return NextResponse.json({ message: "Booking is Confirmed!" }, booking, hotel, {status: 200});


}