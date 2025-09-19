import { PrismaClient } from "@prisma/client";
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { NEXT_BODY_SUFFIX } from "next/dist/lib/constants";
export const prisma = new PrismaClient();


export async function GET(request) {
    try {
    const { params } = new URL(request.url);
    // const city = params.get("destination");
    // const date1 = params.get("date");
    const { city, date1 } = getQueryParams(request.url, [
      "city",
      "date1",
   ]);

   //return NextResponse.json({info: `city: ${city} date: ${date1}`})
   const user = await authenticate(request);
   if(!user){return NextResponse.json({error: "Unathorized"}, {status:400})};

    // Validate required parameters (origin, destination, and date)
    if ( !city || !date1) {
      return NextResponse.json(
        { error: "City, and date are required parameters :(" },
        { status: 400 }
      );
    }

   // if (city) where.city = { contains: city, mode: "insensitive" };

    // Validate origin and destination
    if (city && city.trim() === "") {
      return NextResponse.json({ error: "City cannot be empty" }, { status: 400 });
    }
    
    // parse check in and check out dates 
    const parsed_check_in = new Date(date1);
    //return NextResponse.json({message: parsed_check_in.getFullYear()})
    const parsed_check_out = new Date(parsed_check_in.getFullYear(), parsed_check_in.getMonth(), parsed_check_in.getDate()+10);
    
    // validate dates are correct format
    if (isNaN(parsed_check_in.getTime())) {
        return NextResponse.json({ error: "Invalid check-in date." }, { status: 400 });
      }

    // validate check in and check out dates
    
    const parsed_min_price =  0; // dewfault min = 0
    const parsed_max_price =  1000000000000; // default max = infinity


    // Filter hotels by name and star rating
    
    
      const hotels = await prisma.hotel.findMany({
        where: {
          city: city ? { contains: city }: undefined,
        },
        include: {
          room_types: {
            where: {
              available: {gt: 0},
              NOT: {
                bookings: {
                  some: {
                    check_in: { lt: parsed_check_out }, // check in date is <= check out date
                    check_out: { gt: parsed_check_in } // check out date is >= check in date
                  }
                }
              },
              price_per_night: {
                gte: parsed_min_price, // room price per night >= min_price
                lte: parsed_max_price  // room price per night <= max_price
              }
            },
            select: {
              id: true,
              name: true,
              price_per_night: true,
              amenities: true,
              available: true,
            }
          }
        }
      });
  
      // Format the result
      const hotelResults = hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.location,
        star_rating: hotel.star_rating,
        room_types: hotel.room_types
      }));


      // Get only available rooms
      const filteredhotelResults = hotelResults.filter(hotel => hotel.room_types.length > 0);
      //.map(hotel => ({
     // ...hotel,
      //room_types: hotel.room_types.filter(room => room.available > 0),
      //}))
     //.filter(hotel => hotel.room_types.length > 0);


      if (filteredhotelResults.length === 0) {
        return NextResponse.json({ message: "No available hotel rooms found for city or date." }, { status: 404 });
      }
  
      return NextResponse.json(filteredhotelResults, { status: 200 });
  
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch hotels. :(", details: error.message }, { status: 500 });
    }
  }

  




