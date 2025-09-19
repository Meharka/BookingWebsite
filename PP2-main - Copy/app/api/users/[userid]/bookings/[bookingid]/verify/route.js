import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function GET(request, ) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);
     
    const user = await authenticate(request);
    
    if(!bookingId || !userId){
        return NextResponse.json(
            {error: "Booking not found!"},
            {status: 404},
        )
    };
    
    const combined_booking = await prisma.booking.findFirst({
        where: {
            id:  Number(bookingId),
          
        },
        include: {
            flightBookings: true, 
            hotelBookings: true, 
        }
    })
    if (!combined_booking){
        return NextResponse.json({error: "Combined booking not found"}, {status: 404})
    }
    //return NextResponse.json({m: combined_booking})
    const booking1 = await prisma.flightBooking.findFirst({
        where: {
            id: combined_booking.flightBookings[0].id,
            userId:  Number(userId),
          
        },
        include: 
        {
            flights: true
        }
      });

    const booking2 = await prisma.hotelBooking.findFirst({
        where: {
            id: combined_booking.hotelBookings[0].id,
            userId:  Number(userId),
          
        },
        include: {
            hotel: true
        }
      });
      

    const params = new URLSearchParams();
    if(booking1) params.append("bookingReference", booking1.reference);
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
    var flightIds= [];
    for(let j =0; j< booking1.flights.length; j++){
        flightIds.push(booking1.flights[j].id);
    }

    //return NextResponse.json({m: flightIds})
    var flights_test = [];
    var flight1;
    for(let id1=0; id1<flightIds.length; id1++){
        const response = await fetch(
            `https://advanced-flights-system.replit.app/api/flights/${flightIds[id1]}`,
            {
            method: "GET",
            headers: {
                "x-api-key": process.env.AFS_API_KEY,
                "Content-Type": "application/json",
            },
            }
        );
        flight1 = await response.json();
        // if(flight1.status )
        flights_test.push(flight1);
    }
        
    if(booking.status === BookingStatus.CANCELLED){
        return NextResponse.json({ error: "Booking was cancelled" }, { status: 200 });
    }
    for(let i = 0; i< flights_test.length; i++){
        
        if(flights_test[i].status === "CANCELLED" ){
            const changed = await prisma.flightBooking.update({
                where : {id : booking1.id}, 
                data: {status: BookingStatus.CANCELLED}
            })
            return NextResponse.json({ error: `Sorry, Your flight is cancelled. Find details below${flights_test[i]} `}, { status: 200 });
            }
    
        if(flights_test[i].status === "DELAYED" ){
            const changed = await prisma.flightBooking.update({
                where : {id : booking1.id}, 
                data: {status: "DELAYED"}
            })
            return NextResponse.json({ error: `Your flight is delayed. Find details below: ${flights_test[i]} `}, { status: 200});
            }
    }
    if (booking2.status === "CANCELLED"){
        return NextResponse.json({ error: `Sorry, Your hotel booking is cancelled. Find details below ${booking2} `}, { status: 400 });
    }
    

    if(booking1.status === BookingStatus.PENDING){
        return NextResponse.json({ error: "Booking was not completed at checkout" }, { status: 400 });
    }

    

    return NextResponse.json({ message: "Booking is Confirmed!" },combined_booking);


}