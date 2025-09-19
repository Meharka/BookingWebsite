import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  input = input.toLowerCase();
  console.log(input);

  try {
    const response = await fetch(
      `https://advanced-flights-system.replit.app/api/cities?`,
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
      return NextResponse.json({ error: "Failed to fetch cities" }, { status: response.status });
    }

    const data = await response.json();
    console.log("Fetched Data:", data); 


    const cities = [];
 
    data.forEach((city) => {
        const cityName = city.city ? city.city.toLowerCase() : '';
        const countryName = city.country ? city.country.toLowerCase() : '';
        console.log(cityName.includes(input));

        if (
          cityName.includes(input) ||
          countryName.includes(input)
        ) {
          cities.push(city);
        }
      });

    return NextResponse.json(cities.slice(0, 5));
  } catch (error) {
    console.error("Error during API call:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
