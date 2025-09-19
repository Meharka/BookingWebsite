import { authenticate } from "@/utils/auth";
import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { BookingStatus, FlightStatus } from "@prisma/client";


//booking a flight and/or a hotel 
export async function POST(request){

    try{
    // checking if the user wants a flight booking. 
    const user = await authenticate(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }
    // console.log({mesae: `your role ${user.role}`});
    
    if (user.role !== "USER" && hotelBook==="true"){
      return NextResponse.json({ error: 'You are not authorized to book a hotel or flight. You maybe signed in as a hotel owner.' }, { status: 400 });
    }
    const { flightBook, departureIDS, returnIDS, roundTrip, hotelBook, check_in, hotelId, check_out, roomId, userId} = await request.json();


    var booking1;
    var booking2;
    var roundTrip1;

    var combined_booking;
    combined_booking = await prisma.booking.create({
        data: {},
    })

    //return NextResponse.json({m: combined_booking.id})
    

    if(flightBook==="true"){

    
    
    

    const flightIds = [...departureIDS, ...returnIDS];
    

    //check if flight id is an array
    if (
        !Array.isArray(flightIds) ||
        !flightIds.length ||
        flightIds.findIndex((id) => typeof id !== "string" || !id.length) !== -1
      ) {
        return NextResponse.json(
          {
            error: "Missing or invalid flight IDs",
          },
          { status: 400 },
        );
    }


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
        flights_test.push(flight1);
        
        //return NextResponse.json({flights_tested: typeof(Date(flight1.departureTime))})
        

    }
    //return NextResponse.json({flights_tested: flights_test})
    

    //create all flights in the database first. 
    const flightRecords = await Promise.all(
        flightIds.map(async (flightId) => {
            const flight = flights_test.find(f => f.id === flightId);
            //console.log(`we got ${flightId} time`)

            if (!flight) {
                return NextResponse.json({message: `Flight with ID ${flightId} not found in API response`});
            }
            //console.log(`Flight ${flightId} - createdAt: ${flight.createdAt}, updatedAt: ${flight.updatedAt}`);
            return prisma.flight.upsert({
                where: { id: flightId },
                update: {}, // Do nothing if it already exists
                
                create: { 
                    id: flightId,
                    flightNumber: flight.flightNumber,
                    departureTime: new Date(flight.departureTime),
                    arrivalTime: new Date(flight.arrivalTime),
                    duration: flight.duration,
                    price: flight.price,
                    currency: flight.currency,
                    availableSeats: flight.availableSeats,
                    status: flight.status,
                    createdAt: flight.createdAt,  // Convert date properly
                    updatedAt: flight.updatedAt,
                    type: "One-way",
                    originId: flight.originId,
                    destinationId: flight.destinationId,

                },
            });
        })
    );

    

      const flights = await prisma.flight.findMany({
        where: { id: { in: flightIds } },
        orderBy: { departureTime: "asc" }, // Ensure flights are in order by departure time
        include: {
            origin: true,
            destination: true
        }
      });

      const departflights = await prisma.flight.findMany({
        where: { id: { in: departureIDS } },
        orderBy: { departureTime: "asc" }, // Ensure flights are in order by departure time
        include: {
            origin: true,
            destination: true
        }
      });

      const returnflights = await prisma.flight.findMany({
        where: { id: { in: returnIDS } },
        orderBy: { departureTime: "asc" }, // Ensure flights are in order by departure time
        include: {
            origin: true,
            destination: true
        }
      });



  
      if (flights.length === 0){
          return NextResponse.json({ error: "Could not find any flights in prisma"}, { status: 404 });
      }
      //return NextResponse.json({m: flights});
      for(var j = 0; j<flights.length; j++){
        //return NextResponse.json({m: flights[j].status}); 
        if(flights[j].status !== "SCHEDULED"|| Number(flights[j].availableSeats) < 1){
            return NextResponse.json(
                {error: "No available seats on departure trip or not scheduled"}, 
                {status:400},
            );
    }}

    //var flightIds=[]
    // for(const val of flights.results.flights){
    //     flightIds.push(val.id)
    // }
    //flightBooking
    const booking_exists = await prisma.flightBooking.findFirst({
        where: {
            userId: user.id, 
            bookingId: combined_booking.id,
            flights: { some: { id: { in: flightIds } } },
            status: BookingStatus.PENDING,

    },});
    if(booking_exists){ /////NEED TO UNCOMMENT THIS AFTER TESTING
        return NextResponse.json({message: "You currently have a pending booking for this flight. Please proceed to checkout and finish that booking first. "})
    }
    // var flights2;

    //return NextResponse.json({booking_exists})
    
      // Ensure all flights exist in the database

    // const roundTrip1 = {
    //     outboundFlight: [...departflights],  // Store all outbound flights
    //     returnFlight: [...returnflights]    // Store all return flights
    // };
    roundTrip1 = roundTrip === "true"
    ? {
        outboundFlight: [...departflights],  // Store all outbound flights
        returnFlight: [...returnflights]    // Store all return flights
      }
    : {
        outboundFlight: [...departflights]  // Only store outbound flights
      };

  
    

    booking1 = await prisma.flightBooking.create({
        data: {
            // id,
            userId: user.id, 
            flights: {
                connect: flightIds.map((flightId) => ({ id: flightId })),
              },
            status: BookingStatus.PENDING,
            roundTrip: roundTrip === "true", 
            bookingId: combined_booking.id
        
        },
        // include: {
        //     flights: true,  // To confirm the flights were linked
        // },

    });

    if(!booking1){
            return NextResponse.json(
                {error: "Booking couldn't be created"},
                {status: 404},
            )
    };
    var fullBookId= combined_booking.id;
    combined_booking = await prisma.booking.update({
        where:{
            id: fullBookId
        },
        data:{
            flightBookings: {connect: { id: booking1.id }}

        },
        include: {
            flightBookings: true,
            hotelBookings: true
        }
    })
    





    //return NextResponse.json({Booking_info: booking1, Itinerary: roundTrip1});
    }
    //checking if user wants a hotel booking as well. 
    if(hotelBook==="true"){

        //const { check_in, hotelId, check_out, roomId, userId} = await request.json();

    

    if(!check_in || !hotelId || !check_out || !roomId || !userId){
        return NextResponse.json(
            {error:"All fields must be filled!"},
            {status: 400},
            )

    }
    console.log("reached1")
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
    //return NextResponse.json({m: room1})
    if(!room1){
        return NextResponse.json({error: "Room not found"})
    }
    if(room1.available< 1){
        return NextResponse.json(
            {error: "Room is not available"}, 
            {status:400},
        );
      }
      console.log("reached2")
   
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
    //   const room_changes = await prisma.hotel.update({
    //     where: {
    //         id : hotel1.id
    //     },
    //     data: {

    //     }
    //   })

    //console.log("reached3")
      
    
    booking2 = await prisma.hotelBooking.create({
        data: {
            hotelId,
            check_in: parsed_check_in,
            check_out: parsed_check_out,
            roomId, 
            userId,   
            status: BookingStatus.PENDING,
            bookingId: combined_booking.id

        },

    });

    if(!booking2){
        return NextResponse.json({message: "Hotel Booking not found"}, {status:404})
    }
    //return NextResponse.json(booking2);
    var totalId= combined_booking.id
    combined_booking = await prisma.booking.update({
        where:{
            id: totalId
        },
        data:{
            hotelBookings: {connect: { id: booking2.id }}
        },
        include: {
            flightBookings: true,
            hotelBookings: true
        }
    })
  
    }
    



    if(!(flightBook === "true") && !(hotelBook==="true")){
        return NextResponse.json({error: "Couldn't make booking"});
    }
   
    return NextResponse.json({Itinerary: combined_booking})

    //return NextResponse.json(`got user id: ${userId} flightId: ${flightId} `)
    
}catch(error){
        return NextResponse.json({error1: error.message})
}
    
}











