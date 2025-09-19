import { prisma } from '@/utils/db';
 import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";
import { authenticate } from "@/utils/auth";

export async function POST(request){

  try{
    const { check_in, hotelId, check_out, roomId, userId} = await request.json();

    const user = await authenticate(request);
    // console.log({mesae: `your role ${user.role}`});
    
    if (user.role !== "USER" && user.role != "HOTEL_OWNER"){
      return NextResponse.json({ error: 'You must log in to book a hotel.' }, { status: 400 });
    }

    if(!check_in || !hotelId || !check_out || !roomId || !userId){
        return NextResponse.json(
            {error:"All fields must be filled!"},
            {status: 400},
            )

    }

    const parsed_check_in = new Date(check_in);
    const parsed_check_out = new Date(check_out);

    const hotel1 = await prisma.hotel.findUnique({
         where:{id : hotelId},    
    })

    if(!hotel1){
        return NextResponse.json(
            {error: "Hotel not found"},
            {status: 404},
        )
    }
    const room1 = await prisma.room.findUnique({
        where:{id : roomId},    
    })

   
    const room_bookings = await prisma.hotelBooking.findMany({
      where: {
          hotelId: hotelId, // Correct way to specify hotelId
          roomId: roomId,   // Correct way to specify roomId
          OR: [
              { check_in: { lt: parsed_check_out } }, // check_in should be less than the end date
              { check_out: { gt: parsed_check_in } } // check_out should be greater than the start date
          ]
      }
    });
      
      // Calculate available rooms: Total rooms - booked rooms
      const availableRooms = room1.available - room_bookings.length;

      if(availableRooms < 1){
        return NextResponse.json(
            {error: "Room is not available"}, 
            {status:400},
        );
      }
    
    const booking1 = await prisma.hotelBooking.create({
        data: {
            hotelId,
            check_in: parsed_check_in,
            check_out: parsed_check_out,
            roomId, 
            userId, 
            status: BookingStatus.PENDING,

        },

    });
    return NextResponse.json(booking1);
  }
  catch (error) {
    return NextResponse.json(
      { error: "Failed to create new booking.", details: error.message },
      { status: 500 }
    );
  } 
}

// User Story: As a hotel owner, I want to view and filter my hotel’s booking list by date and/or room type.


export async function GET(request) {
  try {

    console.log("1");
    const url = new URL(request.url);
    console.log(url);
    const hotelId = url.searchParams.get("hotelId");
    const date = url.searchParams.get("date");
    const room_type = url.searchParams.get("room_type");

    console.log(hotelId, date, room_type);
    console.log(date)
    if (!hotelId) {
      return NextResponse.json({ error: "hotelId is required." }, { status: 400 });
    }

    console.log("2");
    const user = await authenticate(request);
    console.log("3");
    const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId)}
    });
        
    if (!hotel) {
        return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
    }

    console.log("4");
        
    // Check if the user is the owner of the hotel
    if (hotel.ownerId !== user.id) {
        return NextResponse.json({ error: "You are not the owner of this hotel." }, { status: 403 });
    }

    console.log("5");
    // let parsed_date = null;
    // if (date) {
    //   parsed_date = new Date(date);
    //   if (isNaN(parsed_date.getTime())) {
    //     return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
    //   }
    // }
    

    const bookingFilter = {
       hotelId: parseInt(hotelId),
    //   ...(room_type ? {
    //     room: {
    //       name: { contains: room_type}, // Filter by room type name
    //     }
    //   } : {}),
    //   ...(parsed_date ? {
    //     check_in: { lte: parsed_date },
    //     check_out: { gte: parsed_date },
    //   } : {}),
    };

    // Fetch bookings for the given hotel with matching room type and dates
    const bookings = await prisma.hotelBooking.findMany({
      where: bookingFilter,
      include: {
        room: {
          select: {
            name: true, // Include room name
          }
        },
        user: {
          select: {
            id: true, // Include user ID
            first_name: true,
            last_name: true,
            email: true
          }
        },
      },
    });

    console.log("6");
    // If no bookings are found
    if (bookings.length === 0) {
      return NextResponse.json(
        { message: "No bookings found for the given date or room_type." },
        { status: 404 }
      );
    }

    console.log(bookings);

    // Format the response
    const bookingResults = bookings.map((booking) => ({
      id: booking.id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      status: booking.status,
      user: {
        user_id: booking.user.id,
        first_name: booking.user.first_name,
        last_name: booking.user.last_name,
        email: booking.user.email,
      },
      room_name: booking.room.name,
    }));

    return NextResponse.json(bookingResults, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings.", details: error.message },
      { status: 500 }
    );
  }
}
