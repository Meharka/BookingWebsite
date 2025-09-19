import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  input = input.toLowerCase();

  try {
    const response = await fetch(
      `https://advanced-flights-system.replit.app/api/airports?`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.AFS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response); 
    if (!response.ok) {
      console.error("Error fetching airports:", response.statusText);
      return NextResponse.json({ error: "Failed to fetch airports" }, { status: response.status });
    }

    const data = await response.json();
    console.log("Fetched Data:", data); 


    const airports = [];
 
    data.forEach((airport) => {
        const airportName = airport.name ? airport.name.toLowerCase() : '';
        const airportCode = airport.code ? airport.code.toLowerCase() : '';
        const airportCountry = airport.country ? airport.country.toLowerCase() : '';
        const airportCity = airport.city ? airport.city.toLowerCase() : '';
  
        if (
          airportName.includes(input) ||
          airportCode.includes(input) ||
          airportCountry.includes(input) ||
          airportCity.includes(input)
        ) {
          airports.push(airport);
        }
      });

    return NextResponse.json(airports.slice(0, 5));
  } catch (error) {
    console.error("Error during API call:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
