import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function PUT(request) {
  try {
    // Get the bookingId from the query parameters
    const { hotelId, bookingId, userId, role} = getQueryParams(request.url, ["hotelId","userId", "bookingId", "role"]);
    
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }
    if (!hotelId) {
      return NextResponse.json({ error: "Hotel ID is required." }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "role is required." }, { status: 400 });
    }



    const user = await authenticate(request);

    
    // Check if the booking exists
    const booking = await prisma.hotelBooking.findUnique({
      where: { id: parseInt(bookingId), 
      },
    }
  );

         
    if(!user){
      return NextResponse.json(
        {error: "user not found"},
        {status: 404},
    )
    };

    // return NextResponse.json({error: `your booking: ${booking}`});
    

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }


    // Cancel the booking
    const canceledBooking = await prisma.hotelBooking.update({
      where: { id: parseInt(bookingId) },
      data: {
        status: "CANCELLED",
      },
    });

    await prisma.room.update({
      where: { id: booking.roomId },
      data: {
        available: { increment: 1 }, // Increment available rooms by 1
      },
    });

    const hotel1 = await prisma.hotel.findUnique({
      where:{id : Number(hotelId)},  
    });

    if(!hotel1){
      return NextResponse.json(
        {error: "Hotel not found"},
        {status: 404},
      )
    };
    const owner1 = await prisma.user.findUnique({
      where:{id : Number(hotel1.ownerId)},    
    });
    
    // return NextResponse.json({role: `my role: ${user.role}`})
         
    var notificationMessage = "";
    var newNotification= "";
    var owner= "";
    var user2="";
    var newNotification1;
    //return NextResponse.json({m: booking.userId})

    if(role === "HOTEL_OWNER"){
      notificationMessage = "Booking was cancelled by hotel Owner.";

      //create notification for the hotel_owner
      newNotification1 = await prisma.notification.create({
        data: {
          message: notificationMessage,
          userId: Number(userId),  // Link the notification to the user
          creator: "HOTEL_OWNER"
        },
      });
      
      owner = await prisma.user.findFirst({
        where: { id: Number(userId),
          role: "HOTEL_OWNER"
         }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
      });

      //create notification for the user
      newNotification = await prisma.notification.create({
        data: {
          message: notificationMessage,
          userId: booking.userId,  // Link the notification to the user
          creator: "HOTEL_OWNER"
        },
      });
      user2 = await prisma.user.findFirst({
        where: { 
          id: booking.userId , 
          role: "USER",
        }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });



    }
    
    if(role === "USER"){
      
      notificationMessage = "Booking was cancelled User.";    
      

      //create notification for the hotel_owner
      newNotification1 = await prisma.notification.create({
        data: {
          message: notificationMessage,
          userId: owner1.id,  // Link the notification to the user
          creator: "USER",
        },
      });
      owner = await prisma.user.findUnique({
        where: { id: owner1.id }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
      });


      //create notification for the user
      newNotification = await prisma.notification.create({
        data: {
          message: notificationMessage,
          userId: Number(userId),  // Link the notification to the user
          creator: "USER"
        },
      });

      user2 = await prisma.user.findUnique({
        where: { id: Number(userId) }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });

    }

    //remove the booking from the hotel bookings
    // await prisma.booking.delete({
    //   where: { id: bookingId as string },
    // });
    // const hotel2 = await prisma.hotelBooking.delete({
    //   where:{id : Number(hotelId)},  
    //   data:{
    //     bookings: {
    //       disconnect: { id: Number(bookingId) }, // Remove booking from the hotel's list
    //   }
    //   }
    // });

    const booking2 = await prisma.hotelBooking.findUnique({
      where: { id: parseInt(bookingId), 
      },
      include: {
          hotel: true
      }
    }
  );

    return NextResponse.json(
      { message: "Booking cancelled successfully.", booking: booking2, User_notification: user2, 
        hotel_owner_notif: owner.notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel booking.", details: error.message },
      { status: 500 }
    );
  }
}
