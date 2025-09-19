import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { prisma } from '@/utils/db';
import { authenticate } from "@/utils/auth";

// Flight Search
export async function GET(request) {
  try {
    const { id, destination, date } = getQueryParams(request.url, [
      "destination",
      "id",
      "date",
    ]);

    // Validate required parameters (origin, destination, and date)
    if (!destination || !date) {
      return NextResponse.json(
        { error: "Destination, and date are required parameters :(" },
        { status: 400 }
      );
    }

    //return NextResponse.json({m: `${destination} and ${date}`})
    let origin = ""
    if(destination === "Toronto"){
        origin = "FRA"
    }else {
        origin = "Toronto"
    }
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

    if (date) {
      const dateArray = date.split(","); // Get dates as an array separated by commas
      where.OR = dateArray
        .map((date) => {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            const formattedDate = parsedDate.toISOString().split("T")[0]; // format date (YYYY-MM-DD)
            return { date: formattedDate };
          }
          return null;
        })
        .filter(Boolean); // removes invalid dates
    }
    //return NextResponse.json({m: `${destination} and ${origin}`})

    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (origin) params.append("origin", origin);
    if (destination) params.append("destination", destination);
    if (date) params.append("date", date);

    //return NextResponse.json({m: `${params.origin}`})
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
    //return NextResponse.json({m: `${flights.results} flights`})

    if (flights.results.length === 0){
        return NextResponse.json({ error: "Could not find any flights"}, { status: 404 });
    }
    //return NextResponse.json({m: `${flights} and ${date}`})

    return NextResponse.json(flights, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to get flights." }, { status: 500 });
  }
}





