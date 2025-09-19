import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";



export async function PUT(request) {
  try {
    // Get the bookingId from the query parameters
    const { bookingId, userId, role, hotel, flight} = await request.json();//getQueryParams(request.url, ["hotel", "flight","userId", "bookingId", "role" ]);
    
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }
    // if (!) {
    //   return NextResponse.json({ error: "Hotel ID is required." }, { status: 400 });
    // }
    if (!role) {
      return NextResponse.json({ error: "role is required." }, { status: 400 });
    }
    //return NextResponse.json({m: [bookingId, userId, role, hotel, flight] })



    const user = await authenticate(request);
         
    if(!user){
        return NextResponse.json(
          {error: "user not found"},
          {status: 404},
      )
      };



    const combined_booking = await prisma.booking.findFirst({
        where : { id: parseInt(bookingId), 
        },
        include: {
            flightBookings: true,
            hotelBookings: true
        }
    })
    //return NextResponse.json({m: combined_booking})
    //length
    // Cancel the booking
    var notificationMessage = "";
    var newNotification= "";
    var owner= "";
    var user2="";
    var newNotification1;

    if(hotel){
        var booking; 
        console.log("reached12")
        //return NextResponse.json({m: combined_booking})
        if(combined_booking.hotelBookings.length >0){
            booking = await prisma.hotelBooking.findUnique({
            where: { id: combined_booking.hotelBookings[0].id 
            },
            include: {hotel: true}
                }
            );
            if (!booking) {
                return NextResponse.json({ error: "Booking not found." }, { status: 404 });
            }

    //return NextResponse.json({m: booking})
    const canceledBooking = await prisma.hotelBooking.update({
      where: { id: combined_booking.hotelBookings[0].id  },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });
      

    await prisma.room.update({
      where: { id: booking.roomId },
      data: {
        available: { increment: 1 }, // Increment available rooms by 1
      },
    });

    const hotel1 = await prisma.hotel.findUnique({
      where:{id : booking.hotel.id},  
      include: {bookings: true}
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
         
   
    //return NextResponse.json({m: booking.userId})

    if(role === "HOTEL_OWNER"){
      notificationMessage = "Hotel booking was cancelled by hotel Owner.";

      //create notification for the hotel_owner
      newNotification1 = await prisma.notification.create({
        data: {
          message: notificationMessage,
          userId: Number(userId),  // Link the notification to the user
          creator: "HOTEL_OWNER"
        },
      });
      //return NextResponse.json({m: userId})
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
          //role: "USER",
        }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });
    console.log("reached12345")

    //return NextResponse.json({m: owner})

    }
    
    if(role === "USER"){
      
      notificationMessage = "Hotel booking was cancelled User.";    
      

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
    //for (let i = 0; i< hotel.bookings.length; i++){}
    // var hotelId= combined_booking.hotelBookings[0].id
    // console.log("reached1")
    //console.log(`cacnelledbookingid= ${canceledBooking.id}`)
     
    // for (var y = 0; y< combined_booking.hotelBookings.length; y++){
    //     if(canceledBooking.id === combined_booking.hotelBookings[y].id){
    //         console.log("reached inside")
    //         combined_booking.hotelBookings.splice(y, 1);}
    // }
    //return NextResponse.json({m:combined_booking})
    //console.log("reached2")
    
    // for (let z=0; z < hotel1.bookings.length; z++){
    //    // return NextResponse.json({m: hotel1.bookings[z].id})
    //     if(hotel1.bookings[z].id === booking.id){
    //         hotel1.bookings.splice(z,1);
    //         console.log("reached3.1")
    //         }
    //     break;
    // };
    // console.log("reached3.2")
    // const check_booking = await prisma.booking.findUnique({
    //     where: {id: Number(bookingId)}, 
    //     include: {
    //         flightBookings: true, 
    //         hotelBookings: true
    //     }
    // })
    //return NextResponse.json({m: check_booking})
    //return NextResponse.json({m: combined_booking})
    // const hotel2 = await prisma.hotel.update({
    //   where:{id : booking.hotel.id},  
    //   data:{
    //     bookings: {
    //       disconnect: { id: hotelId }, // Remove booking from the hotel's list
    //   }
    //   }
    // });
        }
    }   
    //"Booking was cancelled User."
    //console.log("reached3.3")
    
    var user3;
    

    if(flight){
        var booking2;
        if(combined_booking.flightBookings.length >0){
            booking2 = await prisma.flightBooking.findUnique({
                where: { id: combined_booking.flightBookings[0].id 
                    },
                }
            );
            

        const canceledBooking3 = await prisma.flightBooking.update({
            where: { id: combined_booking.flightBookings[0].id  },
            data: {
              status: BookingStatus.CANCELLED,
            },
            include: {
                flights: true
            }
          });


          const response2 = await fetch(`https://advanced-flights-system.replit.app/api/bookings/cancel`,{
            method: 'POST', 
            headers: {
                'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                    bookingReference: canceledBooking3.reference, 
                    lastName: user.last_name,
                    
                }
            ),
            });
            const booking_2 = await response2.json();
            //return NextResponse.json({m: booking_2})
            const canceledBooking2 = await prisma.flightBooking.update({
                where: { id: combined_booking.flightBookings[0].id  },
                data: {
                  status: BookingStatus.CANCELLED,
                },
                include: {
                    flights: true
                }
              });
              var flightIDS2 = []
              for(let a=0; a< canceledBooking3.flights.length>0; a++){
                    flightIDS2.push(canceledBooking3.flights[a].id)
              }
              //return NextResponse.json({m: flightIDS2})




              const flightRecords = await Promise.all(
                flightIDS2.map(async (flightId) => {
                    const flight = canceledBooking3.flights.find(f => f.id === flightId);
                    //console.log(`we got ${flightId} time`)
        
                    if (!flight) {
                        return NextResponse.json({message: `Flight with ID ${flightId} not found in API response`});
                    }
                    //console.log(`Flight ${flightId} - createdAt: ${flight.createdAt}, updatedAt: ${flight.updatedAt}`);
                    return prisma.flight.update({
                        where: { id: flightId },
                        data: {
                            availableSeats: (flight.availableSeats + 1),
                        }, // Do nothing if it already exists
                        
                    });
                })
            );

            const flights = await prisma.flight.findMany({
                where: { id: { in: flightIDS2 } },
                orderBy: { departureTime: "asc" },
                include: {
                    origin: true,
                    destination: true
                }
              });
            //return NextResponse.json({m: flights})
            


        
        
            
        const notificationMessage2 = 'Your flight Booking was cancelled';    
      
      
            //create notification for the user
            const newNotification2 = await prisma.notification.create({
              data: {
                message: notificationMessage2,
                userId: Number(userId),  // Link the notification to the user
                creator: "USER"
              },
            });
      
            user3 = await prisma.user.findUnique({
              where: { id: Number(userId) }, // Assuming you extract userId correctly
              include: {
                  notifications: true, // Explicitly include the notifications list
              }
          });

        }


    }
    

   
    const combinationFlight = await prisma.booking.findFirst({
      where : { id: parseInt(bookingId), 
      },
      include: {
        flightBookings: true,
        hotelBookings: true
    }

    })
    console.log(hotel,flight)
    if(hotel && flight){
    return NextResponse.json(
      { message: "Booking cancelled successfully.", booking: combinationFlight, User_notification: user3.notifications, 
            hotel_owner_notif: owner.notifications,
            },
            { status: 200 }
        );
    }
    else if(!hotel && flight){
        return NextResponse.json(
            { message: "flight Booking cancelled successfully.", booking: combinationFlight, User_notification: user3.notifications},
            { status: 200 }
          );
    }
    else{
        console.log("reached again")
        return NextResponse.json(
            { message: "Hotel Booking cancelled successfully.", booking: combinationFlight, User_notification: user2.notifications, 
                hotel_owner_notif: owner.notifications,
            },
            { status: 200 }
          );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel booking.", details: error.message },
      { status: 500 }
    );
  }
}
