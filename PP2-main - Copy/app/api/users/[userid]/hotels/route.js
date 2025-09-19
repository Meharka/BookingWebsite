import { PrismaClient } from "@prisma/client";
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
export const prisma = new PrismaClient();

// User story: As a visitor, I want to search for hotels by check-in date, check-out date, and city.
//  I also want to filter them by name, star-rating, and price range. Search results should display 
// in a list that shows the hotel information, starting price, and a location pinpoint on a map. 
// The results should only reflect available rooms.
export async function GET(request) {
    try {
        const {
          city,
          check_in,
          check_out,
          name,
          star_rating,
          min_price,
          max_price
        } = getQueryParams(request.url, [
          "city",
          "check_in",
          "check_out",
          "name",
          "star_rating",
          "min_price",
          "max_price"
        ]);
    
    // parse check in and check out dates 
    const parsed_check_in = new Date(check_in);
    const parsed_check_out = new Date(check_out);


    // validate dates are correct format
    if (isNaN(parsed_check_in.getTime()) || isNaN(parsed_check_out.getTime())) {
        return NextResponse.json({ error: "Invalid check-in or check-out date." }, { status: 400 });
      }

    // validate check in and check out dates
    if (parsed_check_in >= parsed_check_out) {
        return NextResponse.json({ error: "Check-out date must be after check-in date." }, { status: 400 });
      }
    
    const parsed_min_price = min_price ? parseInt(min_price) : 0; // dewfault min = 0
    const parsed_max_price = max_price ? parseInt(max_price) : 1000000000000; // default max = infinity


    if (isNaN(parsed_min_price) || isNaN(parsed_max_price) || parsed_min_price > parsed_max_price) {
      return NextResponse.json({ error: "Invalid price range." }, { status: 400 });
    }

    // Filter hotels by name and star rating
    
    const hotels = await prisma.hotel.findMany({
      where: {
        name: name ? { contains: name } : undefined,
        star_rating: star_rating ? { gte: parseInt(star_rating) } : undefined,
        city: city ? { contains: city } : undefined,
      },
      include: {
        room_types: {
          where: {
            available: { gt: 0 },
            NOT: {
              bookings: {
                some: {
                  check_in: { lt: parsed_check_out },
                  check_out: { gt: parsed_check_in },
                },
              },
            },
            price_per_night: {
              gte: parsed_min_price,
              lte: parsed_max_price,
            },
          },
          select: {
            id: true,
            name: true,
            price_per_night: true,
            amenities: true,
            available: true,
          },
        },
      },
    });
  
      // Format the result
      const hotelResults = hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        logo: hotel.logo,
        images: hotel.images,
        city: hotel.city,
        star_rating: hotel.star_rating,
        address: hotel.address,
        room_types: hotel.room_types
      }));


      // Get only available rooms
      const filteredhotelResults = hotelResults.filter(hotel => hotel.room_types.length > 0);

      if (filteredhotelResults.length === 0) {
        return NextResponse.json({ message: "No available hotel rooms found for the selected dates and price range." }, { status: 404 });
      }
  
      return NextResponse.json(filteredhotelResults, { status: 200 });
  
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch hotels. :(", details: error.message }, { status: 500 });
    }
  }


  export async function POST(request) {

    try {

    console.log("1");
    //CHANGE
    const user = await authenticate(request);

    console.log("2");
    // Validate data

    if (user.role !== 'USER' && user.role != 'HOTEL_OWNER'){
      return NextResponse.json({ error: 'You must log in to create a hotel.' }, { status: 400 });
    }

    console.log("3");

    const { name, logo, address, city, star_rating, images } = await request.json();
    const cityString = city.toString();
    console.log(city, name, logo, address, star_rating, images);
    console.log(cityString);

    console.log("1");

    if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Hotel name is required and must be a string.' }, { status: 400 });
    }

    console.log("2");

    // if (!logo || typeof logo !== 'string') {
    //     return NextResponse.json({ error: 'Logo is required and must be a URL string.' }, { status: 400 });
    // }

    console.log("3");
    
    if (!address || typeof address !== 'string') {
        return NextResponse.json({ error: 'Address is required and must be a string.' }, { status: 400 });
    }

    console.log("4");
    
    if (!cityString || typeof cityString !== 'string') {
        return NextResponse.json({ error: 'City is required and must be a string.' }, { status: 400 });
    }

    console.log("5");
    
    const parsed_star_rating = parseInt(star_rating);
    if (isNaN(parsed_star_rating) || parsed_star_rating < 0 || parsed_star_rating > 5) {
        return NextResponse.json({ error: 'Star-Rating is required and must be an integer between 0-5.' }, { status: 400 });
    }

    console.log("6");
    
    // Make sure images is json array 
    
    // if (images) {
    //     if (!Array.isArray(images)) {
    //         return NextResponse.json({ error: "Images must be an array." }, { status: 400 });
    //     }
        
    //     if (!images.every(img => typeof img === "string")) {
    //         return NextResponse.json({ error: "Each image must be a URL string." }, { status: 400 });
    //     }
    // }

    console.log("7");
    
    // Create hotel

    const hotel = await prisma.hotel.create({
        data: {
          name: name,
          logo: logo,
          address: address,
          city: city,
          star_rating: parsed_star_rating,
          images: images ?? [], // Empty array if no images
          ownerId: user.id,
        }
      });

    // update user role


     if (user.role !== 'HOTEL_OWNER') {
        user.role = 'HOTEL_OWNER'; 

         await prisma.user.update({
           where: { id: user.id },
           data: { role: 'HOTEL_OWNER' }
         });
       }

    
    return NextResponse.json(hotel, { status: 200});
    }
    catch (error) {
        return NextResponse.json({ error: "Failed to create hotel :(", details: error.message }, { status: 500 });
      }
}



