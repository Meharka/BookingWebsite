import { prisma } from '@/utils/db';
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";

// User story: As a hotel owner, I want to update the number of available rooms of each type in my hotel.
// If availability decreases, it may require canceling some existing reservations.

export async function PUT(request, context) {
    try {
        console.log("1");
        const user = await authenticate(request);
        const { id, roomid } = await context.params; 
        console.log(id, roomid);

        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        if (!id || !roomid) {
            return NextResponse.json({ error: "Missing hotelId or roomId." }, { status: 400 });
        }

        const { available } = await request.json();

        if (typeof available !== "number" || available < 0) {
            return NextResponse.json({ error: "Available rooms must be a number and cannot be negative." }, { status: 400 });
        }

        // Check if the hotel exists
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(id) }
        });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found." }, { status: 404 });
        }

        // Check if the user is the owner of the hotel (uncomment when ownerId is implemented)
        // if (hotel.ownerId !== user.id) {
        //     return NextResponse.json({ error: "You are not the owner of this hotel." }, { status: 403 });
        // }

        // Fetch the room details along with bookings
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomid) },
            include: { bookings: true },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found." }, { status: 404 });
        }

        // If decreasing availability, cancel bookings if necessary
        if (available < room.available) {
            const bookingsToCancel = room.bookings.slice(0, room.available - available);

            for (let booking of bookingsToCancel) {
                await prisma.booking.delete({
                    where: { id: booking.id },
                });
            }
        }

        // Update room availability
        const updatedRoom = await prisma.room.update({
            where: { id: parseInt(roomid) },
            data: { available },
        });

        return NextResponse.json(updatedRoom, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update room availability.", details: error.message }, { status: 500 });
    }
}
