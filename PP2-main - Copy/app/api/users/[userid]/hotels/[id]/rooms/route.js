import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import { prisma } from '@/utils/db';

// User Story: As a visitor, I want to view the availability and details of different room types for my selected dates in a selected hotel.

export async function GET(request, context) {

  try {

    const params = await context.params;
    const { id } = params;
    const { check_in, check_out } = getQueryParams(request.url, [
        "check_in",
        "check_out",
    ])

    if (!check_in || !check_out) {
        return NextResponse.json({ error: "Both check-in and check-out dates are required." }, { status: 400 });
    }
  

    const parsed_check_in = new Date(check_in);
    const parsed_check_out = new Date(check_out);

    if (check_in && isNaN(parsed_check_in.getTime()) || check_out && isNaN(parsed_check_out.getTime())) {
      return NextResponse.json({ error: "Invalid check-in or check-out date." }, { status: 400 });
    }

    if (check_in && check_out && parsed_check_in >= parsed_check_out) {
      return NextResponse.json({ error: "Check-out date must be after check-in date." }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
      include: {
        room_types: {
          select: {
            id: true,
            name: true,
            price_per_night: true,
            amenities: true,
            available: true, // Room availability
            images: true
          },
          where: {
            available: {gt: 0}, // Only get rooms that are available
            NOT: {
              bookings: {
                some: {
                  check_in: { lt: parsed_check_out },
                  check_out: { gt: parsed_check_in },
                },
              },
            },
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
    }

    // Check if no rooms are available for the selected dates
    if (hotel.room_types.length === 0) {
      return NextResponse.json({ message: "No rooms available for the selected dates." }, { status: 404 });
    }

    // Format the room data response
    const roomDetails = hotel.room_types.map((room) => ({
      id: room.id,
      name: room.name,
      price_per_night: room.price_per_night,
      amenities: room.amenities,
      available: room.available, // Room availability for the given dates
      images: room.images
    }));

    return NextResponse.json(roomDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch room details.", details: error.message }, { status: 500 });
  }
}

// User story: As a hotel owner, I want to define room types, with each type having a name (e.g., twin, double, etc.), amenities, prices per night, and several images.
export async function POST(request) {

    // Authenticate user


    try{

    console.log("1");
    const user = await authenticate(request);
    
    const { hotelId, name, price_per_night, amenities, images} = await request.json();
    const available = 1;
    const parsedHotelid = parseInt(hotelId);

    console.log(images);

    // fetch hotel
    const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId) }
    });


    if (!hotel) {
        return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
    }

    // Check if the user is the owner of the hotel
    if (hotel.ownerId !== user.id) {
        
        return NextResponse.json({ error: "You are not the owner of this hotel." }, { status: 403 });
    }
    
    // Validate data

    if (!parsedHotelid || typeof parsedHotelid !== 'number') {
        return NextResponse.json({ error: 'Hotel ID is required and must be a number.' }, { status: 400 });
      }

    if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Room name is required and must be a string.' }, { status: 400 });
    }

    if (!amenities || typeof amenities !== 'string') {
        return NextResponse.json({ error: 'Amenities are required and must be a string.' }, { status: 400 });
    }

    if (available && (typeof available !== 'number' || available < 0)) {
      return NextResponse.json({ error: 'The number of rooms available must be an integer great that or equal to 0.' }, { status: 400 });
    }

    const parsed_price = parseFloat(price_per_night);
    if (isNaN(parsed_price) || parsed_price < 0) {
        return NextResponse.json({ error: 'Price per night is required and must be a float greater than or equal to $0.00' }, { status: 400 });
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


    const room = await prisma.room.create({
        data: {
          name: name,
          price_per_night: parsed_price,
          amenities: amenities,
          images: images, // Use empty array if no images provided
          hotelId: parsedHotelid,
          available: available ?? 1
        },
      });
  

      return NextResponse.json(room, { status: 200 });
    }catch (error) {
        return NextResponse.json({ error: "Failed to fetch room details.", details: error.message}, { status: 500 });
      }
}

