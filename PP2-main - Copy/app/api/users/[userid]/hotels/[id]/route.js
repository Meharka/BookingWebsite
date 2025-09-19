import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";



// User Story: As a visitor, I want to view detailed hotel information, including room types, amenities, and pricing.
export async function GET(request, context) {

    const params = await context.params;
    const { id } = params;
  
    try {
  
      // Fetch hotel details from the database
      const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(id) },
        include: {
          room_types: {
            where: {
              available: { gt: 0 },
            },
            select: {
              id: true,
              name: true,
              price_per_night: true,
              amenities: true,
              available: true,
              images:true
            },
          },
        },
      });
  
      if (!hotel) {
        return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
      }
  
      // Format the hotel result with room availability and amenities
      const hotelDetails = {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        star_rating: hotel.star_rating,
        rooms: hotel.room_types.map((room) => ({
          id: room.id,
          name: room.name,
          price_per_night: room.price_per_night,
          amenities: room.amenities,
          available: room.available,
          images: room.images
        })),
      };
  
      return NextResponse.json(hotelDetails, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch hotel details." , details: error.message}, { status: 500 });
    }
  }
