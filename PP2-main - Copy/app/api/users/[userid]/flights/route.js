import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";

// Flight Search
export async function GET(request) {
  try {

    const { id, origin, destination, date, returnDate, type } = getQueryParams(request.url, [
      "id",
      "origin",
      "destination",
      "date",
      "returnDate",
      "type",
    ]);

    // Validate required parameters (origin, destination, and date)
    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: "Origin, destination, and date are required parameters :(" },
        { status: 400 }
      );
    }

    console.log(origin);
    console.log(destination);

    const where = {};

    if (origin) where.origin = { contains: origin, mode: "insensitive" };
    if (destination) where.destination = { contains: destination, mode: "insensitive" };

    // Validate origin and destination
    if (origin && origin.trim() === "") {
      return NextResponse.json({ error: "Origin cannot be empty" }, { status: 400 });
    }
    if (destination && destination.trim() === "") {
      return NextResponse.json({ error: "Destination cannot be empty" }, { status: 400 });
    }

    if (origin.trim() === destination.trim()) {
      return NextResponse.json({ error: "Origin should not be the same as destination." }, { status: 400 });
    }

    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (origin) params.append("origin", origin);
    if (destination) params.append("destination", destination);
    if (date) params.append("date", date);

    const response = await fetch(
      `https://advanced-flights-system.replit.app/api/flights?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.AFS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const flights = await response.json();

    if (!flights || !flights.results || flights.results.length === 0){
        return NextResponse.json({ error: "Could not find any flights from " +origin + " to " + destination + "."}, { status: 404 });
    }


    if (type && type.trim() === "ROUND-TRIP") {
      // Check if returnDate is provided before making the second API call
      if (!returnDate) {
        return NextResponse.json({ error: "Return date is required for round-trip flights." }, { status: 400 });
      }
    
      const params2 = new URLSearchParams();
      if (id) params2.append("id", id);
      if (origin) params2.append("origin", destination);
      if (destination) params2.append("destination", origin);
      if (returnDate) params2.append("date", returnDate);
    
      const response2 = await fetch(
        `https://advanced-flights-system.replit.app/api/flights?${params2.toString()}`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.AFS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    
      const flights2 = await response2.json();
    
      if (!flights2 || !flights2.results || flights2.results.length === 0) {
        return NextResponse.json({
          error: `Could not find any return trip flights from ${destination} to ${origin}.`
        }, { status: 404 });
      }
    
      const roundTrip = [];
    
      // Pair outbound and return flights
      for (const f1 of flights.results) {
        for (const f2 of flights2.results) {
          roundTrip.push({
            outboundFlight: {
              ...f1,
            },
            returnFlight: {
              ...f2,
            },
          });
        }
      }
    
      return NextResponse.json(roundTrip, { status: 200 });
    }

    return NextResponse.json(flights, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get flights.", details: error.message}, { status: 500 });
  }
}
