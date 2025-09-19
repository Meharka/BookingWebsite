import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import { BookingStatus} from "@prisma/client";
import { NEXT_BODY_SUFFIX } from 'next/dist/lib/constants';

function validateCreditCard(cardNumber) { // This function for validating credit card number uses the Luhn's algorithm and has been taken from ChatGptAI. 
  // Remove non-numeric characters (e.g., spaces, dashes)
  cardNumber = cardNumber.replace(/\D/g, '');

  let sum = 0;
  let shouldDouble = false;

  // Process each digit from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Equivalent to summing digits of numbers ≥ 10
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble; // Flip flag for next digit
  }

  return sum % 10 === 0; // ✅ Valid if sum is divisible by 10
}




export async function PUT(request, {params}){

    const {bookingid} = await params;//getQueryParams(request.url, ["booking_id"]);
    const { cardNum, cardExpiry, passportNumber} = await request.json();

    const booking_id = bookingid
    if(!booking_id || !cardExpiry || !cardNum){
      return NextResponse.json(
          {error: "Booking not found 1!"},
          {status: 404},
      )
  };

  
    const user1 = await authenticate(request);
    if(!user1){
      return NextResponse.json({error: "User unauthorized"}, {status: 400})
    }
    const user_find = await prisma.user.update({
        where : {
          id: user1.id}, 
        data:{
          passportNumber: passportNumber,
        }
        
        });
    
    const user = await prisma.user.findUnique({
      where: { id: user1.id }, // Assuming you extract userId correctly
      include: {
          notifications: true, // Explicitly include the notifications list
      }
  });

    const valid_card = validateCreditCard(cardNum);
    if (!valid_card){
        return NextResponse.json(

            {error: "The card is invalid"}, 
            {status: 400},
        );
    }
    const dateToday = new Date();
    const new_date = new Date(cardExpiry);
    if (dateToday > new_date){
        return NextResponse.json(
            {error: "The card is invalid"}, 
            {status: 400},
        );
    }
    // return NextResponse.json({mesage: booking_id});
    const combined_booking = await prisma.booking.findUnique({
        where: {
            id: Number(booking_id)
        }, 
        include: {
            flightBookings: true,
            hotelBookings: true,
        }
    })
    var user_found;
    if(combined_booking.flightBookings.length>0){
    const booking_find = await prisma.flightBooking.findUnique({
      where : {
        id: combined_booking.flightBookings[0].id},
        include: {  //  Include flights in the response
          flights: true
      }

      });

      if((booking_find.status) === BookingStatus.CONFIRMED){
        return NextResponse.json({message: "The booking was already confirmed. "})

        }


        const flight_ids = booking_find.flights.map(flight => flight.id);

        //return NextResponse.json({store: flight_ids});
        const response2 = await fetch(`https://advanced-flights-system.replit.app/api/bookings`,{
        method: 'POST', 
        headers: {
            'x-api-key': "6059305f870693b3539191e685362d05e4ac85960ff591900d3ca1cb2ed462bd",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
                firstName: user.first_name, 
                lastName: user.last_name,
                email: user.email,
                passportNumber: String(user.passportNumber).trim(), 
                flightIds: flight_ids,
            }
        ),
        });
        const booking2 = await response2.json();

        if(!booking2){
        return NextResponse.json(
            {error: "Booking couldn't be confirmed"},
            {status: 404},
        )
        };
        //return NextResponse.json({booking: combined_booking.flightBookings[0].id})

        const confirmed_booking = await prisma.flightBooking.update({
            where : {id: combined_booking.flightBookings[0].id}, 
            data: { 
            status: BookingStatus.CONFIRMED,
            reference: booking2.bookingReference,       
            }
            , 
            include: {
                flights: true,
            }

            });
        
        const notif = await prisma.notification.create({
        data:{
            userId: user1.id,
            message: "Your Flight booking was successfully created",

        },

        });
        //return NextResponse.json({m: user.notifications})
        user_found = await prisma.user.findUnique({
        where: { id: user1.id }, // Assuming you extract userId correctly
        include: {
            notifications: true, // Explicitly include the notifications list
        }
    });
    }
    var owner= "";
    var user2="";
    if(combined_booking.hotelBookings.length>0){
        const userId = user.id;
        const valid_card = validateCreditCard(cardNum);
            if (!valid_card){
                return NextResponse.json(
                    {error: "The card is invalid"}, 
                    {status: 400},
                );
            }
            const dateToday = new Date();
            const new_date = new Date(cardExpiry);
            if (dateToday > new_date){
                return NextResponse.json(
                    {error: "The card is invalid"}, 
                    {status: 400},
                );
            }
        
            const confirmed_booking = await prisma.hotelBooking.update({
                where : { 
                  id: (combined_booking.hotelBookings[0].id) 
                }, 
                data: { status: BookingStatus.CONFIRMED},
                include: {  //  Include hotels in the response
                  hotel: true
              }
            });
            //return NextResponse.json({confirm: confirmed_booking});
            const hotel1 = await prisma.hotel.findUnique({
              where:{id : Number(confirmed_booking.hotelId)},    
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
            if(!owner1){
              return NextResponse.json(
                  {error: "Owner not found"},
                  {status: 404},
              )
              };
              console.log("owner:", owner1)
            //   var owner= "";
            //   var user2="";
         
              //return NextResponse.json({m: booking.userId})
        
              if(user.role === "HOTEL_OWNER"){
                return NextResponse.json({message: "You cannot create a booking as a HOTEL_OWNER"})
          
              }
        
        
            const notif = await prisma.notification.create({
                data:{
                  userId: owner1.id,
                  message: `A booking was made for ${hotel1.name}`,
                  creator: owner1.role,
                },
              });
              owner = await prisma.user.findUnique({
                where: { id: owner1.id }, // Assuming you extract userId correctly
                include: {
                     notifications: true, // Explicitly include the notifications list
                }
              });
        
        
        
              const notif2 = await prisma.notification.create({
                data:{
                  userId: user.id,
                  message: `A booking was made for ${hotel1.name}`,
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

    
    //return NextResponse.json({store: booking_find.flights});
    const combined_booking2 = await prisma.booking.findUnique({
        where: {
            id: Number(booking_id)
        }, 
        include: {
            flightBookings: true,
            hotelBookings: true,
        }
    })
    
  //return NextResponse.json(({m: user_found.notifications}));
    if(combined_booking2.flightBookings.length > 0 & combined_booking2.hotelBookings.length>0){
    return NextResponse.json({
      booking: combined_booking2,
      Usernotification: user2.notifications, HotelownerNotif: owner.notifications}, 
  { status: 200 });}
  else if (combined_booking2.flightBookings.length > 0 & !(combined_booking2.hotelBookings.length>0)){
    return NextResponse.json({
        booking: combined_booking2,
        usernotification: user_found.notifications}, 
    { status: 200 });
  }else {
    return NextResponse.json({
        booking: combined_booking2,
        usernotif: user2.notifications,
        HotelownerNotif: owner.notifications}, 
    { status: 200 });
  }


}



