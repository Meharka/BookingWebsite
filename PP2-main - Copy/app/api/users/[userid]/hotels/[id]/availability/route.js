import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";

export async function GET(request, { params }) {
    try {
        // Get the hotelId from URL params and date range from query parameters
        //const { userId, hotelId } = params;
        const { startDate, endDate, hotelId, userId} = getQueryParams(request.url, ["startDate", "endDate", "hotelId", "userId"]);
        
        // Authenticate user
        const user = await authenticate(request);
        
        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Start date and end date are required." }, { status: 400 });
        }
        
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
        }

        // Get all room types for the hotel
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(hotelId) },
            include: {
                room_types: true, // Include room types directly
                bookings: {
                    where: {
                        check_in: { lte: parsedEndDate },
                        check_out: { gte: parsedStartDate },
                    },
                },
            },
        });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
        }


        const availability = hotel.room_types.map((roomType) => {
            // Filter bookings for the specific room type within the requested date range
            const bookingsForRoomType = hotel.bookings.filter(
                (booking) =>
                    booking.roomId === roomType.id && // Filter bookings by roomId
                    (new Date(booking.check_in) <= parsedEndDate) &&
                    (new Date(booking.check_out) >= parsedStartDate)
            );
            
            // Calculate available rooms: Total rooms - booked rooms
            let availableRooms = roomType.available - bookingsForRoomType.length;

            if (availableRooms <= 0){
                availableRooms = 0;
            }

            return {
                roomTypeId: roomType.id,
                roomTypeName: roomType.name,
                availableRooms: availableRooms,
                totalRooms: roomType.available,
            };
        });

        return NextResponse.json(availability, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch room availability.", details: error.message },
            { status: 500 }
        );
    }
}