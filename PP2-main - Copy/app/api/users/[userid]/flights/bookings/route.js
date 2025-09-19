
import { authenticate } from "@/utils/auth";
import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { BookingStatus, FlightStatus } from "@prisma/client";


//booking a flight
export async function POST(request){

    try{
    
    // const { id, origin, destination, date, roundTrip} = await request.json();
    const { departureIDS, returnIDS, roundTrip} = await request.json();
    //console.log("reached1")

    

    // const { id, origin, destination, date, roundTrip } = getQueryParams(request.url, [
    //     "id",
    //     "origin",
    //     "destination",
    //     "date",
    //     "roundTrip",
    //   ]);
  
      // Validate required parameters (origin, destination, and date)
    //   if (!origin || !destination || !date) {
    //     return NextResponse.json(
    //       { error: "Origin, destination, and date are required parameters :(" },
    //       { status: 400 }
    //     );
    //   }
    const user = await authenticate(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }
    //console.log("reached2")
    //   const where = {};
  
    //   if (origin) where.origin = { contains: origin, mode: "insensitive" };
    //   if (destination) where.destination = { contains: destination, mode: "insensitive" };
  
    //   // Validate origin and destination
    //   if (origin && origin.trim() === "") {
    //     return NextResponse.json({ error: "Origin cannot be empty" }, { status: 400 });
    //   }
    //   if (destination && destination.trim() === "") {
    //     return NextResponse.json({ error: "Destination cannot be empty" }, { status: 400 });
    //   }
  
    //   if (origin.trim() === destination.trim()) {
    //     return NextResponse.json({ error: "Origin should not be the same as destination." }, { status: 400 });
    //   }
  
    //   if (date) {
    //     const dateArray = date.split(","); // Get dates as an array separated by commas
    //     where.OR = dateArray
    //       .map((date) => {
    //         const parsedDate = new Date(date);
    //         if (!isNaN(parsedDate.getTime())) {
    //           const formattedDate = parsedDate.toISOString().split("T")[0]; // format date (YYYY-MM-DD)
    //           return { date: formattedDate };
    //         }
    //         return null;
    //       })
    //       .filter(Boolean); // removes invalid dates
    //   }
  
    //   const params = new URLSearchParams();
    //   if (id) params.append("id", id);
    //   if (origin) params.append("origin", origin);
    //   if (destination) params.append("destination", destination);
    //   if (date) params.append("date", date);
    //console.log("reached3")

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

            if (!flight) {
                throw new Error(`Flight with ID ${flightId} not found in API response`);
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
    const booking_exists = await prisma.flightBooking.findFirst({
        where: {
            userId: user.id, 
            flights: { some: { id: { in: flightIds } } },
            status: BookingStatus.PENDING,

    },});
    if(booking_exists){ /////NEED TO UNCOMMENT THIS AFTER TESTING
        return NextResponse.json({message: "You currently have a pending booking for this flight. Please proceed to checkout and finish that booking first. "}, {Booking_info: false})
    }
    // var flights2;


    
      // Ensure all flights exist in the database

    // const roundTrip1 = {
    //     outboundFlight: [...departflights],  // Store all outbound flights
    //     returnFlight: [...returnflights]    // Store all return flights
    // };
    const roundTrip1 = roundTrip === "true"
    ? {
        outboundFlight: [...departflights],  // Store all outbound flights
        returnFlight: [...returnflights]    // Store all return flights
      }
    : {
        outboundFlight: [...departflights]  // Only store outbound flights
      };

  
    

    const booking1 = await prisma.flightBooking.create({
        data: {
            // id,
            userId: user.id, 
            flights: {
                connect: flightIds.map((flightId) => ({ id: flightId })),
              },
            status: BookingStatus.PENDING,
            roundTrip: roundTrip === "true", 
        
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





    return NextResponse.json({Booking_info: booking1, Itinerary: roundTrip1});



    
    //return NextResponse.json(`got user id: ${userId} flightId: ${flightId} `)
    
}catch(error){
        return NextResponse.json({error1: error.message}, {mes: "erroed"})
}
    
}











