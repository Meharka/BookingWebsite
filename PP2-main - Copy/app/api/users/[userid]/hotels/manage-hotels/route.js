import { PrismaClient } from "@prisma/client";
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
export const prisma = new PrismaClient();


      export async function GET(req, context) {

        const params = await context.params;
        const { userid } = params;
      
        console.log("User ID:", userid);
          
          if (!userid) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
          }
          
        const intId = parseInt(userid, 10);
    
        try{
        const hotels = await prisma.hotel.findMany({
          where: {
            ownerId: intId,
          },
          select: {
            id: true,
            name: true,
            logo: true,
            address: true,
            city: true,
            star_rating: true,
            images: true,
            ownerId: true,
            room_types: {
              select: {
                price_per_night: true,
              },
            },
          }
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

  
      return NextResponse.json(hotels, { status: 200 });
  
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch hotels. :(", details: error.message }, { status: 500 });
    }
  }


//User story: As a user, I want to add my hotel to the platform. A hotel has name, logo, address, location, star-rating, and several images.
export async function POST(request) {

    try {

    const user = await authenticate(request);

    // Validate data

    if (user.role !== 'USER' && user.role != 'HOTEL_OWNER'){
      return NextResponse.json({ error: 'You must log in to create a hotel.' }, { status: 400 });
    }

    const { name, logo, address, city, star_rating, images } = await request.json();


    if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Hotel name is required and must be a string.' }, { status: 400 });
    }

    if (!logo || typeof logo !== 'string') {
        return NextResponse.json({ error: 'Logo is required and must be a URL string.' }, { status: 400 });
    }
    
    if (!address || typeof address !== 'string') {
        return NextResponse.json({ error: 'Address is required and must be a string.' }, { status: 400 });
    }
    
    if (!city || typeof city !== 'string') {
        return NextResponse.json({ error: 'City is required and must be a string.' }, { status: 400 });
    }
    
    const parsed_star_rating = parseInt(star_rating);
    if (isNaN(parsed_star_rating) || parsed_star_rating < 0 || parsed_star_rating > 5) {
        return NextResponse.json({ error: 'Star-Rating is required and must be an integer between 0-5.' }, { status: 400 });
    }
    
    // Make sure images is json array 
    
    if (images) {
        if (!Array.isArray(images)) {
            return NextResponse.json({ error: "Images must be an array." }, { status: 400 });
        }
        
        if (!images.every(img => typeof img === "string")) {
            return NextResponse.json({ error: "Each image must be a URL string." }, { status: 400 });
        }
    }
    
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


