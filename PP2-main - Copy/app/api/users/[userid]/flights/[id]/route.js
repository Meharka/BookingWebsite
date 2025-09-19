import { NextResponse } from "next/server";
import { getQueryParams } from "@/utils/getQueryParams";

// Flight Details by ID for user story: As a visitor, I want to view flight details, including departure/arrival times, duration, and layovers.
export async function GET(request, { params }) {
  const { id } = await params;  // get id

  try {

    const params = new URLSearchParams();
    params.append("id", id);

    const response = await fetch(`https://advanced-flights-system.replit.app/api/flights/${id}`, {
        method: 'GET',
        headers: {
          'x-api-key': process.env.AFS_API_KEY,
        },
      });

    const flight = await response.json();


    // Filter the flight details so users do not see private info
    const filteredFlight = {
    flightNumber: flight.flightNumber,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    origin: flight.origin,
    destination: flight.destination,
    duration: flight.duration,
    status: flight.status,
    seats: flight.availableSeats,
    airline: flight.airline,
    price: flight.price,
    currency: flight.currency,
    };

    return NextResponse.json(filteredFlight, { status: 200 });
        
  } catch (error) {
    return NextResponse.json({ error: "Failed to get flight details." }, { status: 500 });
  }
}
