import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";



export async function GET(request, {params}) {
  const { bookingId, userId } = getQueryParams(request.url, [
      "bookingId",
      "userId",
   ]);
   //const {bookingId} = await params;
   
  //  return NextResponse.json(
  //   {error: `your id: ${userId}, your bookingid: ${bookingId}`},
  //   {status: 404},
  // );
  const user = await authenticate(request);
  
  if(!bookingId || !userId){
      return NextResponse.json(
          {error: "Booking not found!"},
          {status: 404},
      )
  };

  const booking = await prisma.hotelBooking.findFirst({
      where: {
          id: {equals: Number(bookingId)},
          userId: {equals: Number(userId),

          },
        
      },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
  return NextResponse.json(booking);


}


// export async function DELETE(request) {
//     try {
//       // Get the bookingId from the query parameters
//       const {hotelId, bookingId} = getQueryParams(request.url, ["hotelId", "bookingId"]);

//       const user = await authenticate(request);
  
//       if (!bookingId) {
//         return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
//       }
  
//       // Check if the booking exists
//       const booking = await prisma.hotelBooking.findUnique({
//         where: { id: parseInt(bookingId) },
//       });
  
//       if (!booking) {
//         return NextResponse.json({ error: "Booking not found." }, { status: 404 });
//       }
  
//       // Ensure the user is the owner of the hotel for the booking
//       const hotel = await prisma.hotel.findUnique({
//         where: { id: booking.hotelId },
//         select: { ownerId: true },
//       });
  

//       // Cancel the booking
//       const canceledBooking = await prisma.hotelBooking.update({
//         where: { id: parseInt(bookingId) },
//         data: {
//           status: "CANCELLED",
//         },
//       });

//       await prisma.room.update({
//         where: { id: booking.roomId },
//         data: {
//           available: { increment: 1 }, // Increment available rooms by 1
//         },
//       });

//       user.notifications.push({message: "Your booking was successfully cancelled."})
  
//       return NextResponse.json(
//         { message: "Booking cancelled successfully.", booking: canceledBooking },
//         { status: 200 }
//       );
//     } catch (error) {
//       return NextResponse.json(
//         { error: "Failed to cancel booking.", details: error.message },
//         { status: 500 }
//       );
//     }
//   }